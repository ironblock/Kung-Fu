#!/usr/bin/env python3
"""Build the variants of a set of tasks.

Usage: build.py <ast-grep binary> [--set NAME] [variant ...]

For each variant this writes, under `built/<set>/<variant>/`:

  clean/src     the code a subject sees
  oracle.json   the expected matches of each task
  tasks.json    the wording of each task
  answers.txt   the reference answers

Each is made from the set's own files, with the names of its `set.json` put in.
The build stops unless every reference answer starts on exactly the marked lines,
in every variant. It also stops unless variant 0 is the set itself, byte for byte.

With no set named, the pilot is built. With no variant named, all are built.
`built/` is not kept in the repository.

A set with more than one body of code (see sets.py) is built body by body, each
under `built/<set>/<variant>/bodies/<body>/`, and `oracle.json` holds every task.
Such a set is also checked, and the build stops when a check fails:

  the copy check   in a body with two tasks, the reference answer of each, handed
                   in for the other, must not pass. Else a subject that was given
                   one answer could pass the other task by copying it
  the plain check  no plain command may pass a task. A plain command is
                   `ast-grep outline src` with at most one `--type` that names one
                   kind of item the body's code holds, and at most one `--match`
                   that is one word of the task's wording found in that code, as
                   it stands. Else the task can be passed by a first guess

What the checks tried and found is written to `pairs.json`.
"""
import importlib.util, json, os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import sets  # noqa: E402
import variants  # noqa: E402

# The pilot's build step has this file's name, so it is loaded by its path.
_spec = importlib.util.spec_from_file_location("pilot_build", os.path.join(sets.where("pilot"), "build.py"))
pilot_build = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(pilot_build)


def read(path):
    return open(path, encoding="utf-8").read()


def right(binary, command, expected, clean):
    """(whether a command lists what is expected, how many it misses, how many it lists besides)."""
    got, _ = pilot_build.grade.run(binary, command, clean)
    if isinstance(got, str):
        return False, len(expected), 0
    missed, extra, _ = pilot_build.grade.judge(got, expected)
    return not missed and not extra, len(missed), len(extra)


def kinds(binary, clean):
    """The kinds of top-level item the code under `clean/src` holds, as the tool names them."""
    out = subprocess.run([binary, "outline", "src", "--items", "all", "--json=stream"], cwd=clean,
                         capture_output=True, text=True, stdin=subprocess.DEVNULL)
    return sorted({item["symbolType"] for line in out.stdout.splitlines() for item in json.loads(line).get("items") or []})


def plain(wording, in_code, held):
    """Every plain command for one task: see the top of this file."""
    words = sorted({word for word in variants.WORD.findall(wording) if word in in_code})
    return ["ast-grep outline" + (f" --type {kind}" if kind else "") + (f" --match {word}" if word else "") + " src"
            for kind in [None] + held for word in [None] + words]


def checked(binary, bodies, clean_of, in_code_of, oracle, answers, worded):
    """(what is wrong with the pairs of a set, what the checks tried and found)."""
    wrong, found = [], {}
    for body, tasks in bodies.items():
        clean = clean_of[body]
        held = kinds(binary, clean)
        found[body] = {"tasks": list(tasks), "kinds of item in the code": held, "copy check": {}, "plain commands": {}}
        if len(tasks) == 2:
            for mine, other in (tasks, tasks[::-1]):
                passes, missed, extra = right(binary, answers[mine], oracle[other], clean)
                found[body]["copy check"][f"the answer of {mine}, handed in for {other}"] = {
                    "passes": passes, "misses": missed, "lists besides": extra}
                if passes:
                    wrong.append(f"{body}: the reference answer of {mine} passes {other} too")
        for task in tasks:
            tried = []
            for command in plain(worded[task], in_code_of[body], held):
                passes, missed, extra = right(binary, command, oracle[task], clean)
                tried.append({"command": command, "passes": passes, "misses": missed, "lists besides": extra})
                if passes:
                    wrong.append(f"{body}: {task} is passed by a plain command: {command}")
            found[body]["plain commands"][task] = tried
    return wrong, found


def main():
    args = sys.argv[1:]
    name = "pilot"
    if "--set" in args:
        at = args.index("--set")
        name = args[at + 1]
        del args[at:at + 2]
    if not args:
        sys.exit("usage: build.py <ast-grep binary> [--set NAME] [variant ...]")
    binary = os.path.abspath(args[0])
    home = sets.where(name)
    told = sets.about(name)
    names = told["names"]
    wanted = [int(v) for v in args[1:]] or list(range(variants.count(names)))
    bodies = told["bodies"]
    # One body of code for the whole set, named "", unless the set names its bodies.
    files = {}
    for body in bodies or [""]:
        marked = os.path.join(home, "marked", body, "src")
        files[body] = {each: read(os.path.join(marked, each)) for each in sorted(os.listdir(marked))}
    in_code = set(variants.WORD.findall("\n".join(text for of_body in files.values() for text in of_body.values())))
    tasks = read(os.path.join(home, "tasks.md"))
    answers = read(os.path.join(home, "reference", "answers.txt"))
    plain = dict(re.findall(r"^(T\d\d)\. (.+)$", tasks, re.M))

    for variant in wanted:
        if not 0 <= variant < variants.count(names):
            sys.exit(f"build.py: `{name}` has no variant {variant}. It has {variants.count(names)}, from 0.")
        wrong = variants.faults(names, variant, in_code)
        if wrong:
            sys.exit("build.py: " + "; ".join(wrong))
        out = sets.built(name, variant)
        shutil.rmtree(out, ignore_errors=True)
        new_tasks = variants.wording(tasks, names, variant)
        new_answers = variants.answer(answers, names, variant)
        assert variant or (new_tasks, new_answers) == (tasks, answers), "variant 0 changes the tasks or the answers"
        new_wrappers = {task: variants.answer(rule, names, variant) for task, rule in told["wrappers"].items()}
        lines = [line for line in new_answers.splitlines() if line.strip()]
        counts, oracle, clean_of, in_code_of = {}, {}, {}, {}
        for body, of_body in files.items():
            there = os.path.join(out, "bodies", body) if body else out
            os.makedirs(os.path.join(there, "marked", "src"))
            for each, text in of_body.items():
                new = variants.code(text, names, variant)
                assert variant or new == text, f"variant 0 changes {each}"
                open(os.path.join(there, "marked", "src", each), "w", encoding="utf-8").write(new)
            mine = [line for line in lines if not body or line.split(":", 1)[0] in bodies[body]]
            counts.update(pilot_build.build(binary, os.path.join(there, "marked"), mine, there, new_wrappers))
            shutil.rmtree(os.path.join(there, "marked"))
            if body:
                oracle.update(json.load(open(os.path.join(there, "oracle.json"))))
                clean_of[body] = os.path.join(there, "clean")
                in_code_of[body] = set(variants.WORD.findall("\n".join(
                    variants.code(text, names, variant) for text in of_body.values())))
        worded = dict(re.findall(r"^(T\d\d)\. (.+)$", new_tasks, re.M))
        assert sorted(worded) == sorted(counts), "a task has a wording and no answer, or the other way round"
        if bodies:
            json.dump(oracle, open(os.path.join(out, "oracle.json"), "w"), indent=1)
            wrong, found = checked(binary, bodies, clean_of, in_code_of, oracle,
                                   dict(line.split(": ", 1) for line in lines), worded)
            json.dump(found, open(os.path.join(out, "pairs.json"), "w", encoding="utf-8"), indent=1)
            if wrong:
                sys.exit("build.py: " + "; ".join(wrong))
        json.dump(worded, open(os.path.join(out, "tasks.json"), "w", encoding="utf-8"), indent=1)
        open(os.path.join(out, "answers.txt"), "w", encoding="utf-8").write(new_answers)
        changed = sum(worded[task] != plain[task] for task in worded)
        print(f"{name}, variant {variant}: {len(worded)} tasks, {sum(counts.values())} expected matches,"
              f" {changed} tasks worded with other names")


if __name__ == "__main__":
    main()

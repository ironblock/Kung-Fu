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
"""
import importlib.util, json, os, re, shutil, sys

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
    marked = os.path.join(home, "marked", "src")
    files = {each: read(os.path.join(marked, each)) for each in sorted(os.listdir(marked))}
    in_code = set(variants.WORD.findall("\n".join(files.values())))
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
        os.makedirs(os.path.join(out, "marked", "src"))
        for each, text in files.items():
            new = variants.code(text, names, variant)
            assert variant or new == text, f"variant 0 changes {each}"
            open(os.path.join(out, "marked", "src", each), "w", encoding="utf-8").write(new)
        new_tasks = variants.wording(tasks, names, variant)
        new_answers = variants.answer(answers, names, variant)
        assert variant or (new_tasks, new_answers) == (tasks, answers), "variant 0 changes the tasks or the answers"
        new_wrappers = {task: variants.answer(rule, names, variant) for task, rule in told["wrappers"].items()}
        counts = pilot_build.build(binary, os.path.join(out, "marked"),
                                   [line for line in new_answers.splitlines() if line.strip()], out, new_wrappers)
        shutil.rmtree(os.path.join(out, "marked"))
        worded = dict(re.findall(r"^(T\d\d)\. (.+)$", new_tasks, re.M))
        assert sorted(worded) == sorted(counts), "a task has a wording and no answer, or the other way round"
        json.dump(worded, open(os.path.join(out, "tasks.json"), "w", encoding="utf-8"), indent=1)
        open(os.path.join(out, "answers.txt"), "w", encoding="utf-8").write(new_answers)
        changed = sum(worded[task] != plain[task] for task in worded)
        print(f"{name}, variant {variant}: {len(worded)} tasks, {sum(counts.values())} expected matches,"
              f" {changed} tasks worded with other names")


if __name__ == "__main__":
    main()

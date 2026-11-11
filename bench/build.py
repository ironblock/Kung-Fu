#!/usr/bin/env python3
"""Build the variants of the pilot's tasks.

Usage: build.py <ast-grep binary> [variant ...]

For each variant this writes, under `built/<variant>/`:

  clean/src     the code a subject sees
  oracle.json   the expected matches of each task
  tasks.json    the wording of each task
  answers.txt   the reference answers

Each is made from the pilot's own files with the names of `variants.py` put in.
The build stops unless every reference answer starts on exactly the marked lines,
in every variant. It also stops unless variant 0 is the pilot, byte for byte.

With no variant named, all are built. `built/` is not kept in the repository.
"""
import importlib.util, json, os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PILOT = os.path.join(os.path.dirname(HERE), "pilot")
sys.path.insert(0, HERE)
sys.path.insert(1, PILOT)
import variants  # noqa: E402

# The pilot's build step has this file's name, so it is loaded by its path.
_spec = importlib.util.spec_from_file_location("pilot_build", os.path.join(PILOT, "build.py"))
pilot_build = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(pilot_build)


def read(path):
    return open(path, encoding="utf-8").read()


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: build.py <ast-grep binary> [variant ...]")
    binary = os.path.abspath(sys.argv[1])
    wanted = [int(v) for v in sys.argv[2:]] or list(range(variants.COUNT))
    marked = os.path.join(PILOT, "marked", "src")
    files = {name: read(os.path.join(marked, name)) for name in sorted(os.listdir(marked))}
    in_code = set(variants.WORD.findall("\n".join(files.values())))
    tasks = read(os.path.join(PILOT, "tasks.md"))
    answers = read(os.path.join(PILOT, "reference", "answers.txt"))

    for variant in wanted:
        if not 0 <= variant < variants.COUNT:
            sys.exit(f"build.py: there is no variant {variant}. There are {variants.COUNT}, from 0.")
        wrong = variants.faults(variant, in_code)
        if wrong:
            sys.exit("build.py: " + "; ".join(wrong))
        out = os.path.join(HERE, "built", str(variant))
        shutil.rmtree(out, ignore_errors=True)
        os.makedirs(os.path.join(out, "marked", "src"))
        for name, text in files.items():
            new = variants.code(text, variant)
            assert variant or new == text, f"variant 0 changes {name}"
            open(os.path.join(out, "marked", "src", name), "w", encoding="utf-8").write(new)
        new_tasks = variants.wording(tasks, variant)
        new_answers = variants.answer(answers, variant)
        assert variant or (new_tasks, new_answers) == (tasks, answers), "variant 0 changes the tasks or the answers"
        counts = pilot_build.build(binary, os.path.join(out, "marked"),
                                   [line for line in new_answers.splitlines() if line.strip()], out)
        shutil.rmtree(os.path.join(out, "marked"))
        worded = dict(re.findall(r"^(T\d\d)\. (.+)$", new_tasks, re.M))
        assert sorted(worded) == sorted(counts), "a task has a wording and no answer, or the other way round"
        json.dump(worded, open(os.path.join(out, "tasks.json"), "w", encoding="utf-8"), indent=1)
        open(os.path.join(out, "answers.txt"), "w", encoding="utf-8").write(new_answers)
        changed = sum(worded[t] != dict(re.findall(r"^(T\d\d)\. (.+)$", tasks, re.M))[t] for t in worded)
        print(f"variant {variant}: {len(worded)} tasks, {sum(counts.values())} expected matches,"
              f" {changed} tasks worded with other names")


if __name__ == "__main__":
    main()

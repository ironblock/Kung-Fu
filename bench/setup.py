#!/usr/bin/env python3
"""Make ready one run of one subject on one task.

Usage: setup.py <ast-grep binary> <work directory> <run> <arm> <task> [--closed]
                [--material FILE ...]

One subject gets one task. So each task has a cost of its own.

This writes two things.

In the work directory, which is outside this repository, a directory for the
subject: `task.md`, and unless `--closed` is given, the code under `src` and
`bin/ast-grep`. That `ast-grep` writes down every call the subject makes, and then
runs the real program. Any `--material` file is copied in beside `task.md`.

In this repository, under `runs/<run>/<arm>/<task>/`: `request.md`, the words to
send to the subject, made before any subject sees them. `setup.json` says where
the subject's directory is and what was put in it.

Run `pilot/build.py` first: the code a subject sees is `pilot/clean`.
"""
import argparse, json, os, re, shutil, stat, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PILOT = os.path.join(os.path.dirname(HERE), "pilot")
# Where runs are kept. The self-check keeps its own somewhere else.
RUNS = os.environ.get("KUNG_FU_RUNS") or os.path.join(HERE, "runs")

WRAPPER = '''#!/usr/bin/env python3
# Every call is written down. Then the real program runs, and its answer is passed on.
import json, os, subprocess, sys, time
started = time.time()
status = subprocess.call([{real!r}] + sys.argv[1:])
with open({log!r}, "a") as log:
    log.write(json.dumps({{"at": started, "took": time.time() - started, "cwd": os.getcwd(),
                          "argv": sys.argv[1:], "status": status}}) + "\\n")
sys.exit(status)
'''

TASK = '''# Task

Write one `ast-grep` command. The code to search is under `src/`: JavaScript files (`.js`), TypeScript files (`.ts`) and Python files (`.py`).

Rules for the answer:

- One line in `answer.txt`, in the form `ast-grep run ...` or `ast-grep scan --inline-rules '...' ...`.
- A single command, with `src` as the path to search. No pipes, no other programs, no rule files, nothing that rewrites code.
- It will be run with ast-grep 0.51.1, from the directory that contains `src`.
- It is graded on what it matches. It must match every piece of code the task describes, once each, and nothing else.

The task:

{task}
'''

OPEN = '''Work only in the directory {dir}

It contains task.md, a directory src with the code the task is about, and bin/ast-grep (ast-grep 0.51.1).{material} Put bin on your PATH:

export PATH={dir}/bin:$PATH

Read task.md. You may read the code under src and run ast-grep as often as you like, from that directory. Do not read any file outside that directory and do not use the network. Do not change anything under src.

Write your answer to answer.txt in that directory, in the form task.md describes.

When you are done, report back in this exact structure and nothing else:
A. One sentence, in your own words: what the task asks you to find.
B. One word for how sure you are of your answer: sure, unsure, or guess.
'''

CLOSED = '''Work only in the directory {dir}

It contains task.md.{material} Read it. Then write your answer to answer.txt in that same directory, in the form task.md describes.

Conditions:
- You cannot run ast-grep. It is not installed for you. Do not try to install it, do not search the machine for it, and do not use the network.
- Do not read any file outside that directory.
- Answer from what you know and from the files in that directory.
- Write the file once. Do not revise it after writing.

When you are done, report back in this exact structure and nothing else:
A. One sentence, in your own words: what the task asks you to find.
B. One word for how sure you are of your answer: sure, unsure, or guess.
'''


def tasks():
    """The tasks of the pilot, by name: `T01` and so on."""
    found = {}
    for line in open(os.path.join(PILOT, "tasks.md"), encoding="utf-8"):
        m = re.match(r"(T\d\d)\. (.+)", line.strip())
        if m:
            found[m.group(1)] = m.group(2)
    return found


def main():
    parser = argparse.ArgumentParser(description="Make ready one run of one subject on one task.")
    parser.add_argument("binary", help="the real ast-grep program")
    parser.add_argument("work", help="a directory outside this repository, for the subject's files")
    parser.add_argument("run", help="a name for this run, such as 2026-11-11-check")
    parser.add_argument("arm", help="a name for what the subject is given, such as none")
    parser.add_argument("task", help="a task of the pilot, such as T08")
    parser.add_argument("--closed", action="store_true", help="no code and no tool: the subject only writes")
    parser.add_argument("--material", nargs="*", default=[], help="files to put beside task.md")
    args = parser.parse_args()

    for word in (args.run, args.arm):
        if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", word):
            sys.exit(f"setup.py: `{word}` should be letters, digits, `.`, `_` and `-`")
    all_tasks = tasks()
    if args.task not in all_tasks:
        sys.exit(f"setup.py: no task `{args.task}` in pilot/tasks.md")
    clean = os.path.join(PILOT, "clean", "src")
    if not args.closed and not os.path.isdir(clean):
        sys.exit("setup.py: pilot/clean is not there. Run pilot/build.py first.")

    kept = os.path.join(RUNS, args.run, args.arm, args.task)
    if os.path.exists(os.path.join(kept, "request.md")):
        sys.exit(f"setup.py: {kept} already holds a request. A run is set up once.")
    work = os.path.join(os.path.abspath(args.work), args.run, args.arm, args.task)
    if os.path.exists(work):
        sys.exit(f"setup.py: {work} is already there")
    os.makedirs(work)
    os.makedirs(kept, exist_ok=True)

    with open(os.path.join(work, "task.md"), "w", encoding="utf-8") as f:
        f.write(TASK.format(task=all_tasks[args.task]))
    names = []
    for path in args.material:
        names.append(os.path.basename(path))
        shutil.copyfile(path, os.path.join(work, names[-1]))
    log = work + ".calls.jsonl"
    if not args.closed:
        shutil.copytree(clean, os.path.join(work, "src"))
        os.makedirs(os.path.join(work, "bin"))
        wrapper = os.path.join(work, "bin", "ast-grep")
        with open(wrapper, "w", encoding="utf-8") as f:
            f.write(WRAPPER.format(real=os.path.abspath(args.binary), log=log))
        os.chmod(wrapper, os.stat(wrapper).st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)

    material = ""
    if names:
        listed = names[0] if len(names) == 1 else ", ".join(names[:-1]) + " and " + names[-1]
        material = f" It also contains {listed}: read {'it' if len(names) == 1 else 'them'} too."
    request = (CLOSED if args.closed else OPEN).format(dir=work, material=material)
    with open(os.path.join(kept, "request.md"), "w", encoding="utf-8") as f:
        f.write(request)
    with open(os.path.join(kept, "setup.json"), "w", encoding="utf-8") as f:
        json.dump({"run": args.run, "arm": args.arm, "task": args.task, "closed": args.closed,
                   "work": work, "calls": None if args.closed else log, "material": names}, f, indent=1)
        f.write("\n")
    print(f"The subject's directory: {work}")
    print(f"The request to send:     {os.path.join(kept, 'request.md')}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Make ready one run of one subject on one task.

Usage: setup.py <ast-grep binary> <work directory> <run> <arm> <task> [--set NAME]
                [--variant N] [--closed] [--material FILE ...] [--again]

One subject gets one task. So each task has a cost of its own. One try at a task
uses one variant of it: `build.py` makes the variants.

This writes two things.

In the work directory, which is outside this repository, a directory for the
subject: `task.md`, and unless `--closed` is given, the code under `src` and
`bin/ast-grep`. That `ast-grep` writes down every call the subject makes, and then
runs the real program. Code that the subject pipes in for `--stdin` is written
down with the call. Any `--material` file is copied in beside `task.md`.

In this repository, under `runs/<run>/<arm>/<task>/v<N>/`: `request.md`, the words
to send to the subject, made before any subject sees them. `setup.json` says where
the subject's directory is and what was put in it.

`--again` is for a try whose subject stopped before it finished, as when a harness
runs out of usage. It empties the subject's directory and makes it anew. It does
this only for a try that has not been kept, and only when the request comes out
the same, word for word, as the one on file.

Run `build.py` first: the code a subject sees is `built/<set>/<N>/clean`. With no
set named, the task is one of the pilot's.
"""
import argparse, json, os, re, shutil, stat, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import sets  # noqa: E402
# Where runs are kept. The self-check keeps its own somewhere else.
RUNS = os.environ.get("KUNG_FU_RUNS") or os.path.join(HERE, "runs")

WRAPPER = '''#!/usr/bin/env python3
# Every call is written down. Then the real program runs, and its answer is passed on.
import json, os, subprocess, sys, time
started = time.time()
# Code that is piped in for --stdin is written down with the call, and then passed on as it came.
piped = None
if "--stdin" in sys.argv[1:] and sys.stdin is not None and not sys.stdin.isatty():
    piped = sys.stdin.buffer.read()
status = subprocess.run([{real!r}] + sys.argv[1:], input=piped).returncode
call = {{"at": started, "took": time.time() - started, "cwd": os.getcwd(), "argv": sys.argv[1:], "status": status}}
if piped is not None:
    call["stdin"] = piped.decode("utf-8", "replace")
with open({log!r}, "a") as log:
    log.write(json.dumps(call) + "\\n")
sys.exit(status)
'''

TASK = '''# Task

Write one `ast-grep` command. {code}

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

Read task.md. You may read the code under src and run ast-grep as often as you like, from that directory. Do not read or write any file outside that directory, and do not use the network. If you need a file of your own, make it in that directory. Do not change anything under src.

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


def main():
    parser = argparse.ArgumentParser(description="Make ready one run of one subject on one task.")
    parser.add_argument("binary", help="the real ast-grep program")
    parser.add_argument("work", help="a directory outside this repository, for the subject's files")
    parser.add_argument("run", help="a name for this run, such as 2026-11-11-check")
    parser.add_argument("arm", help="a name for what the subject is given, such as none")
    parser.add_argument("task", help="a task of the set, such as T08")
    parser.add_argument("--set", default="pilot", help="which set of tasks: the pilot's, with none named")
    parser.add_argument("--variant", type=int, default=0, help="which variant of the task: 0 is the pilot's own")
    parser.add_argument("--closed", action="store_true", help="no code and no tool: the subject only writes")
    parser.add_argument("--material", nargs="*", default=[], help="files to put beside task.md")
    parser.add_argument("--again", action="store_true",
                        help="make the subject's directory anew, for a try that was set up and never kept")
    args = parser.parse_args()

    for word in (args.run, args.arm):
        if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", word):
            sys.exit(f"setup.py: `{word}` should be letters, digits, `.`, `_` and `-`")
    built = sets.built(args.set, args.variant)
    try:
        all_tasks = json.load(open(os.path.join(built, "tasks.json"), encoding="utf-8"))
    except OSError:
        sys.exit(f"setup.py: variant {args.variant} of `{args.set}` is not built. Run build.py first.")
    if args.task not in all_tasks:
        sys.exit(f"setup.py: `{args.set}` has no task `{args.task}`")
    clean = os.path.join(built, "clean", "src")
    leaf = f"v{args.variant}"

    kept = os.path.join(RUNS, args.run, args.arm, args.task, leaf)
    work = os.path.join(os.path.abspath(args.work), args.run, args.arm, args.task, leaf)
    before = None
    if args.again:
        if os.path.exists(os.path.join(kept, "record.json")):
            sys.exit(f"setup.py: {kept} is kept. A kept try is not made anew.")
        try:
            before = open(os.path.join(kept, "request.md"), encoding="utf-8").read()
        except OSError:
            sys.exit(f"setup.py: {kept} holds no request, so there is nothing to make anew.")
        shutil.rmtree(work, ignore_errors=True)
        if os.path.exists(work + ".calls.jsonl"):
            os.remove(work + ".calls.jsonl")
    elif os.path.exists(os.path.join(kept, "request.md")):
        sys.exit(f"setup.py: {kept} already holds a request. A try is set up once.")
    if os.path.exists(work):
        sys.exit(f"setup.py: {work} is already there")
    os.makedirs(work)
    os.makedirs(kept, exist_ok=True)

    with open(os.path.join(work, "task.md"), "w", encoding="utf-8") as f:
        f.write(TASK.format(task=all_tasks[args.task], code=sets.about(args.set)["code"]))
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
    if before is not None and request != before:
        sys.exit("setup.py: made anew, the request would not be the one on file. Nothing was written over it.")
    with open(os.path.join(kept, "request.md"), "w", encoding="utf-8") as f:
        f.write(request)
    with open(os.path.join(kept, "setup.json"), "w", encoding="utf-8") as f:
        json.dump({"run": args.run, "arm": args.arm, "set": args.set, "task": args.task, "variant": args.variant,
                   "closed": args.closed,
                   "work": work, "calls": None if args.closed else log, "material": names}, f, indent=1)
        f.write("\n")
    print(f"The subject's directory: {work}")
    print(f"The request to send:     {os.path.join(kept, 'request.md')}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Check the instrument itself, with no model.

Usage: selfcheck.py <ast-grep binary> [--show]

This plays a subject by hand. On one variant of a task it makes three calls
through the `ast-grep` that writes calls down: one the tool refuses, one that runs
and is not right, one that is right. It writes a record of four messages around
those calls, as a harness would. Then it keeps the try and scores it, and compares
what `score.py` prints with what must be so: 3 calls, the third right, 700 of 750
output tokens before it.

On a second variant it hands in the answer that was right on the first. That
answer names things the second variant does not have, so the try fails, and the
task is not passed on every try. This is what variants are for.

It also checks four refusals: a subject that has not finished is not kept, a try
is not set up twice or kept twice, and with `--strict` a failure that nobody has
sorted fails.

It builds the variants first. Everything else it writes goes to a temporary
directory, which it removes at the end. `--show` also prints what `score.py` printed.
"""
import datetime, json, os, shutil, subprocess, sys, tempfile, time

HERE = os.path.dirname(os.path.abspath(__file__))


def stamp(at):
    return datetime.datetime.fromtimestamp(at, datetime.timezone.utc).isoformat().replace("+00:00", "Z")


def message(name, tokens, tool, said=None):
    """One message of a subject, as Claude Code records it."""
    block = {"type": "tool_use", "name": tool, "input": {"message": said} if said else {}}
    return {"type": "assistant", "timestamp": stamp(time.time()),
            "message": {"id": name, "model": "a-model", "content": [block],
                        "usage": {"input_tokens": 2, "cache_creation_input_tokens": 1000, "output_tokens": tokens}}}


def main():
    show = "--show" in sys.argv[1:]
    args = [a for a in sys.argv[1:] if a != "--show"]
    if len(args) != 1:
        sys.exit("usage: selfcheck.py <ast-grep binary> [--show]")
    binary = os.path.abspath(args[0])
    holder = tempfile.mkdtemp(prefix="kung-fu-selfcheck-")
    env = dict(os.environ, KUNG_FU_RUNS=os.path.join(holder, "runs"))

    def tool(script, *args, ok=True):
        ran = subprocess.run([sys.executable, os.path.join(HERE, script)] + list(args),
                             capture_output=True, text=True, env=env)
        assert (ran.returncode == 0) == ok, f"{script} {args}: exit {ran.returncode}\n{ran.stdout}{ran.stderr}"
        return ran.stdout + ran.stderr

    def expect(text, *wanted):
        for want in wanted:
            assert want in text, f"missing: {want!r}\n--- in:\n{text}"

    def write(path, lines):
        with open(path, "a") as f:
            for line in lines:
                f.write(json.dumps(line) + "\n")

    expect(tool("build.py", binary), "variant 0: 14 tasks", "variant 1: 14 tasks")
    work = os.path.join(holder, "work")
    right = {}
    for variant in (0, 1):
        lines = open(os.path.join(HERE, "built", str(variant), "answers.txt")).read().splitlines()
        right[variant] = dict(line.split(": ", 1) for line in lines)["T14"]
    assert right[0] != right[1], "variant 1 of T14 has the names of variant 0"

    # ---- variant 0, with the tool: three calls, the third one right
    tool("setup.py", binary, work, "check", "open", "T14")
    expect(tool("setup.py", binary, work, "check", "open", "T14", ok=False), "A try is set up once")
    there = os.path.join(work, "check", "open", "T14", "v0")
    wrapper = os.path.join(there, "bin", "ast-grep")
    calls = [
        ["scan", "--inline-rules", "{id: r, language: js, rule: {nthChild: 2}}", "src"],
        ["run", "-p", "finish($$$A, done)", "src"],
        ["scan", "--inline-rules", right[0].split("'")[1], "src"],
    ]
    subprocess.run([wrapper, "--version"], cwd=there, capture_output=True)
    transcript = os.path.join(holder, "open0.jsonl")
    for n, (args, tokens) in enumerate(zip(calls, [100, 200, 400])):
        write(transcript, [message(f"m{n}", tokens, "Bash")])
        time.sleep(0.02)
        subprocess.run([wrapper] + args, cwd=there, capture_output=True)
        time.sleep(0.02)
    # The subject has written no report yet: nothing is kept.
    open(os.path.join(there, "answer.txt"), "w").write(right[0] + "\n")
    expect(tool("keep.py", "check", "open", "T14", "--claude-code", transcript, ok=False), "has not finished")
    write(transcript, [message("m3", 50, "SubagentHandback", "A. Calls to finish whose last argument is done.\nB. sure")])
    tool("keep.py", "check", "open", "T14", "--claude-code", transcript, "--model-as", "a model")
    expect(tool("keep.py", "check", "open", "T14", "--claude-code", transcript, ok=False), "A try is kept once")

    # ---- variant 1, with the tool: the answer that was right on variant 0
    tool("setup.py", binary, work, "check", "open", "T14", "--variant", "1")
    there = os.path.join(work, "check", "open", "T14", "v1")
    task = open(os.path.join(there, "task.md")).read()
    assert "`close`" in task and "`finish`" not in task, task
    transcript = os.path.join(holder, "open1.jsonl")
    write(transcript, [message("m0", 300, "Bash")])
    time.sleep(0.02)
    subprocess.run([os.path.join(there, "bin", "ast-grep"), "scan", "--inline-rules", right[0].split("'")[1], "src"],
                   cwd=there, capture_output=True)
    open(os.path.join(there, "answer.txt"), "w").write(right[0] + "\n")
    write(transcript, [message("m1", 20, "SubagentHandback", "A. Calls to close.\nB. sure")])
    tool("keep.py", "check", "open", "T14", "--variant", "1", "--claude-code", transcript, "--model-as", "a model")

    # ---- variant 0, with no tool and a wrong answer: a failure that somebody has to sort
    tool("setup.py", binary, work, "check", "shut", "T14", "--closed")
    shut = os.path.join(work, "check", "shut", "T14", "v0")
    assert not os.path.exists(os.path.join(shut, "src")) and not os.path.exists(os.path.join(shut, "bin"))
    open(os.path.join(shut, "answer.txt"), "w").write("T14: ast-grep run -p 'finish($$$A, done)' src\n")
    transcript = os.path.join(holder, "shut.jsonl")
    write(transcript, [message("m0", 900, "SubagentHandback", "A. Calls to finish.\nB. guess")])
    tool("keep.py", "check", "shut", "T14", "--claude-code", transcript, "--model-as", "a model")

    runs = os.path.join(holder, "runs", "check")
    printed = tool("score.py", binary, runs)
    if show:
        print(printed)
    expect(printed,
           "open T14 v0: pass",
           "calls to run or scan the task's code: 3. 1 refused. 1 not right. 1 right. The first right one was call 3."
           " Besides: 1 for help or the like, 0 on files of its own.",
           "output tokens: 750, in 4 messages. Before the first right call: 700.",
           "the subject took the task to be: Calls to finish whose last argument is done.",
           "the subject called its answer: sure",
           "open T14 v1: wrong",
           "missed 3 of 3 expected: src/app.js:129, src/app.js:130, src/app.js:132",
           "calls to run or scan the task's code: 1. 1 not right. None was right.",
           "shut T14 v0: wrong",
           "missed 1 of 3 expected: src/app.js:132",
           "output tokens: 900, in 1 message.",
           "the subject called its answer: guess",
           "this failure is not sorted yet: write whose.txt",
           "open: 0 of 1 tasks passed on every try. 1 of 2 single tries passed. 1,070 output tokens."
           " 4 calls, 1 refused. 1 of 2 tries found a right call, after 3 calls and 700 output tokens in all."
           " Of 1 that did not pass: 0 the subject's, 0 the test's, 0 not known, 1 not sorted yet.",
           "shut: 0 of 1 tasks passed on every try. 0 of 1 single tries passed. 900 output tokens."
           " Of 1 that did not pass: 0 the subject's, 0 the test's, 0 not known, 1 not sorted yet.")
    tool("score.py", binary, runs, "--strict", ok=False)
    for arm, leaf in (("open", "v1"), ("shut", "v0")):
        open(os.path.join(runs, arm, "T14", leaf, "whose.txt"), "w").write(
            "the subject's: it had what it needed, and its answer misses calls the task describes\n")
    expect(tool("score.py", binary, runs, "--strict"),
           "this failure is sorted as: the subject's: it had what it needed",
           "Of 1 that did not pass: 1 the subject's, 0 the test's, 0 not known, 0 not sorted yet.")
    record = json.load(open(os.path.join(runs, "open", "T14", "v0", "record.json")))
    assert record["model"] == "a model" and record["code_unchanged"] is True and record["first_request_tokens"] == 1002
    shutil.rmtree(holder)
    print("the instrument does what it says")


if __name__ == "__main__":
    main()

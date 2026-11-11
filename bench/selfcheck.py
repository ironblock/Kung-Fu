#!/usr/bin/env python3
"""Check the instrument itself, with no model.

Usage: selfcheck.py <ast-grep binary> [--show]

This plays a subject by hand. It makes three calls through the `ast-grep` that
writes calls down: one the tool refuses, one that runs and is not right, one that
is right. It writes a record of four messages around those calls, as a harness
would. Then it keeps the run and scores it, and compares what `score.py` prints
with what must be so: 3 calls, the third right, 700 of 750 output tokens before it.

It also checks three refusals: a subject that has not finished is not kept, a run
is not set up twice, and with `--strict` a failure that nobody has sorted fails.

Everything it writes goes to a temporary directory, which it removes at the end.
`--show` also prints what `score.py` printed.
"""
import datetime, json, os, shutil, subprocess, sys, tempfile, time

HERE = os.path.dirname(os.path.abspath(__file__))
PILOT = os.path.join(os.path.dirname(HERE), "pilot")


def stamp(at):
    return datetime.datetime.fromtimestamp(at, datetime.timezone.utc).isoformat().replace("+00:00", "Z")


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

    work = os.path.join(holder, "work")
    answers = dict(line.strip().split(": ", 1) for line in open(os.path.join(PILOT, "reference", "answers.txt")))

    # ---- an open run: three calls, the third one right
    tool("setup.py", binary, work, "check", "open", "T14")
    expect(tool("setup.py", binary, work, "check", "open", "T14", ok=False), "A run is set up once")
    there = os.path.join(work, "check", "open", "T14")
    wrapper = os.path.join(there, "bin", "ast-grep")
    lines, spent = [], [100, 200, 400]
    calls = [
        ["scan", "--inline-rules", "{id: r, language: js, rule: {nthChild: 2}}", "src"],
        ["run", "-p", "finish($$$A, done)", "src"],
        ["scan", "--inline-rules", answers["T14"].split("'")[1], "src"],
    ]
    subprocess.run([wrapper, "--version"], cwd=there, capture_output=True)
    for n, (args, tokens) in enumerate(zip(calls, spent)):
        lines.append({"type": "assistant", "timestamp": stamp(time.time()),
                      "message": {"id": f"m{n}", "model": "a-model",
                                  "usage": {"input_tokens": 2, "cache_creation_input_tokens": 1000, "output_tokens": tokens},
                                  "content": [{"type": "tool_use", "name": "Bash", "input": {}}]}})
        time.sleep(0.02)
        subprocess.run([wrapper] + args, cwd=there, capture_output=True)
        time.sleep(0.02)
    transcript = os.path.join(holder, "open.jsonl")
    with open(transcript, "w") as f:
        for line in lines:
            f.write(json.dumps(line) + "\n")
    # The subject has written no report yet: nothing is kept.
    open(os.path.join(there, "answer.txt"), "w").write(answers["T14"] + "\n")
    expect(tool("keep.py", "check", "open", "T14", "--claude-code", transcript, ok=False), "has not finished")
    with open(transcript, "a") as f:
        f.write(json.dumps({"type": "assistant", "timestamp": stamp(time.time()),
                            "message": {"id": "m3", "model": "a-model", "usage": {"output_tokens": 50},
                                        "content": [{"type": "tool_use", "name": "SubagentHandback", "input": {
                                            "message": "A. Calls to finish whose last argument is done.\nB. sure"}}]}}) + "\n")
    tool("keep.py", "check", "open", "T14", "--claude-code", transcript, "--model-as", "a model")
    expect(tool("keep.py", "check", "open", "T14", "--claude-code", transcript, ok=False), "A run is kept once")

    # ---- a closed run with a wrong answer: a failure that somebody has to sort
    tool("setup.py", binary, work, "check", "shut", "T14", "--closed")
    shut = os.path.join(work, "check", "shut", "T14")
    assert not os.path.exists(os.path.join(shut, "src")) and not os.path.exists(os.path.join(shut, "bin"))
    open(os.path.join(shut, "answer.txt"), "w").write("T14: ast-grep run -p 'finish($$$A, done)' src\n")
    closed = os.path.join(holder, "shut.jsonl")
    with open(closed, "w") as f:
        f.write(json.dumps({"type": "assistant", "timestamp": stamp(time.time()),
                            "message": {"id": "m0", "model": "a-model", "usage": {"output_tokens": 900},
                                        "content": [{"type": "tool_use", "name": "SubagentHandback", "input": {
                                            "message": "A. Calls to finish.\nB. guess"}}]}}) + "\n")
    tool("keep.py", "check", "shut", "T14", "--claude-code", closed, "--model-as", "a model")

    runs = os.path.join(holder, "runs", "check")
    printed = tool("score.py", binary, runs)
    if show:
        print(printed)
    expect(printed,
           "open T14: pass",
           "calls to run or scan the task's code: 3. 1 refused. 1 not right. 1 right. The first right one was call 3."
           " Besides: 1 for help or the like, 0 on files of its own.",
           "output tokens: 750, in 4 messages. Before the first right call: 700.",
           "the subject took the task to be: Calls to finish whose last argument is done.",
           "the subject called its answer: sure",
           "shut T14: wrong",
           "missed 1 of 3 expected: src/app.js:132",
           "output tokens: 900, in 1 message.",
           "the subject called its answer: guess",
           "this failure is not sorted yet: write whose.txt",
           "open: 1 of 1 passed. 750 output tokens. 3 calls. 1 of 1 found a right call, after 700 output tokens in all.",
           "shut: 0 of 1 passed. 900 output tokens. Of 1 that did not pass: 0 the subject's, 0 the test's,"
           " 0 not known, 1 not sorted yet.")
    tool("score.py", binary, runs, "--strict", ok=False)
    open(os.path.join(runs, "shut", "T14", "whose.txt"), "w").write(
        "the subject's: the pattern misses a call whose first argument is also done\n")
    expect(tool("score.py", binary, runs, "--strict"),
           "this failure is sorted as: the subject's: the pattern misses",
           "Of 1 that did not pass: 1 the subject's, 0 the test's, 0 not known, 0 not sorted yet.")
    record = json.load(open(os.path.join(runs, "open", "T14", "record.json")))
    assert record["model"] == "a model" and record["code_unchanged"] is True and record["first_request_tokens"] == 1002
    shutil.rmtree(holder)
    print("the instrument does what it says")


if __name__ == "__main__":
    main()

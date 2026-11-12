#!/usr/bin/env python3
"""Check the instrument itself, with no model.

Usage: selfcheck.py <ast-grep binary> [--show]

This plays a subject by hand. On one variant of a task it makes three calls
through the `ast-grep` that writes calls down: one the tool refuses, one that runs
and is not right, one that is right. It writes a record of four messages around
those calls, as a harness would. Then it keeps the try and scores it, and compares
what `score.py` prints with what must be so: 3 calls, the third right, 700 of 750
output tokens before it.

Beside those three it makes seven calls that are no try at the task's code: two for
help, three on files of its own, and two on code it pipes in. They must be counted
apart, and the code that was piped in must be kept with its call. The right call
names the code by its full path, and must still be seen as right.

The record also holds four signs that the subject left its directory. Each must
be kept and printed, and a command that stayed in the directory must not be.

On a second variant it hands in the answer that was right on the first. That
answer names things the second variant does not have, so the try fails, and the
task is not passed on every try. This is what variants are for.

It runs `compare.py` on the two tries with the tool: a try that never was right
counts for all it wrote. A third arm holds a try with no tool, by a subject that
has only its files and reports with its last words. It is kept through
`claude_code.py`, which keeps nothing until the harness says the subject has
finished, nothing from a subject of another kind than the try is for, and nothing
run by another model than the one asked for. The two arms with no tool are then
compared try against try, and the rule for that comparison is tried on pairs made
up here. It also checks five refusals: a subject that has not finished is not kept, a
subject that was sent other words than the request on file is not kept, a try is
not set up twice or kept twice, and with `--strict` a failure that nobody has
sorted fails.

It builds the variants first. Everything else it writes goes to a temporary
directory, which it removes at the end. `--show` also prints what `score.py` printed.
"""
import datetime, json, os, shutil, subprocess, sys, tempfile, time

HERE = os.path.dirname(os.path.abspath(__file__))


def stamp(at):
    return datetime.datetime.fromtimestamp(at, datetime.timezone.utc).isoformat().replace("+00:00", "Z")


def message(name, tokens, tool, said=None, given=None):
    """One message of a subject, as Claude Code records it."""
    block = {"type": "tool_use", "name": tool, "input": given or ({"message": said} if said else {})}
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

    def sent(arm, leaf, words=None):
        """The line of a record that holds what the subject was sent: the request on file, or other words."""
        on_file = open(os.path.join(holder, "runs", "check", arm, "T14", leaf, "request.md")).read()
        return {"type": "user", "message": {"role": "user", "content": words or on_file}}

    # The grader reads an answer as a shell would. Inside double quotes, a `$` before a name is refused,
    # and a `$` that begins no name stands for itself. Each case below is what bash does.
    sys.path.insert(0, os.path.join(os.path.dirname(HERE), "pilot"))
    import grade
    assert grade.words("""a "x.$" b""") == ["a", "x.$", "b"]
    assert grade.words("""--inline-rules "{regex: '^.\\./p\\.js.$'}" src""") == \
        ["--inline-rules", "{regex: '^.\\./p\\.js.$'}", "src"]
    for refused in ('"$A"', '"${A}"', '"$(ls)"', '"$$"', '"`ls`"', "a | b", "$A"):
        try:
            grade.words(refused)
        except ValueError:
            continue
        raise AssertionError(f"the grader should refuse {refused}")

    # An `ast-grep outline` answer is graded on the top-level items it lists, whatever the view.
    # Given a directory, `outline` lists the exported items only: here one of two.
    lists = os.path.join(holder, "lists")
    os.makedirs(os.path.join(lists, "src"))
    open(os.path.join(lists, "src", "one.js"), "w").write(
        "export function shown(a) {\n  return a;\n}\n\nclass Kept {\n  shown() {}\n}\n")
    both = [["src/one.js", 1, 0, 3, 1], ["src/one.js", 5, 0, 7, 1]]
    assert grade.run(binary, "ast-grep outline src", lists)[0] == both[:1]
    for view in ("names", "signatures", "digest", "expanded"):
        assert grade.run(binary, f"ast-grep outline --items structure --view {view} src", lists)[0] == both, view
    assert grade.run(binary, "ast-grep outline --items structure --match '^shown$' src", lists)[0] == both[:1]
    assert grade.run(binary, "ast-grep outline --items nothing src", lists)[0] == "error"
    for refused in ("--outline-rules more.yml", "--json", "--stdin"):
        assert grade.run(binary, f"ast-grep outline {refused} src", lists)[0] == "invalid", refused

    expect(tool("build.py", binary), "pilot, variant 0: 14 tasks", "pilot, variant 1: 14 tasks")
    work = os.path.join(holder, "work")
    right = {}
    for variant in (0, 1):
        lines = open(os.path.join(HERE, "built", "pilot", str(variant), "answers.txt")).read().splitlines()
        right[variant] = dict(line.split(": ", 1) for line in lines)["T14"]
    assert right[0] != right[1], "variant 1 of T14 has the names of variant 0"

    # ---- variant 0, with the tool: three calls, the third one right
    tool("setup.py", binary, work, "check", "open", "T14")
    expect(tool("setup.py", binary, work, "check", "open", "T14", ok=False), "A try is set up once")
    there = os.path.join(work, "check", "open", "T14", "v0")
    # A subject that stopped half way leaves things behind. Made anew, the directory is as at first.
    open(os.path.join(there, "left-behind.txt"), "w").write("x")
    open(there + ".calls.jsonl", "w").write("{}\n")
    request = open(os.path.join(holder, "runs", "check", "open", "T14", "v0", "request.md")).read()
    tool("setup.py", binary, work, "check", "open", "T14", "--again")
    assert sorted(os.listdir(there)) == ["bin", "src", "task.md"] and not os.path.exists(there + ".calls.jsonl")
    assert open(os.path.join(holder, "runs", "check", "open", "T14", "v0", "request.md")).read() == request
    # The task is kept as the subject reads it: the request only names the file.
    assert open(os.path.join(holder, "runs", "check", "open", "T14", "v0", "task.md")).read() == \
        open(os.path.join(there, "task.md")).read()
    wrapper = os.path.join(there, "bin", "ast-grep")
    calls = [
        ["scan", "--inline-rules", "{id: r, language: js, rule: {nthChild: 2}}", "src"],
        ["run", "-p", "finish($$$A, done)", "src"],
        # The right call names the code by its full path. It is still a call on the task's code.
        ["scan", "--inline-rules", right[0].split("'")[1], os.path.join(there, "src")],
    ]
    subprocess.run([wrapper, "--version"], cwd=there, capture_output=True)
    # Calls that are no try at the task: one for help, and three on files of the subject's own.
    # One of the three is in the subject's directory, one the tool refuses, and one is outside the directory.
    subprocess.run([wrapper, "scan", "--help"], cwd=there, capture_output=True)
    os.makedirs(os.path.join(there, "mine"))
    open(os.path.join(there, "mine", "x.js"), "w").write("finish(done);\n")
    subprocess.run([wrapper, "run", "-p", "finish($$$A)", "mine"], cwd=there, capture_output=True)
    subprocess.run([wrapper, "scan", "--inline-rules", "{id: r, language: js, rule: {nthChild: 2}}", "mine"],
                   cwd=there, capture_output=True)
    stray = os.path.join(holder, "stray.js")
    open(stray, "w").write("finish(done);\n")
    subprocess.run([wrapper, "run", "-p", "finish($$$A)", stray], cwd=there, capture_output=True)
    # Two calls on code that is piped in: one runs, and one the tool refuses. Neither is a try at the task's code.
    piped = subprocess.run([wrapper, "run", "-p", "finish($$$A)", "-l", "js", "--stdin"], cwd=there,
                           input=b"finish(done);\n", capture_output=True)
    assert piped.returncode == 0 and b"finish(done)" in piped.stdout, piped
    subprocess.run([wrapper, "scan", "--stdin", "--inline-rules", "{id: r, language: js, rule: {nthChild: 2}}"],
                   cwd=there, input=b"finish(done);\n", capture_output=True)
    transcript = os.path.join(holder, "open0.jsonl")
    write(transcript, [sent("open", "v0")])
    # What the subject's tools were called with. The first stays in the directory. The others each leave it:
    # a file outside, a climb, a command that starts elsewhere, and a search with no place named.
    given = [{"command": f"cd {there} && export PATH={there}/bin:$PATH && ast-grep scan src"},
             {"command": f"cd {there} && cat {stray} ../../notes.txt"},
             {"command": "ls -la"}]
    for n, (args, tokens) in enumerate(zip(calls, [100, 200, 400])):
        write(transcript, [message(f"m{n}", tokens, "Bash", given=given[n])])
        time.sleep(0.02)
        subprocess.run([wrapper] + args, cwd=there, capture_output=True)
        time.sleep(0.02)
    # The subject has written no report yet: nothing is kept.
    open(os.path.join(there, "answer.txt"), "w").write(right[0] + "\n")
    expect(tool("keep.py", "check", "open", "T14", "--claude-code", transcript, ok=False), "has not finished")
    write(transcript, [message("m3", 50, "Grep", given={"pattern": "finish"}),
                       message("m3", 50, "SubagentHandback", "A. Calls to finish whose last argument is done.\nB. sure")])
    tool("keep.py", "check", "open", "T14", "--claude-code", transcript, "--model-as", "a model")
    expect(tool("keep.py", "check", "open", "T14", "--claude-code", transcript, ok=False), "A try is kept once")
    expect(tool("setup.py", binary, work, "check", "open", "T14", "--again", ok=False), "A kept try is not made anew")

    # ---- variant 1, with the tool: the answer that was right on variant 0
    tool("setup.py", binary, work, "check", "open", "T14", "--variant", "1")
    there = os.path.join(work, "check", "open", "T14", "v1")
    task = open(os.path.join(there, "task.md")).read()
    assert "`close`" in task and "`finish`" not in task, task
    transcript = os.path.join(holder, "open1.jsonl")
    write(transcript, [sent("open", "v1"),
                       message("m0", 300, "Bash", given={"command": f"cd '{there}' && ast-grep scan src"})])
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
    done = message("m0", 900, "SubagentHandback", "A. Calls to finish.\nB. guess")
    other = os.path.join(holder, "other.jsonl")
    write(other, [sent("shut", "v0", "Write an ast-grep command, please."), done])
    expect(tool("keep.py", "check", "shut", "T14", "--claude-code", other, ok=False), "was sent other words")
    transcript = os.path.join(holder, "shut.jsonl")
    write(transcript, [sent("shut", "v0"), done])
    tool("keep.py", "check", "shut", "T14", "--claude-code", transcript, "--model-as", "a model")

    # ---- a second try with no tool, by a subject that has only its files, kept through claude_code.py
    tool("setup.py", binary, work, "check", "shut2", "T14", "--closed", "--subject", "bench-subject-closed",
         "--material", os.path.join(HERE, "guides", "facts", "facts.md"))
    shut2 = os.path.join(work, "check", "shut2", "T14", "v0")
    sent2 = open(os.path.join(holder, "runs", "check", "shut2", "T14", "v0", "request.md")).read()
    assert "It contains task.md and facts.md. Read both." in sent2 and "read or write any file outside" in sent2, sent2
    assert sorted(os.listdir(shut2)) == ["facts.md", "task.md"]
    open(os.path.join(shut2, "answer.txt"), "w").write(right[0] + "\n")
    records = os.path.join(holder, "records")
    os.makedirs(records)
    record2 = os.path.join(records, "agent-a1.jsonl")
    # This subject has no tool to hand its report back with: its last words are its report.
    words = {"type": "assistant", "timestamp": stamp(time.time()),
             "message": {"id": "w1", "model": "a-model", "usage": {"input_tokens": 5, "output_tokens": 40},
                         "content": [{"type": "text", "text": "A. Calls to finish whose last argument is done.\nB. unsure"}]}}
    write(record2, [sent("shut2", "v0"), message("w0", 600, "Write", given={"file_path": shut2 + "/answer.txt"}), words])
    json.dump({"state": {"toolNames": ["Read", "Write"]}}, open(os.path.join(records, "agent-a1.prefix.json"), "w"))
    batch = ("claude_code.py", "check", "--records", records)
    # No word yet from the harness that it has finished: nothing is kept.
    expect(tool(*batch), "0 of 1 tries that are not kept have a subject that has finished", "0 kept now, 1 not kept yet")
    # Finished, and of another kind than the try is for: not kept.
    json.dump({"agentType": "general-purpose", "finished": True}, open(os.path.join(records, "agent-a1.meta.json"), "w"))
    expect(tool(*batch), "is for a subject of the kind `bench-subject-closed`, and the record is of `general-purpose`",
           "0 kept now, 1 not kept yet")
    json.dump({"agentType": "bench-subject-closed", "finished": True},
              open(os.path.join(records, "agent-a1.meta.json"), "w"))
    # Run by another model than the one asked for: nothing is kept.
    expect(tool(*batch, "--model-starts", "b-", ok=False), "Nothing was kept")
    expect(tool(*batch, "--model-starts", "a-", "--model-as", "a model", "--remove-work"), "1 kept now, 0 not kept yet")
    assert not os.path.exists(shut2), "the kept subject's directory should be gone"
    kept2 = os.path.join(holder, "runs", "check", "shut2", "T14", "v0")
    assert open(os.path.join(kept2, "report.md")).read() == "A. Calls to finish whose last argument is done.\nB. unsure\n"
    assert json.load(open(os.path.join(kept2, "record.json")))["subject"] == \
        {"type": "bench-subject-closed", "tools": ["Read", "Write"]}

    runs = os.path.join(holder, "runs", "check")
    printed = tool("score.py", binary, runs)
    if show:
        print(printed)
    expect(printed,
           "open T14 v0: pass",
           "calls to run or scan the task's code: 3. 1 refused. 1 not right. 1 right. The first right one was call 3."
           " Besides: 2 for help or the like, 3 on files of its own (1 refused), 2 on code it piped in (1 refused).",
           f"outside its directory, the subject named: {stray} (Bash); ../../notes.txt (Bash);"
           " a command that starts elsewhere: ls -la (Bash); a search with no place named: finish (Grep)",
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
           " Of 1 that did not pass: 0 the subject's, 0 the test's, 0 not known, 1 not sorted yet."
           " 1 named a place outside the subject's directory.",
           "shut: 0 of 1 tasks passed on every try. 0 of 1 single tries passed. 900 output tokens."
           " Of 1 that did not pass: 0 the subject's, 0 the test's, 0 not known, 1 not sorted yet.",
           "shut2 T14 v0: pass",
           "the subject was a `bench-subject-closed`, handed 2 tools: 0 besides a shell, its files and the hand-back",
           "the subject called its answer: unsure")
    tool("score.py", binary, runs, "--strict", ok=False)
    # Side by side. With the tool: the try that was right spent 700 before it was, and the other never
    # was right and spent all its 320. With no tool: the two arms are set try against try.
    expect(tool("compare.py", binary, runs),
           "all the tasks: T14",
           "open: 0 of 1 tasks passed on every try, 1 of 2 single tries passed."
           " Spent before the first right call: 1,020 in all, median 510. 1 of 2 tries made no right call.",
           "shut: 0 of 1 tries passed. Of the others: 0 refused by ast-grep, 1 ran and matched other code,"
           " 0 not a command of the form asked for. Called: guess 1, of which 0 passed.",
           "shut2: 1 of 1 tries passed. Called: unsure 1, of which 1 passed.",
           "shut against shut2: -1 of 1 pairs. Only the first passed in 0, only the second in 1."
           " Sign test 1.00. With resampling, -1 to -1. cannot tell")
    # Two runs read as one: here the same run twice, so each arm holds twice the tries.
    expect(tool("compare.py", binary, runs, runs), "2 runs read as one: check, check",
           "shut against shut2: -2 of 2 pairs. Only the first passed in 0, only the second in 2.")
    expect(tool("compare.py", binary, runs, "--without", "T14/v1"),
           "left out of every arm: T14/v1",
           "open: 1 of 1 tasks passed on every try, 1 of 1 single tries passed."
           " Spent before the first right call: 700 in all, median 700. 0 of 1 tries made no right call.")
    # The rule for tries with no tool, on pairs made up here: 24 pairs, and a quarter of them is 6.
    import compare
    pairs = [(task, n) for task in "abcdef" for n in range(4)]
    def said(only_first, only_second):
        first = {key: i < only_first for i, key in enumerate(pairs)}
        second = {key: only_first <= i < only_first + only_second for i, key in enumerate(pairs)}
        return compare.passes(first, second)
    assert said(10, 1).endswith("shown: the first passes more, by 6 of 24 or more"), said(10, 1)
    assert said(1, 10).endswith("shown: the second passes more, by 6 of 24 or more"), said(1, 10)
    assert said(0, 0).endswith("no difference as large as 6 of 24"), said(0, 0)
    assert said(1, 1).endswith("no difference as large as 6 of 24"), said(1, 1)
    assert said(4, 1).endswith("cannot tell"), said(4, 1)
    assert said(9, 4).endswith("cannot tell"), said(9, 4)
    for arm, leaf in (("open", "v1"), ("shut", "v0")):
        open(os.path.join(runs, arm, "T14", leaf, "whose.txt"), "w").write(
            "the subject's: it had what it needed, and its answer misses calls the task describes\n")
    expect(tool("score.py", binary, runs, "--strict"),
           "this failure is sorted as: the subject's: it had what it needed",
           "Of 1 that did not pass: 1 the subject's, 0 the test's, 0 not known, 0 not sorted yet.")
    kept_calls = [json.loads(line) for line in open(os.path.join(runs, "open", "T14", "v0", "calls.jsonl"))]
    assert [c["stdin"] for c in kept_calls if "stdin" in c] == ["finish(done);\n"] * 2, kept_calls
    record = json.load(open(os.path.join(runs, "open", "T14", "v0", "record.json")))
    assert record["model"] == "a model" and record["code_unchanged"] is True and record["first_request_tokens"] == 1002
    shutil.rmtree(holder)
    print("the instrument does what it says")


if __name__ == "__main__":
    main()

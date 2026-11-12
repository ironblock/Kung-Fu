#!/usr/bin/env python3
"""Keep every finished try of one run, when the subjects were subagents of Claude Code.

Usage: claude_code.py <run> --records DIR [--wait SECONDS] [--need N]
                      [--model-starts PREFIX] [--model-as WORDS] [--remove-work]

`keep.py` keeps one try from one record. A run has many tries, and Claude Code
names a subagent's record by an id that says nothing of the try. This finds each
try's record by what the subject was sent: the record whose first message is the
try's `request.md`, word for word. When a request was sent twice, the latest
record is taken.

`--records` is the directory where Claude Code keeps the records of a session's
subagents: `agent-<id>.jsonl`, with `agent-<id>.meta.json` beside each.

In order, this:

  waits, with `--wait`, until `--need` more subjects have finished, or all of them
  reads which model each finished record names. With `--model-starts`, a record
    that names another model stops everything, and nothing is kept
  keeps each finished try through `keep.py`, which holds the rules for keeping
  prints each sign that a subject left its directory, and each subject that
    changed the code
  removes, with `--remove-work`, the directory of each subject it has just kept:
    it holds an answer to a task that later subjects get

`--model-as` is passed on to `keep.py`: these words are written where a record
names the model. Check the names with `--model-starts` before you hide them.

Another harness needs a program of its own in this one's place.
"""
import argparse, collections, glob, json, os, shutil, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
RUNS = os.environ.get("KUNG_FU_RUNS") or os.path.join(HERE, "runs")
_seen = {}


def look(path):
    """(the first thing the subject was sent, whether it has finished, the models the record names)."""
    size = os.path.getsize(path)
    if _seen.get(path, (None,))[0] == size:
        return _seen[path][1]
    first, done, models = None, False, set()
    for raw in open(path, encoding="utf-8"):
        try:
            entry = json.loads(raw)
        except ValueError:
            continue
        message = entry.get("message") or {}
        if entry.get("type") == "user" and first is None:
            content = message.get("content")
            first = content if isinstance(content, str) else next(
                (b.get("text") for b in content or [] if isinstance(b, dict) and b.get("type") == "text"), "")
        if entry.get("type") == "assistant":
            if message.get("model"):
                models.add(message["model"])
            done = done or any(isinstance(b, dict) and b.get("type") == "tool_use" and b.get("name") == "SubagentHandback"
                               for b in message.get("content") or [])
    try:
        done = done or json.load(open(path[:-len(".jsonl")] + ".meta.json")).get("finished") is True
    except (OSError, ValueError):
        pass
    _seen[path] = (size, ((first or "").strip(), done, sorted(models)))
    return _seen[path][1]


def waiting(run):
    """The tries of a run that are set up and not kept: request -> the try's directory in this repository."""
    out = {}
    for setup in sorted(glob.glob(os.path.join(RUNS, run, "*", "*", "v*", "setup.json"))):
        kept = os.path.dirname(setup)
        if not os.path.exists(os.path.join(kept, "record.json")):
            out[open(os.path.join(kept, "request.md"), encoding="utf-8").read().strip()] = kept
    return out


def finished(records, wanted):
    """request -> the latest finished record that was sent it."""
    found = {}
    for path in sorted(glob.glob(os.path.join(records, "agent-*.jsonl")), key=os.path.getmtime):
        first, done, _ = look(path)
        if done and first in wanted:
            found[first] = path
    return found


def main():
    parser = argparse.ArgumentParser(description="Keep every finished try of one run of Claude Code subagents.")
    parser.add_argument("run")
    parser.add_argument("--records", required=True, help="where Claude Code keeps the subagents' records")
    parser.add_argument("--wait", type=float, default=0, metavar="SECONDS", help="wait this long for subjects to finish")
    parser.add_argument("--need", type=int, metavar="N", help="with --wait: stop waiting once N have finished")
    parser.add_argument("--model-starts", metavar="PREFIX", help="every finished record must name a model that starts so")
    parser.add_argument("--model-as", metavar="WORDS", help="write these words in place of the model's name")
    parser.add_argument("--remove-work", action="store_true", help="remove the directory of each subject just kept")
    args = parser.parse_args()

    wanted = waiting(args.run)
    if not wanted and not glob.glob(os.path.join(RUNS, args.run, "*", "*", "v*", "setup.json")):
        sys.exit(f"claude_code.py: the run `{args.run}` has no try set up")
    started = time.time()
    while True:
        found = finished(args.records, wanted)
        if len(found) >= (args.need or len(wanted)) or time.time() - started >= args.wait:
            break
        time.sleep(5)
    print(f"{len(found)} of {len(wanted)} tries that are not kept have a subject that has finished")

    named = collections.Counter(tuple(look(path)[2]) for path in found.values())
    print("the models the finished records name:", {", ".join(k) or "(none)": n for k, n in named.items()})
    if args.model_starts:
        other = [wanted[request] for request, path in found.items()
                 if not look(path)[2] or any(not m.startswith(args.model_starts) for m in look(path)[2])]
        if other:
            sys.exit("claude_code.py: these tries were not run by a model that starts with"
                     f" `{args.model_starts}`. Nothing was kept.\n  " + "\n  ".join(other))

    kept = 0
    for request, path in found.items():
        where = wanted[request]
        setup = json.load(open(os.path.join(where, "setup.json"), encoding="utf-8"))
        tag = f"{setup['arm']} {setup['task']} v{setup['variant']}"
        command = [sys.executable, os.path.join(HERE, "keep.py"), args.run, setup["arm"], setup["task"],
                   "--variant", str(setup["variant"]), "--claude-code", path]
        if args.model_as:
            command += ["--model-as", args.model_as]
        ran = subprocess.run(command, capture_output=True, text=True)
        if ran.returncode:
            print(f"{tag}: not kept. {(ran.stdout + ran.stderr).strip()}")
            continue
        kept += 1
        record = json.load(open(os.path.join(where, "record.json"), encoding="utf-8"))
        for sign in record.get("outside") or []:
            print(f"{tag}: a sign that the subject left its directory: {sign['place']} ({sign['tool']})")
        if record.get("code_unchanged") is False:
            print(f"{tag}: the subject changed the code under src")
        if args.remove_work:
            shutil.rmtree(setup["work"], ignore_errors=True)
            if setup.get("calls") and os.path.exists(setup["calls"]):
                os.remove(setup["calls"])
    left = len(waiting(args.run))
    print(f"{args.run}: {kept} kept now, {left} not kept yet")


if __name__ == "__main__":
    main()

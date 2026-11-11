#!/usr/bin/env python3
"""Keep what one subject sent back, once it has finished.

Usage: keep.py <run> <arm> <task> [--variant N] --claude-code TRANSCRIPT [--model-as WORDS]

`setup.py` made the run ready and wrote `request.md`. After the subject has
finished, this copies beside the request:

  answer.txt    the file the subject wrote, as it stood when the subject finished
  report.md     what the subject reported back, word for word
  calls.jsonl   every call the subject made to ast-grep, in order
  record.json   what the harness's record says the subject spent: the output
                tokens of each message it wrote, and when it wrote each one

It keeps nothing unless the record shows that the subject has finished. A copy
made while a subject is still working is a copy of something else.

It also keeps nothing unless the request in the record is `request.md`, word for
word. What is kept as the request is then what the subject received.

`--claude-code` reads the record that Claude Code keeps of a subagent: one JSON
object on each line. Another harness needs a reader of its own.

`--model-as` writes these words where the record names the model.

The subject was told to stay in its directory. Nothing holds it there: it works on
a machine that also has the answers, the guides and the other subjects' work. So
this reads every call the subject made to one of its tools, and writes down in
`record.json`, under `outside`, each sign that it left:

  a full path that exists on this machine and is not in the subject's directory
  a word that climbs with `..`, or starts from the home directory
  a shell command that does not start with `cd` to the subject's directory
  a search for files or in files with no place named

`score.py` prints them. A sign is not a breach: a reader judges each one. And a
shell command can go where its words do not say, so no sign is not proof.
"""
import argparse, datetime, filecmp, json, os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import sets  # noqa: E402
# Where runs are kept. The self-check keeps its own somewhere else.
RUNS = os.environ.get("KUNG_FU_RUNS") or os.path.join(HERE, "runs")


def seconds(stamp):
    """A time such as 2026-11-11T08:26:17.123Z, in seconds since 1970."""
    return datetime.datetime.fromisoformat(stamp.replace("Z", "+00:00")).timestamp()


FULL_PATH = re.compile(r"(?<![\w$.~/-])/(?:[\w.+@-]+/)*[\w.+@-]+")
WORD = re.compile(r"[^\s'\"`;|&<>()=]+")


def strings(value):
    """Every string inside what a tool was called with."""
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for inner in value.values():
            yield from strings(inner)
    elif isinstance(value, list):
        for inner in value:
            yield from strings(inner)


def signs(tool, given, work):
    """The signs, in one call to a tool, that the subject left its directory `work`."""
    for text in strings(given):
        for path in FULL_PATH.findall(text):
            path = os.path.normpath(path)
            inside = path == work or path.startswith(work + os.sep)
            if not inside and path != "/dev/null" and os.path.lexists(path):
                yield path
        for word in WORD.findall(text):
            if re.search(r"(^|/)\.\.(/|$)", word) or word == "~" or word.startswith("~/") or "$HOME" in word \
                    or "${HOME}" in word:
                yield word
    if tool == "Bash" and isinstance(given, dict):
        command = (given.get("command") or "").strip()
        if not re.match(r"cd\s+['\"]?" + re.escape(work) + r"/?['\"]?(\s|;|&|$)", command):
            yield "a command that starts elsewhere: " + " ".join(command.split())[:120]
    if tool in ("Glob", "Grep") and isinstance(given, dict) and not given.get("path"):
        yield f"a search with no place named: {given.get('pattern')}"


def claude_code(path, work=None):
    """Read a subagent's record.

    Return (messages, report, models, size of the first request, the request, signs that it left `work`).
    """
    order, by_id, report, first_in, request, outside = [], {}, None, None, None, []
    for raw in open(path, encoding="utf-8"):
        try:
            entry = json.loads(raw)
        except ValueError:
            continue
        message = entry.get("message") or {}
        if entry.get("type") == "user" and request is None:
            # The first thing the subject was sent, after the harness's own instructions.
            content = message.get("content")
            if isinstance(content, str):
                request = content
            elif isinstance(content, list):
                request = next((b.get("text") for b in content
                                if isinstance(b, dict) and b.get("type") == "text"), None)
        if entry.get("type") != "assistant":
            continue
        usage = message.get("usage") or {}
        name = message.get("id")
        if name not in by_id:
            by_id[name] = {"at": 0.0, "output_tokens": 0, "tools": [], "model": message.get("model")}
            order.append(name)
            if first_in is None:
                first_in = sum(usage.get(key) or 0 for key in
                               ("input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens"))
        kept = by_id[name]
        kept["output_tokens"] = max(kept["output_tokens"], usage.get("output_tokens") or 0)
        if entry.get("timestamp"):
            kept["at"] = max(kept["at"], seconds(entry["timestamp"]))
        for block in message.get("content") or []:
            if not isinstance(block, dict):
                continue
            if block.get("type") == "tool_use":
                kept["tools"].append(block.get("name"))
                if work and block.get("name") != "SubagentHandback":
                    for place in signs(block.get("name"), block.get("input"), work):
                        sign = {"tool": block.get("name"), "place": place}
                        if sign not in outside:
                            outside.append(sign)
                # The call that hands the report back, and so ends the subject's work.
                if block.get("name") == "SubagentHandback":
                    report = (block.get("input") or {}).get("message")
    models = sorted({by_id[name]["model"] for name in order if by_id[name]["model"]})
    messages = [{"at": by_id[n]["at"], "output_tokens": by_id[n]["output_tokens"], "tools": by_id[n]["tools"]}
                for n in order]
    return messages, report, models, first_in, request, outside


def main():
    parser = argparse.ArgumentParser(description="Keep what one subject sent back, once it has finished.")
    parser.add_argument("run")
    parser.add_argument("arm")
    parser.add_argument("task")
    parser.add_argument("--variant", type=int, default=0)
    parser.add_argument("--claude-code", required=True, metavar="TRANSCRIPT",
                        help="the record Claude Code keeps of the subagent")
    parser.add_argument("--model-as", metavar="WORDS", help="write these words in place of the model's name")
    args = parser.parse_args()

    kept = os.path.join(RUNS, args.run, args.arm, args.task, f"v{args.variant}")
    try:
        setup = json.load(open(os.path.join(kept, "setup.json"), encoding="utf-8"))
    except OSError:
        sys.exit(f"keep.py: {kept} has no setup.json. Run setup.py first.")
    if os.path.exists(os.path.join(kept, "record.json")):
        sys.exit(f"keep.py: {kept} is already kept. A try is kept once.")

    messages, report, models, first_in, request, outside = claude_code(args.claude_code, setup["work"])
    if report is None:
        sys.exit("keep.py: the record shows no report from the subject, so it has not finished. Nothing was kept.")
    on_file = open(os.path.join(kept, "request.md"), encoding="utf-8").read()
    if (request or "").strip() != on_file.strip():
        sys.exit("keep.py: the request in the record is not request.md. The subject was sent other words."
                 " Nothing was kept.")
    answer = os.path.join(setup["work"], "answer.txt")
    if not os.path.isfile(answer):
        sys.exit(f"keep.py: the subject finished and wrote no {answer}. Nothing was kept.")

    record = {
        "harness": "claude-code",
        "model": args.model_as or ", ".join(models),
        "first_request_tokens": first_in,
        "output_tokens": sum(m["output_tokens"] for m in messages),
        "messages": messages,
        "outside": outside,
    }
    if not setup["closed"]:
        # The subject was told to leave the code alone. Say so if it did not.
        clean = os.path.join(sets.built(setup.get("set", "pilot"), setup.get("variant", 0)), "clean", "src")
        same = filecmp.dircmp(os.path.join(setup["work"], "src"), clean)
        record["code_unchanged"] = not (same.diff_files or same.left_only or same.right_only or same.funny_files)
        calls = []
        if os.path.isfile(setup["calls"]):
            for line in open(setup["calls"], encoding="utf-8"):
                call = json.loads(line)
                # Where the call ran, as seen from the subject's directory.
                call["cwd"] = os.path.relpath(call["cwd"], setup["work"])
                calls.append(call)
        with open(os.path.join(kept, "calls.jsonl"), "w", encoding="utf-8") as f:
            for call in calls:
                f.write(json.dumps(call) + "\n")
    shutil.copyfile(answer, os.path.join(kept, "answer.txt"))
    with open(os.path.join(kept, "report.md"), "w", encoding="utf-8") as f:
        f.write(report if report.endswith("\n") else report + "\n")
    with open(os.path.join(kept, "record.json"), "w", encoding="utf-8") as f:
        json.dump(record, f, indent=1)
        f.write("\n")
    print(f"kept in {kept}")
    if outside:
        print(f"  {len(outside)} sign{'' if len(outside) == 1 else 's'} that the subject left its directory:"
              " score.py prints them")


if __name__ == "__main__":
    main()

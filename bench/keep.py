#!/usr/bin/env python3
"""Keep what one subject sent back, once it has finished.

Usage: keep.py <run> <arm> <task> --claude-code TRANSCRIPT [--model-as WORDS]

`setup.py` made the run ready and wrote `request.md`. After the subject has
finished, this copies beside the request:

  answer.txt    the file the subject wrote, as it stood when the subject finished
  report.md     what the subject reported back, word for word
  calls.jsonl   every call the subject made to ast-grep, in order
  record.json   what the harness's record says the subject spent: the output
                tokens of each message it wrote, and when it wrote each one

It keeps nothing unless the record shows that the subject has finished. A copy
made while a subject is still working is a copy of something else.

`--claude-code` reads the record that Claude Code keeps of a subagent: one JSON
object on each line. Another harness needs a reader of its own.

`--model-as` writes these words where the record names the model.
"""
import argparse, datetime, filecmp, json, os, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PILOT = os.path.join(os.path.dirname(HERE), "pilot")
# Where runs are kept. The self-check keeps its own somewhere else.
RUNS = os.environ.get("KUNG_FU_RUNS") or os.path.join(HERE, "runs")


def seconds(stamp):
    """A time such as 2026-11-11T08:26:17.123Z, in seconds since 1970."""
    return datetime.datetime.fromisoformat(stamp.replace("Z", "+00:00")).timestamp()


def claude_code(path):
    """Read a subagent's record. Return (messages, report, models, size of the first request)."""
    order, by_id, report, first_in = [], {}, None, None
    for raw in open(path, encoding="utf-8"):
        try:
            entry = json.loads(raw)
        except ValueError:
            continue
        if entry.get("type") != "assistant":
            continue
        message = entry.get("message") or {}
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
                # The call that hands the report back, and so ends the subject's work.
                if block.get("name") == "SubagentHandback":
                    report = (block.get("input") or {}).get("message")
    models = sorted({by_id[name]["model"] for name in order if by_id[name]["model"]})
    messages = [{"at": by_id[n]["at"], "output_tokens": by_id[n]["output_tokens"], "tools": by_id[n]["tools"]}
                for n in order]
    return messages, report, models, first_in


def main():
    parser = argparse.ArgumentParser(description="Keep what one subject sent back, once it has finished.")
    parser.add_argument("run")
    parser.add_argument("arm")
    parser.add_argument("task")
    parser.add_argument("--claude-code", required=True, metavar="TRANSCRIPT",
                        help="the record Claude Code keeps of the subagent")
    parser.add_argument("--model-as", metavar="WORDS", help="write these words in place of the model's name")
    args = parser.parse_args()

    kept = os.path.join(RUNS, args.run, args.arm, args.task)
    try:
        setup = json.load(open(os.path.join(kept, "setup.json"), encoding="utf-8"))
    except OSError:
        sys.exit(f"keep.py: {kept} has no setup.json. Run setup.py first.")
    if os.path.exists(os.path.join(kept, "record.json")):
        sys.exit(f"keep.py: {kept} is already kept. A run is kept once.")

    messages, report, models, first_in = claude_code(args.claude_code)
    if report is None:
        sys.exit("keep.py: the record shows no report from the subject, so it has not finished. Nothing was kept.")
    answer = os.path.join(setup["work"], "answer.txt")
    if not os.path.isfile(answer):
        sys.exit(f"keep.py: the subject finished and wrote no {answer}. Nothing was kept.")

    record = {
        "harness": "claude-code",
        "model": args.model_as or ", ".join(models),
        "first_request_tokens": first_in,
        "output_tokens": sum(m["output_tokens"] for m in messages),
        "messages": messages,
    }
    if not setup["closed"]:
        # The subject was told to leave the code alone. Say so if it did not.
        same = filecmp.dircmp(os.path.join(setup["work"], "src"), os.path.join(PILOT, "clean", "src"))
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


if __name__ == "__main__":
    main()

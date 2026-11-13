#!/usr/bin/env python3
"""Keep what a subject did, step by step, from the harness's own record of it.

Usage: lines.py <run directory> --records DIR

`record.json` holds, for each message of a subject, the tokens and the names of the tools it used. It
does not hold the commands. The harness's own records do, and they are not kept for long. This writes
`lines.json` beside each kept `record.json`:

  steps      one for each message of the subject: the calls it made (the tool, and the command or the
             path), how many characters came back for each, and how many blocks of reasoning it held and
             how many characters of them the record shows
  harness    what the harness itself put before the subject after it began: each piece, by its kind,
             with the number of the message it came after and its length in characters
  effort     the effort the harness ran the subject at, where the record says

What came back is counted and not kept: it is the task's code, the tool's help and the like. A record is
a subject's when its first message is the try's `request.md`, word for word, and its messages wrote what
`record.json` says they wrote: a request may have been sent more than once.
"""
import argparse, glob, json, os, sys


def main():
    parser = argparse.ArgumentParser(usage="lines.py <run directory> --records DIR")
    parser.add_argument("run")
    parser.add_argument("--records", required=True)
    args = parser.parse_args()
    wanted = {}
    for record in glob.glob(os.path.join(args.run, "*", "*", "v*", "record.json")):
        kept = os.path.dirname(record)
        wanted[open(os.path.join(kept, "request.md"), encoding="utf-8").read().strip()] = kept
    found = {}
    for path in sorted(glob.glob(os.path.join(args.records, "agent-*.jsonl"))):
        first, steps, ids, harness, efforts, pending, wrote = None, [], [], [], set(), {}, {}
        for raw in open(path, encoding="utf-8"):
            entry = json.loads(raw)
            message = entry.get("message") or {}
            content = message.get("content")
            if entry.get("type") == "user" and first is None and not entry.get("isMeta"):
                first = (content if isinstance(content, str) else
                         next((b.get("text") for b in content if b.get("type") == "text"), "")).strip()
                if first not in wanted:
                    break
                continue
            if entry.get("effort"):
                efforts.add(entry["effort"])
            if entry.get("type") == "attachment":
                piece = entry.get("attachment") or {}
                if piece.get("type") == "mcp_instructions_delta":
                    harness.append({"kind": "instructions for the session's connected services",
                                    "after message": len(ids),
                                    "characters": sum(len(b) for b in piece.get("addedBlocks") or [])})
                continue
            if not isinstance(content, list):
                continue
            if entry.get("type") == "assistant":
                # One message of the subject may come as several entries: they share an id.
                if message.get("id") not in ids:
                    ids.append(message.get("id"))
                    steps.append({"calls": [], "reasoning blocks": 0, "reasoning characters": 0})
                step = steps[-1]
                wrote[message.get("id")] = max(wrote.get(message.get("id"), 0),
                                               (message.get("usage") or {}).get("output_tokens") or 0)
                for block in content:
                    if block.get("type") == "thinking":
                        step["reasoning blocks"] += 1
                        step["reasoning characters"] += len(block.get("thinking") or "")
                    elif block.get("type") == "tool_use":
                        given = block.get("input") or {}
                        call = {"tool": block["name"]}
                        if block["name"] == "Bash":
                            call["command"] = given.get("command", "")
                        elif given.get("file_path"):
                            call["path"] = given["file_path"]
                        elif block["name"] != "SubagentHandback":
                            call["input"] = json.dumps(given)[:400]
                        step["calls"].append(call)
                        pending[block.get("id")] = call
            elif entry.get("type") == "user":
                for block in content:
                    if block.get("type") == "tool_result" and block.get("tool_use_id") in pending:
                        back = block.get("content")
                        text = back if isinstance(back, str) else "".join(
                            b.get("text", "") for b in back or [] if b.get("type") == "text")
                        pending[block["tool_use_id"]]["came back, in characters"] = len(text)
        if first in wanted:
            found.setdefault(wanted[first], []).append(
                ([wrote[i] for i in ids], {"steps": steps, "harness": harness, "effort": sorted(efforts)}))
    done = 0
    for kept, records in found.items():
        # A request may have been sent more than once. The record that was kept is the one whose messages
        # wrote what `record.json` says they wrote.
        on_file = [m["output_tokens"] for m in json.load(open(os.path.join(kept, "record.json")))["messages"]]
        same = [lines for wrote, lines in records if wrote == on_file]
        if len(same) != 1:
            continue
        with open(os.path.join(kept, "lines.json"), "w", encoding="utf-8") as f:
            json.dump(same[0], f, indent=1)
            f.write("\n")
        done += 1
    print(f"{os.path.basename(os.path.normpath(args.run))}: lines kept for {done} of {len(wanted)} kept tries")
    if done < len(wanted):
        sys.exit(1)


if __name__ == "__main__":
    main()

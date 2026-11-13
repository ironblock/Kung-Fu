#!/usr/bin/env python3
"""Write down what each subject of a kept run had read, for tries that were kept before the bench kept it.

Usage: read_tokens.py <run> --records DIR

Since 2026-11-13 `keep.py` writes, for each message a subject wrote, how many tokens the subject had in
front of it when it wrote that message: `read`, in `record.json`. A try kept before that has no such
number, and a try is kept once. This finds the harness's record of each such try, by the request the
subject was sent, and writes the numbers beside the kept record, in `read.json`. It writes nothing unless
the harness's record agrees with the kept one in every message: when it was written, how many tokens it
is, and which tools it called.

The harness's records do not last. A run whose records are gone keeps what it has.
"""
import argparse, glob, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
RUNS = os.environ.get("KUNG_FU_RUNS") or os.path.join(HERE, "runs")
sys.path.insert(0, HERE)
import keep  # noqa: E402
import claude_code  # noqa: E402


def main():
    parser = argparse.ArgumentParser(description="Write down what each subject of a kept run had read.")
    parser.add_argument("run")
    parser.add_argument("--records", required=True, metavar="DIR")
    args = parser.parse_args()
    by_request = {}
    for path in sorted(glob.glob(os.path.join(args.records, "agent-*.jsonl")), key=os.path.getmtime):
        first, done, _ = claude_code.look(path)
        if first and done:
            by_request[first] = path          # the latest record that was sent these words
    wrote = had = gone = differ = 0
    for setup in sorted(glob.glob(os.path.join(RUNS, args.run, "*", "*", "v*", "setup.json"))):
        kept = os.path.dirname(setup)
        try:
            record = json.load(open(os.path.join(kept, "record.json"), encoding="utf-8"))
        except OSError:
            continue
        if all("read" in m for m in record["messages"]) or os.path.exists(os.path.join(kept, "read.json")):
            had += 1
            continue
        path = by_request.get(open(os.path.join(kept, "request.md"), encoding="utf-8").read().strip())
        if not path:
            gone += 1
            continue
        messages = keep.claude_code(path)[0]
        same = len(messages) == len(record["messages"]) and all(
            abs(a["at"] - b["at"]) < 0.001 and a["output_tokens"] == b["output_tokens"] and a["tools"] == b["tools"]
            for a, b in zip(messages, record["messages"]))
        if not same:
            differ += 1
            print(f"{kept}: the harness's record does not agree with the kept one. Nothing written.")
            continue
        with open(os.path.join(kept, "read.json"), "w", encoding="utf-8") as f:
            json.dump({"read": [m["read"] for m in messages]}, f)
            f.write("\n")
        wrote += 1
    print(f"{args.run}: written for {wrote} tries. {had} had it already, {gone} have no record left,"
          f" {differ} do not agree.")


if __name__ == "__main__":
    main()

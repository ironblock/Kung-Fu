#!/usr/bin/env python3
"""Turn a writer's list of notes or recipes into the text a subject is handed.

    notes.py render FACTS.json --title "..." [--top N] [--out FILE]

FACTS.json is a list, in the writer's order. A note has `text`. A recipe has `goal`, `steps` (lines of
code) and `without` (a list of sentences). `--top N` keeps the first N of the list and nothing else, so a
shorter text is cut by this command and has no author of its own.

The text holds only what a reader is meant to see: no ids, no file names of the library, no word about
who wrote a note or whether a test was run on it. Every arm that gets such a text gets it in this one form.
"""
import argparse
import json
import sys


def render(items, title):
    out = [f"# {title}", ""]
    for n, item in enumerate(items, 1):
        if "goal" in item:
            out += [f"## {n}. {item['goal'].strip()}", "", "```ts", item["steps"].rstrip(), "```", ""]
            out += [f"- {line.strip()}" for line in item.get("without", [])]
            out.append("")
        else:
            out.append(f"{n}. {item['text'].strip()}")
    return "\n".join(out).rstrip() + "\n"


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    one = sub.add_parser("render")
    one.add_argument("facts")
    one.add_argument("--title", required=True)
    one.add_argument("--top", type=int)
    one.add_argument("--out")
    args = parser.parse_args()
    with open(args.facts, encoding="utf-8") as handle:
        items = json.load(handle)
    if args.top:
        items = items[:args.top]
    text = render(items, args.title)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as handle:
            handle.write(text)
        print(f"{args.out}: {len(items)} items, {len(text.encode())} bytes")
    else:
        sys.stdout.write(text)


if __name__ == "__main__":
    main()

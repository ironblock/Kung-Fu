#!/usr/bin/env python3
"""Say what a subject started from, out of the harness's own record of it.

Usage: start.py <kept try directory> --records DIR [--show]

Two subjects can be sent the same request and still not start in the same place: the harness hands each
one instructions, tools and notes of its own before the subject writes a word. This prints, for one kept
try, what the harness's record shows of that, as JSON:

  kind, launched, depth     the kind of subject, and how the harness says it was started
  effort                    the effort the harness ran it at, where the record says
  tools                     the tools it was handed, where the harness kept a list
  instructions              the pieces of the instructions it was given before any turn: for each, its
                            length in characters and a mark of its text
  before its first message  each turn and each note the harness put before the subject's first message,
                            in order: what it is, its length, and a mark of its text
  first request, in tokens  what the subject had read when it wrote its first message
  after its first message   the notes the harness added later, the same way

A mark is the first 16 characters of the SHA-256 of the text, with three things put out of it first, since
they differ between two sessions that are otherwise alike: the subject's own directory, any id of the
shape 8-4-4-4-12, and any name of a session. Two pieces with one mark hold the same text but for those.
The same three are put out of the names of connected services, which in some sessions are ids.

With --show the texts themselves follow, after a line of dashes, with the same three things put out.
They name the model and are not for keeping: read them, and do not put them in the repository.

A record is this try's when its first turn is the try's `request.md`, word for word, and its messages
wrote what `record.json` says they wrote.
"""
import argparse, glob, hashlib, json, os, re, sys

ID = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")
SESSION = re.compile(r"session_[0-9A-Za-z]+")


def main():
    parser = argparse.ArgumentParser(usage="start.py <kept try directory> --records DIR [--show]")
    parser.add_argument("kept")
    parser.add_argument("--records", required=True)
    parser.add_argument("--show", action="store_true")
    args = parser.parse_args()
    request = open(os.path.join(args.kept, "request.md"), encoding="utf-8").read().strip()
    work = json.load(open(os.path.join(args.kept, "setup.json"), encoding="utf-8"))["work"]
    on_file = [m["output_tokens"] for m in
               json.load(open(os.path.join(args.kept, "record.json"), encoding="utf-8"))["messages"]]

    def plain(text):
        return SESSION.sub("<session>", ID.sub("<id>", text.replace(work, "<dir>")))

    def mark(text):
        return hashlib.sha256(plain(text).encode("utf-8")).hexdigest()[:16]

    found = []
    for path in sorted(glob.glob(os.path.join(args.records, "agent-*.jsonl"))):
        first, before, after, instructions, efforts, wrote, order, texts = None, [], [], None, set(), {}, [], []
        tokens = None
        for raw in open(path, encoding="utf-8"):
            entry = json.loads(raw)
            message = entry.get("message") or {}
            content = message.get("content")
            if entry.get("effort"):
                efforts.add(entry["effort"])
            if entry.get("type") == "user" and not order:
                text = content if isinstance(content, str) else "".join(
                    b.get("text", "") for b in content or [] if b.get("type") == "text")
                if first is None and not entry.get("isMeta"):
                    first = text.strip()
                    if first != request:
                        break
                before.append({"what": "turn", "characters": len(text), "mark": mark(text)})
                texts.append(("turn", text))
            elif entry.get("type") == "attachment":
                piece = entry.get("attachment") or {}
                kind = piece.get("type")
                if kind == "prompt_snapshot":
                    if instructions is None:
                        given = piece.get("systemPrompt") or []
                        given = given if isinstance(given, list) else [given]
                        instructions = [{"characters": len(t), "mark": mark(t)} for t in given]
                        texts.extend(("instructions, piece %d" % (i + 1), t) for i, t in enumerate(given))
                    continue
                text = json.dumps({k: v for k, v in piece.items() if k != "type"}, sort_keys=True,
                                  ensure_ascii=False)
                note = {"what": kind, "characters": len(text), "mark": mark(text)}
                if kind == "mcp_instructions_delta":
                    note["names"] = [plain(n) for n in piece.get("addedNames") or []]
                    note["characters"] = sum(len(b) for b in piece.get("addedBlocks") or [])
                (after if order else before).append(note)
                if not order or kind == "mcp_instructions_delta":
                    texts.append((kind, text))
            elif entry.get("type") == "assistant":
                used = message.get("usage") or {}
                if not order:
                    tokens = sum(used.get(k) or 0 for k in
                                 ("input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens"))
                if message.get("id") not in order:
                    order.append(message.get("id"))
                wrote[message.get("id")] = max(wrote.get(message.get("id"), 0), used.get("output_tokens") or 0)
        if first != request or [wrote[i] for i in order] != on_file:
            continue
        stem = path[:-len(".jsonl")]
        meta = json.load(open(stem + ".meta.json", encoding="utf-8")) if os.path.exists(stem + ".meta.json") else {}
        tools = None
        if os.path.exists(stem + ".prefix.json"):
            tools = (json.load(open(stem + ".prefix.json", encoding="utf-8")).get("state") or {}).get("toolNames")
        found.append(({"kind": meta.get("agentType"), "launched": meta.get("requestShape"),
                       "depth": meta.get("spawnDepth"), "effort": sorted(efforts), "tools": tools,
                       "instructions": instructions, "before its first message": before,
                       "first request, in tokens": tokens,
                       "after its first message": [n for n in after if n["what"] != "total_tokens_reminder"]},
                      texts))
    if len(found) != 1:
        sys.exit(f"start.py: {len(found)} records are this try's, and one was wanted")
    facts, texts = found[0]
    print(json.dumps(facts, indent=1, ensure_ascii=False))
    if args.show:
        print("-" * 72)
        for name, text in texts:
            print(f"== {name}")
            print(plain(text))


if __name__ == "__main__":
    main()

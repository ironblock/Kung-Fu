#!/usr/bin/env python3
"""Build an index: for each kept try of the named runs, the harness record(s) whose first user message equals request.md.
Writes check4/index.json: {run: {tag: [paths...]}} and check4/tries/<run>__<arm>__<task>__vN.json with the events."""
import glob, json, os, sys
REPO = "/home/user/Kung-Fu"
RECORDS = "/root/.claude/projects/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/subagents"
OUT = "/tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/check4"
runs = sys.argv[1:]
wanted = {}
dups = []
for run in runs:
    for setup in glob.glob(f"{REPO}/bench/runs/{run}/*/*/v*/setup.json"):
        d = os.path.dirname(setup); tag = "/".join(d.split("/")[-3:])
        req = open(d + "/request.md", encoding="utf-8").read().strip()
        if req in wanted:
            dups.append((wanted[req], (run, tag)))
        wanted.setdefault(req, []).append((run, tag))
print("kept tries:", sum(len(v) for v in wanted.values()), "distinct requests:", len(wanted))
for a in wanted.values():
    if len(a) > 1: print("  SAME REQUEST in:", a)
index = {}
os.makedirs(OUT + "/tries", exist_ok=True)
def text_of(c):
    if isinstance(c, str): return c
    return "".join((x.get("text") or "") for x in c or [] if isinstance(x, dict) and x.get("type") == "text")
for path in sorted(glob.glob(RECORDS + "/agent-*.jsonl")):
    first = None; events = []; ok = False
    with open(path, encoding="utf-8") as f:
        for raw in f:
            try: e = json.loads(raw)
            except ValueError: continue
            m = e.get("message") or {}; c = m.get("content")
            if e.get("type") == "user" and first is None:
                first = (c if isinstance(c, str) else next((b.get("text") for b in c if isinstance(b, dict) and b.get("type") == "text"), "") or "").strip()
                if first not in wanted: break
                ok = True
                events.append({"k": "request", "chars": len(first), "ts": e.get("timestamp")})
                continue
            if first is None: continue
            if e.get("type") == "assistant":
                u = m.get("usage") or {}
                for b in c or []:
                    if not isinstance(b, dict): continue
                    ev = {"k": b.get("type"), "id": m.get("id"), "ts": e.get("timestamp"),
                          "in": sum(u.get(k) or 0 for k in ("input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens")),
                          "out": u.get("output_tokens") or 0, "model": m.get("model")}
                    if b.get("type") == "tool_use":
                        ev["name"] = b.get("name"); ev["input"] = b.get("input"); ev["tuid"] = b.get("id")
                    elif b.get("type") == "text":
                        ev["text"] = b.get("text")
                    elif b.get("type") == "thinking":
                        ev["text"] = b.get("thinking")
                    events.append(ev)
            elif e.get("type") == "user":
                if isinstance(c, list):
                    for b in c:
                        if isinstance(b, dict) and b.get("type") == "tool_result":
                            events.append({"k": "tool_result", "tuid": b.get("tool_use_id"), "ts": e.get("timestamp"),
                                           "text": text_of(b.get("content")), "is_error": b.get("is_error")})
                        elif isinstance(b, dict) and b.get("type") == "text":
                            events.append({"k": "user_text", "text": b.get("text"), "ts": e.get("timestamp")})
                elif isinstance(c, str):
                    events.append({"k": "user_text", "text": c, "ts": e.get("timestamp")})
    if not ok: continue
    stem = path[:-6]
    meta = {}
    for end in (".meta.json", ".prefix.json"):
        try: meta[end] = json.load(open(stem + end))
        except Exception: meta[end] = None
    for run, tag in wanted[first]:
        index.setdefault(run, {}).setdefault(tag, []).append(path)
        n = len(index[run][tag])
        name = f"{OUT}/tries/{run}__{tag.replace('/', '__')}" + ("" if n == 1 else f"__dup{n}") + ".json"
        json.dump({"path": path, "meta": meta[".meta.json"], "tools": ((meta[".prefix.json"] or {}).get("state") or {}).get("toolNames"), "events": events}, open(name, "w"))
json.dump(index, open(OUT + "/index.json", "w"), indent=1)
for run in runs:
    got = index.get(run, {})
    all_tags = sorted("/".join(os.path.dirname(s).split("/")[-3:]) for s in glob.glob(f"{REPO}/bench/runs/{run}/*/*/v*/setup.json"))
    print(run, "tries:", len(all_tags), "with a record:", len(got), "with more than one record:", sorted(t for t, p in got.items() if len(p) > 1), "missing:", sorted(set(all_tags) - set(got)))

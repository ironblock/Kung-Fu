#!/usr/bin/env python3
"""What the harness itself put in front of each subject after it began: attachments rendered to the model, by type, size, and where they came."""
import json, sys, collections, os
OUT = os.path.dirname(os.path.abspath(__file__))
idx = json.load(open(f"{OUT}/index.json"))
for run in sys.argv[1:]:
    sizes = collections.defaultdict(list); where = collections.Counter(); per = {}
    for tag, paths in sorted(idx[run].items()):
        seen_assistant = 0; ids = []; got = []
        for raw in open(paths[0], encoding="utf-8"):
            e = json.loads(raw)
            if e.get("type") == "assistant":
                i = (e.get("message") or {}).get("id")
                if i not in ids: ids.append(i)
            elif e.get("type") == "attachment":
                a = e.get("attachment") or {}; t = a.get("type")
                if t == "mcp_instructions_delta":
                    n = sum(len(b) for b in a.get("addedBlocks") or [])
                    sizes[t].append(n); where[(t, len(ids))] += 1; got.append((t, len(ids), n, tuple(a.get("addedNames") or [])))
                elif t == "total_tokens_reminder":
                    sizes[t].append(len(a.get("text") or "")); where[(t, "after message %d+" % min(len(ids), 1))] += 1
                elif t not in ("prompt_snapshot", "environment", "model", "session_context", "date", "critical_system_reminder", "credential_org", "remote_session_change"):
                    sizes[t].append(len(json.dumps(a))); where[(t, len(ids))] += 1
            elif e.get("type") == "user" and e.get("isMeta"):
                c = (e.get("message") or {}).get("content"); c = c if isinstance(c, str) else json.dumps(c)
                sizes["meta user text"].append(len(c)); where[("meta", len(ids), c[:40])] += 1
        per[tag] = got
    print(run)
    for t, v in sizes.items(): print("  ", t, "count", len(v), "chars min/max", min(v), max(v))
    for k, v in sorted(where.items(), key=str): print("     ", k, v)
    print("   tries with an mcp_instructions_delta after their first message:", sum(1 for g in per.values() if any(x[1] == 1 for x in g)), "of", len(per), "| names:", {x[3] for g in per.values() for x in g})

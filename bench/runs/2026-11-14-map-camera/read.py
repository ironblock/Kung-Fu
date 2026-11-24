#!/usr/bin/env python3
"""Read what the mappers of one map run did, from the records. Usage: read.py WORK RECORDS EXPORTS [--json OUT]

WORK     the directory that holds each mapper's directory and its `<name>.calls.jsonl`
RECORDS  where the harness keeps the subagents' records
EXPORTS  the exported names of the mapped directory, as `exports.js` lists them
"""
import collections, glob, json, os, re, sys, tomllib

work, records, exports = sys.argv[1:4]
names = sorted(n for n in os.listdir(work) if os.path.isfile(os.path.join(work, n, "task.md")))
exported = sorted({line.split("\t")[2] for line in open(exports, encoding="utf-8").read().splitlines()
                   if not line.split("\t")[2].startswith("*")})
WORD = re.compile(r"[A-Za-z_$][A-Za-z0-9_$]*")
HELP = {"--help", "-h", "help", "rules", "shapes"}

def record_of(box):
    for path in glob.glob(os.path.join(records, "agent-*.jsonl")):
        with open(path, encoding="utf-8") as f:
            first = f.readline()
        if box + "\\n" in first or box + "\n" in first:
            return path
    return None

out = {}
for name in names:
    box = os.path.join(work, name)
    one = out[name] = {}
    # ---- the calls the wrappers wrote down
    calls = [json.loads(l) for l in open(box + ".calls.jsonl", encoding="utf-8")] if os.path.exists(box + ".calls.jsonl") else []
    own = [c for c in calls if c["started by"] != "ley"]
    one["calls of the tools by the mapper"] = collections.Counter(
        c["tool"] + (" " + c["args"][0] if c["tool"] == "ast-grep" and c["args"] and not c["args"][0].startswith("-") else "")
        + (" " + c["args"][0] if c["tool"] == "ley" and c["args"] else "") for c in own)
    one["calls for help"] = [{"call": c["tool"] + " " + " ".join(c["args"]), "printed": c["printed"]}
                             for c in own if HELP & set(c["args"])]
    one["calls that ended badly"] = [{"call": (c["tool"] + " " + " ".join(c["args"]))[:160], "status": c["status"],
                                      "complaint": c["complaint"].strip().splitlines()[0][:200] if c["complaint"].strip() else ""}
                                     for c in own if c["status"] != 0 and not (c["tool"] == "ley" and c["args"][:1] == ["check"])]
    one["checks by the mapper"] = [c["status"] for c in own if c["tool"] == "ley" and c["args"][:1] == ["check"]]
    one["ast-grep calls started by ley"] = sum(c["started by"] == "ley" for c in calls)
    # ---- the harness's record
    path = record_of(box)
    reads, read_chars, shell, said, tokens, order, pending = set(), 0, 0, [], {}, [], {}
    shell_chars, first_read = 0, None
    programs = collections.Counter()
    if path:
        for raw in open(path, encoding="utf-8"):
            e = json.loads(raw)
            m = e.get("message") or {}
            content = m.get("content")
            if not isinstance(content, list):
                continue
            if e.get("type") == "assistant":
                tokens[m.get("id")] = max(tokens.get(m.get("id"), 0), (m.get("usage") or {}).get("output_tokens") or 0)
                used = m.get("usage") or {}
                now = sum(used.get(k) or 0 for k in ("input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens"))
                first_read = now if first_read is None else first_read
                last_read = now + (used.get("output_tokens") or 0)
                for b in content:
                    if b.get("type") != "tool_use":
                        continue
                    given = b.get("input") or {}
                    if b["name"] == "Read":
                        pending[b["id"]] = ("read", given.get("file_path", ""))
                    elif b["name"] == "Bash":
                        shell += 1
                        command = given.get("command", "")
                        pending[b["id"]] = ("shell", command)
                        for piece in re.split(r"[;&|\n]+", command):
                            word = piece.strip().split(" ")[0]
                            if word in ("rg", "cat", "sed", "head", "tail", "wc", "ls", "find", "grep", "ast-grep", "ley"):
                                programs[word] += 1
                    else:
                        pending[b["id"]] = (b["name"], "")
            elif e.get("type") == "user":
                for b in content:
                    if b.get("type") == "tool_result" and b.get("tool_use_id") in pending:
                        kind, what = pending[b["tool_use_id"]]
                        back = b.get("content")
                        text = back if isinstance(back, str) else "".join(x.get("text", "") for x in back or [] if x.get("type") == "text")
                        if kind == "read" and "/src/" in what:
                            reads.add(what.split("/src/", 1)[1]); read_chars += len(text)
                        if kind == "shell":
                            shell_chars += len(text)
                        if kind == "shell" and re.search(r"\bley check\b", what):
                            said += [line.strip()[:220] for line in text.splitlines()
                                     if re.search(r"differs|restates|not checked|refused|could not|^\d+ rows?:", line.strip())]
    one["record"] = os.path.basename(path) if path else None
    one["files of src opened with the reading tool"] = len(reads)
    one["of them in camera"] = sum(r.startswith("camera/") for r in reads)
    one["characters read that way"] = read_chars
    one["shell calls"] = shell
    one["characters that came back from shell calls"] = shell_chars
    one["read and written, in tokens, from its first message to its last"] = (last_read - first_read) if path and first_read is not None else None
    one["programs named in shell calls"] = dict(programs)
    one["output tokens"] = sum(tokens.values())
    one["messages"] = len(tokens)
    one["what ley check said along the way"] = said
    # ---- the ledger
    ledger = os.path.join(box, "ley.toml")
    rows = tomllib.load(open(ledger, "rb")).get("row", []) if os.path.exists(ledger) else []
    kinds = collections.Counter()
    for row in rows:
        run = row.get("run")
        kinds["said by a source" if run is None else " ".join(run.split()[:2]) if run.startswith("ast-grep") else run.split()[0]] += 1
    one["rows"] = len(rows)
    one["rows by what they run"] = dict(kinds)
    one["rows with a count"] = sum("count" in r for r in rows)
    one["characters of the ledger"] = os.path.getsize(ledger) if os.path.exists(ledger) else 0
    text = "\n".join(str(v) for r in rows for v in r.values())
    in_run = set(WORD.findall("\n".join(r.get("run", "") for r in rows)))
    in_all = set(WORD.findall(text))
    one["exported names in a command"] = sorted(n for n in exported if n in in_run)
    one["exported names anywhere in the ledger"] = sum(n in in_all for n in exported)
    one["paths outside camera in commands"] = sorted({p for r in rows for p in re.findall(r"src/[A-Za-z0-9_./-]+", r.get("run", ""))
                                                      if not p.startswith("src/camera")})
    one["words of commands"] = sorted(w for w in in_run if len(w) > 5)

if "--json" in sys.argv:
    json.dump(out, open(sys.argv[sys.argv.index("--json") + 1], "w", encoding="utf-8"), indent=1, default=dict)
for name, one in out.items():
    print(f"== {name}: {one['rows']} rows {one['rows by what they run']}, {one['rows with a count']} with a count, "
          f"{one['characters of the ledger']} characters")
    print(f"   {one['messages']} messages, {one['output tokens']} output tokens, {one['shell calls']} shell calls {one['programs named in shell calls']}")
    print(f"   {one['characters that came back from shell calls']} characters came back from shell calls; read and written grew by {one['read and written, in tokens, from its first message to its last']} tokens")
    print(f"   tools: {dict(one['calls of the tools by the mapper'])}; help: {[(h['call'], h['printed']) for h in one['calls for help']]}")
    print(f"   ended badly: {one['calls that ended badly']}")
    print(f"   checks: {one['checks by the mapper']}; ley said: {one['what ley check said along the way'][:12]}")
    print(f"   exported names: {len(one['exported names in a command'])} of {len(exported)} in a command, {one['exported names anywhere in the ledger']} anywhere; outside camera: {len(one['paths outside camera in commands'])} paths")
shared = collections.Counter(w for one in out.values() for w in set(one["words of commands"]))
print("== words in the commands of four or more ledgers:", sorted(w for w, n in shared.items() if n >= 4))
print("== exported names in the commands of N ledgers:", dict(sorted(collections.Counter(
    sum(n in one["exported names in a command"] for one in out.values()) for n in exported).items())))

#!/usr/bin/env python3
"""Per try: messages, tool lines, what each tool result held (guide, help, code, task, other), and what was before the first right call.
analyse.py <run> -> writes analysed-<run>.json"""
import json, glob, os, sys, re, difflib, collections
REPO = "/home/user/Kung-Fu"; OUT = os.path.dirname(os.path.abspath(__file__))
AG = "/tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/tools/node_modules/.bin/ast-grep"
sys.path.insert(0, REPO + "/bench")
import score, sets, compare
run = sys.argv[1]
HELP = {name: open(f"{OUT}/{name}.txt").read().splitlines() for name in ("help-long", "help-short", "help-top", "help-top-short")}
PREFIX = re.compile(r"^\s*\d+(?:\t|→|\s{1,2}(?=\S)|: ?|\| ?|$)")

def norm(line):
    return line.rstrip()

def blocks(ref, got, least=2):
    """Which lines of ref (indices) appear in got, as runs of at least `least` lines (blank lines do not count toward the run)."""
    a = [norm(x) for x in ref]; b = [norm(x) for x in got]
    b2 = [PREFIX.sub("", x) if PREFIX.match(x) else x for x in b]
    seen_ref, seen_got = set(), set()
    for bb in (b, b2):
        sm = difflib.SequenceMatcher(None, a, bb, autojunk=False)
        for m in sm.get_matching_blocks():
            solid = sum(1 for i in range(m.a, m.a + m.size) if a[i].strip() and len(a[i].strip()) > 3)
            if solid >= least or (m.size and solid >= 1 and len(a[m.a].strip()) > 25):
                seen_ref.update(range(m.a, m.a + m.size)); seen_got.update(range(m.b, m.b + m.size))
    return seen_ref, seen_got

res = {}
for f in sorted(glob.glob(f"{OUT}/tries/{run}__*.json")):
    tag = os.path.basename(f)[len(run) + 2:-5].replace("__", "/")
    if "dup" in tag: continue
    arm, task, v = tag.split("/"); variant = int(v[1:])
    kept = f"{REPO}/bench/runs/{run}/{tag}"
    d = json.load(open(f)); one = score.read(AG, kept); rec = one["record"]
    setup = one["setup"]; work = setup["work"]
    built = sets.built(setup.get("set", "pilot"), variant)
    src = {n: open(os.path.join(built, "clean", "src", n)).read().splitlines() for n in sorted(os.listdir(os.path.join(built, "clean", "src")))}
    guide_name = (setup.get("material") or [None])[0]
    guide = open(f"{REPO}/bench/guides/outline2/{guide_name}").read().splitlines() if guide_name else []
    taskmd = open(kept + "/task.md").read().splitlines()
    wrapper_mark = "Every call is written down"
    # messages
    msgs = collections.OrderedDict(); results = {}
    for e in d["events"]:
        if "id" in e:
            m = msgs.setdefault(e["id"], {"in": 0, "out": 0, "uses": [], "says": [], "thinks": 0})
            m["in"] = max(m["in"], e["in"]); m["out"] = max(m["out"], e["out"])
            if e["k"] == "tool_use": m["uses"].append(e)
            elif e["k"] == "text" and (e.get("text") or "").strip(): m["says"].append(e["text"])
            elif e["k"] == "thinking": m["thinks"] += len(e.get("text") or "")
        elif e["k"] == "tool_result": results[e["tuid"]] = e
    msgs = list(msgs.values())
    assert len(msgs) == len(rec["messages"]), tag
    reads = [m["in"] for m in msgs]
    # the message that made the first right call
    k = None
    if one["first"]:
        at = one["made"][one["first"] - 1][0]["at"]
        k = [n for n, m in enumerate(rec["messages"]) if m["at"] <= at][-1]
    out_msgs = []
    helpseen = {name: set() for name in HELP}; srcseen = {n: set() for n in src}; guideseen = set(); taskseen = set()
    helpseen_before = set(); srcseen_before = {n: set() for n in src}
    wrapper_read = False
    for n, m in enumerate(msgs):
        row = {"n": n, "in": m["in"], "out": m["out"], "says": " ".join(" ".join(m["says"]).split())[:400], "uses": []}
        for u in m["uses"]:
            i = u.get("input") or {}
            what = i.get("command") or i.get("file_path") or i.get("pattern") or json.dumps(i)[:300]
            if u["name"] == "Write": what = f'{i.get("file_path")} <- {json.dumps(i.get("content"))}'
            if u["name"] == "Edit": what = f'{i.get("file_path")} edit {json.dumps(i.get("old_string"))} -> {json.dumps(i.get("new_string"))}'
            if u["name"] == "Read" and (i.get("offset") or i.get("limit")): what += f" [offset={i.get('offset')} limit={i.get('limit')}]"
            if u["name"] == "SubagentHandback": what = "(report)"
            r = results.get(u["tuid"]); text = (r or {}).get("text") or ""
            lines = text.splitlines()
            cat = [None] * len(lines)
            # order matters: guide and task first, then help, then code
            for name, ref in (("task", taskmd), ("guide", guide)):
                if ref:
                    sr, sg = blocks(ref, lines)
                    for j in sg:
                        if cat[j] is None: cat[j] = name
                    if name == "guide": guideseen |= sr
                    else: taskseen |= sr
            for name, ref in HELP.items():
                sr, sg = blocks(ref, lines, least=3)
                # the short help shares lines with nothing else; the long one is told apart by its long lines
                newly = [j for j in sg if cat[j] is None]
                if len([j for j in newly if lines[j].strip()]) >= 3:
                    for j in newly: cat[j] = "help:" + name
                    helpseen[name] |= sr
                    if name == "help-long" and (k is None or n < k): helpseen_before |= sr
            for fn, ref in src.items():
                sr, sg = blocks(ref, lines, least=3)
                newly = [j for j in sg if cat[j] is None]
                if newly:
                    for j in newly: cat[j] = "code"
                    srcseen[fn] |= sr
                    if k is None or n < k: srcseen_before[fn] |= sr
            if wrapper_mark in text: wrapper_read = True
            # blank and unclassified lines between two lines of one kind take that kind
            last = None
            for j in range(len(lines)):
                if cat[j] is None and not lines[j].strip() and last: cat[j] = last
                elif cat[j] is not None: last = cat[j]
            chars = collections.Counter()
            for j, line in enumerate(lines): chars[cat[j] or "other"] += len(line) + 1
            row["uses"].append({"name": u["name"], "what": what.replace(work, "D"), "chars": len(text), "by": dict(chars),
                                "err": bool((r or {}).get("is_error")), "head": text[:1500].replace(work, "D"), "tail": text[-300:].replace(work, "D") if len(text) > 1500 else ""})
        out_msgs.append(row)
    res[tag] = {"k": k, "began": one["began"], "held_first": one["held at first"], "held_end": one["held at end"], "before_out": one["before"],
                "first": one["first"], "ncalls": len(one["made"]), "kinds": one["kinds"], "calls": [{"argv": c["argv"], "status": c["status"], "at": c["at"], "cwd": c["cwd"]} for c in one["calls"]],
                "msg_at": [m["at"] for m in rec["messages"]], "verdict": one["verdict"], "command": one["command"], "sure": one["sure"], "took": one["took"],
                "msgs": out_msgs, "help": {n: sorted(s) for n, s in helpseen.items()}, "help_before": sorted(helpseen_before),
                "src": {n: [len(s), len(src[n])] for n, s in srcseen.items()}, "src_before": {n: [len(s), len(src[n])] for n, s in srcseen_before.items()},
                "src_lines_solid": {n: [sum(1 for i in s if src[n][i].strip()), sum(1 for l in src[n] if l.strip())] for n, s in srcseen.items()},
                "guide": [len(guideseen), len(guide)], "task": [len(taskseen), len(taskmd)], "wrapper": wrapper_read,
                "outside": rec.get("outside"), "code_unchanged": rec.get("code_unchanged"), "tools": d["tools"]}
json.dump(res, open(f"{OUT}/analysed-{run}.json", "w"))
print(run, len(res), "tries analysed")

#!/usr/bin/env python3
"""Tokens before the first right call by kind: each step's tokens are the harness's; the first step has H tokens of the harness's own
(the instructions of four connected services) taken out first; the rest of a step is shared among its results by characters."""
import json, sys, os, collections
OUT = os.path.dirname(os.path.abspath(__file__)); run = sys.argv[1]; H = int(sys.argv[2]) if len(sys.argv) > 2 else 2728
A = json.load(open(f"{OUT}/analysed-{run}.json"))
KINDS = ["written", "harness", "task", "guide", "help", "code", "other"]
def kind(c): return "help" if c.startswith("help:") else c
rows = {}
for tag, t in A.items():
    k = t["k"]; msgs = t["msgs"]; G = t["held_first"] - t["began"]; tok = collections.Counter()
    tok["written"] = sum(m["out"] for m in msgs[:k + 1])
    for n in range(k):
        m = msgs[n]; by = collections.Counter()
        for u in m["uses"]:
            for c, v in u["by"].items(): by[kind(c)] += v
        step = msgs[n + 1]["in"] - m["in"] - m["out"]
        if n == 0: tok["harness"] += H; step -= H
        tot = sum(by.values())
        for c, v in by.items(): tok[c] += step * v / tot
        if not tot: tok["other"] += step
    assert abs(sum(tok.values()) - G) < 1e-6, (tag, sum(tok.values()), G)
    rows[tag] = tok
arms = [a for a in ("none", "facts", "rows") if any(t.startswith(a + "/") for t in rows)]
def mean(arm, c, task=None):
    v = [r.get(c, 0) for tag, r in rows.items() if tag.startswith(arm + "/") and (task is None or tag.split("/")[1] == task)]
    return sum(v) / len(v)
for task in [None] + sorted({t.split("/")[1] for t in rows}):
    print(f"\n{run} {task or 'all tasks'}: tokens for a try before its first right call, by kind (harness part taken as {H:,})")
    print(f"{'':10}" + "".join(f"{a:>9}" for a in arms) + ("   facts-none rows-none facts-rows" if len(arms) == 3 else ""))
    tot = {a: 0 for a in arms}
    for c in KINDS:
        v = {a: mean(a, c, task) for a in arms}
        for a in arms: tot[a] += v[a]
        s = f"{c:10}" + "".join(f"{v[a]:9,.0f}" for a in arms)
        if len(arms) == 3: s += f"   {v['facts'] - v['none']:+9,.0f} {v['rows'] - v['none']:+9,.0f} {v['facts'] - v['rows']:+9,.0f}"
        print(s)
    s = f"{'all':10}" + "".join(f"{tot[a]:9,.0f}" for a in arms)
    if len(arms) == 3: s += f"   {tot['facts'] - tot['none']:+9,.0f} {tot['rows'] - tot['none']:+9,.0f} {tot['facts'] - tot['rows']:+9,.0f}"
    print(s)

#!/usr/bin/env python3
"""By kind, the difference between two arms for a try, with the pairs drawn again (20,000 times) and with the five tasks drawn again."""
import json, sys, os, collections, random
OUT = os.path.dirname(os.path.abspath(__file__)); H = 2728
def kind(c): return "help" if c.startswith("help:") else c
def load(run):
    A = json.load(open(f"{OUT}/analysed-{run}.json")); rows = {}
    for tag, t in A.items():
        k = t["k"]; msgs = t["msgs"]; tok = collections.Counter(); tok["written"] = sum(m["out"] for m in msgs[:k + 1])
        for n in range(k):
            m = msgs[n]; by = collections.Counter()
            for u in m["uses"]:
                for c, v in u["by"].items(): by[kind(c)] += v
            step = msgs[n + 1]["in"] - m["in"] - m["out"]
            if n == 0: tok["harness"] += H; step -= H
            tot = sum(by.values())
            for c, v in by.items(): tok[c] += step * v / tot
            if not tot: tok["other"] += step
        tok["calls: written and other output"] = tok["written"] + tok["other"]
        tok["reading the guide, the help and the code"] = tok["guide"] + tok["help"] + tok["code"]
        tok["all"] = t["held_first"] - t["began"]
        arm, task, v = tag.split("/"); rows[(arm, task, v)] = tok
    return rows
now = load("2026-11-13-fourth-a"); pilot = {("pilot",) + k[1:]: v for k, v in load("2026-11-13-third-shell").items()}
allr = {**now, **pilot}
def cmp(a, b):
    keys = sorted((k[1], k[2]) for k in allr if k[0] == a); tasks = sorted({k[0] for k in keys})
    print(f"\n{a} less {b}, for a try (tokens), with the pairs drawn again, and with the five tasks drawn again")
    for c in ("all", "help", "guide", "code", "task", "written", "other", "calls: written and other output", "reading the guide, the help and the code"):
        d = [allr[(a,) + k].get(c, 0) - allr[(b,) + k].get(c, 0) for k in keys]
        draw = random.Random(20261112); n = len(d)
        ms = sorted(sum(draw.choice(d) for _ in range(n)) / n for _ in range(20000))
        bt = {t: [x for x, k in zip(d, keys) if k[0] == t] for t in tasks}
        draw = random.Random(20261113); ts = []
        for _ in range(20000):
            picked = [draw.choice(tasks) for _ in tasks]; ts.append(sum(sum(bt[t]) for t in picked) / n)
        ts.sort()
        print(f"   {c:42} {sum(d) / n:+8,.0f}   pairs {ms[500]:+7,.0f} to {ms[19499]:+7,.0f}   tasks {ts[500]:+7,.0f} to {ts[19499]:+7,.0f}   less in {sum(x < 0 for x in d)} of {n} pairs")
cmp("facts", "none"); cmp("rows", "none"); cmp("facts", "rows"); cmp("none", "pilot")

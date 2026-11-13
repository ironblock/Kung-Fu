#!/usr/bin/env python3
"""Every way a subject got help text: the pieces of its commands that ask for help, in which message, against the message of the first right call;
every call ast-grep ended with a status other than 0, and what it printed."""
import json, sys, os, re, collections
OUT = os.path.dirname(os.path.abspath(__file__)); run = sys.argv[1]
A = json.load(open(f"{OUT}/analysed-{run}.json"))
pat = collections.Counter()
for tag in sorted(A):
    t = A[tag]; out = []
    for m in t["msgs"]:
        for u in m["uses"]:
            if u["name"] != "Bash": continue
            for seg in re.split(r"&&|;|\n", u["what"]):
                if re.search(r"(--help|\s-h\b|\bhelp\b|\bman\b|--usage)", seg):
                    s = " ".join(seg.split()); out.append(f"m{m['n']}: {s}")
                    pat[(tag.split('/')[0], re.sub(r"\s*2>&1", "", s))] += 1
    hc = [(" ".join(c["argv"])) for c in t["calls"] if any(w in ("--help", "-h", "help") for w in c["argv"])]
    print(f"{tag:14} k={t['k']} | logged help calls {hc} | " + " || ".join(out))
print()
for (arm, s), n in sorted(pat.items(), key=lambda x: (x[0][0], -x[1])): print(f"  {arm:6} {n:3}  {s}")
print("\ncalls with a status other than 0:")
for tag in sorted(A):
    t = A[tag]
    for c, kind in zip(t["calls"], t["kinds"]):
        if c["status"] != 0: print("  ", tag, c["status"], kind, " ".join(c["argv"]))
print("\nresults that hold an error or usage line of ast-grep:")
for tag in sorted(A):
    for m in A[tag]["msgs"]:
        for u in m["uses"]:
            for mm in re.finditer(r"(?m)^(error: .*|Usage: .*|\s*\[possible values: .*|.*tip: .*|For more information.*)$", u["head"] + u["tail"]):
                line = mm.group(1).strip()
                if line.startswith("Usage: ast-grep outline [OPTIONS] [PATHS]...") : continue
                print("  ", tag, f"m{m['n']}", "|", line[:200])

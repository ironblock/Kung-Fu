#!/usr/bin/env python3
"""Count the rows that fail on a copy of the code in which nothing the code does was changed.

Usage: alarms.py LEY TOOLS TREES ROUND [ROUND ...]

LEY is the `ley` program and TOOLS a directory that holds `ast-grep`. TREES holds one directory for each
change, with the changed copy in it as `src`: `none` (the code as it was), and `comments`, `names` and
`format`, each made by `tidy.js`. ROUND is a round's directory, with `ledgers/<mapper>.toml`.

For each round this writes `ROUND/alarms.json`: for each mapper and each change, the names of the rows that
did not hold. Under `none` every row must hold, or the copy is not the code the ledgers were written on.
"""
import json, os, re, shutil, subprocess, sys

ley, tools, trees = sys.argv[1:4]
KINDS = ["none", "comments", "names", "format"]
env = dict(os.environ, PATH=tools + os.pathsep + os.environ["PATH"])
for top in sys.argv[4:]:
    out = {}
    for file in sorted(os.listdir(os.path.join(top, "ledgers"))):
        mapper = file[:-len(".toml")]
        out[mapper] = {}
        for kind in KINDS:
            there = os.path.join(trees, kind)
            shutil.copy(os.path.join(top, "ledgers", file), os.path.join(there, "ley-alarms.toml"))
            said = subprocess.run([ley, "check", "--ledger", "ley-alarms.toml"], cwd=there, env=env, capture_output=True, text=True)
            os.remove(os.path.join(there, "ley-alarms.toml"))
            lines = (said.stdout + said.stderr).splitlines()
            failed = [m.group(2) for m in (re.match(r'ley-alarms\.toml:\d+: ([a-z ]+): "(.*?)": ', l) for l in lines) if m]
            last = re.search(r"(\d+) rows?: (?:(\d+) holds?)?", lines[-1])
            assert last and int(last.group(1)) - int(last.group(2) or 0) == len(failed), (mapper, kind, lines[-1], len(failed))
            out[mapper][kind] = failed
        assert not out[mapper]["none"], f"{mapper}: rows fail on the code as it was"
    json.dump(out, open(os.path.join(top, "alarms.json"), "w"), indent=1, ensure_ascii=False)
    rows = sum(len(re.findall(r"(?m)^\[\[row\]\]", open(os.path.join(top, "ledgers", f)).read())) for f in os.listdir(os.path.join(top, "ledgers")))
    print(top, f"rows {rows}", *(f"| {k}: {sum(len(out[m][k]) for m in out)}" for k in KINDS[1:]),
          f"| any: {sum(len(set().union(*(out[m][k] for k in KINDS[1:]))) for m in out)}")

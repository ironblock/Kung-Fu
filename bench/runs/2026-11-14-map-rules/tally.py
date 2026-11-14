#!/usr/bin/env python3
"""Count what a round of ledgers came to. Usage: tally.py NAME=DIR [NAME=DIR ...]

DIR holds `ledgers/<mapper>.toml`, and may hold `marks/<mapper>.tsv` (a checker's marks), `breaks/<mapper>.tsv`
(a breaker's faults and breaks) and `stale.json` (for each mapper, how many rows fail at the library's later head).
"""
import collections, json, os, re, sys, tomllib

TWELVE = ["_cameraChangeKey", "_projRev", "_beforeRender", "_orthoProjector", "_installOrthographicProjector",
          "_useFloatingOrigin", "_rightHanded", "_arcRotateKeyboardFactory", "_clampToLimits", "_createFreeCamera",
          "createArcRotateCamera", "createFreeCamera"]
MARKS = ["shown", "true", "false", "unclear"]
FAULTS = ["number", "tautology", "list", "exists"]
ENDS = ["caught", "missed", "already false", "no change found"]


def fields(path):
    return [line.split("\t") for line in open(path, encoding="utf-8").read().splitlines() if line.strip()]


for arg in sys.argv[1:]:
    name, top = arg.split("=", 1)
    stale = json.load(open(os.path.join(top, "stale.json"))) if os.path.exists(os.path.join(top, "stale.json")) else {}
    total = collections.Counter()
    print(f"== {name}")
    for file in sorted(os.listdir(os.path.join(top, "ledgers"))):
        mapper = file[:-len(".toml")]
        rows = tomllib.load(open(os.path.join(top, "ledgers", file), "rb")).get("row", [])
        one = collections.Counter(rows=len(rows))
        one["ast-grep"] = sum(r.get("run", "").startswith("ast-grep") for r in rows)
        one["zero"] = sum(r.get("count") == 0 for r in rows)
        one["big count"] = sum(r.get("count", 1) >= 10 for r in rows)
        text = "\n".join(r.get("run", "") + " " + r.get("shows", "") + " " + r.get("name", "") for r in rows)
        one["of the twelve"] = sum(bool(re.search(r"(?<![A-Za-z0-9_])" + re.escape(n) + r"(?![A-Za-z0-9_])", text)) for n in TWELVE)
        marks = os.path.join(top, "marks", mapper + ".tsv")
        if os.path.exists(marks):
            got = [f[1].strip() for f in fields(marks) if len(f) > 1 and f[1].strip() in MARKS]
            assert len(got) == len(rows), f"{mapper}: {len(got)} marks for {len(rows)} rows"
            for mark in got:
                one[mark] += 1
        breaks = os.path.join(top, "breaks", mapper + ".tsv")
        if os.path.exists(breaks):
            got = [f for f in fields(breaks) if len(f) >= 4]
            assert len(got) == len(rows), f"{mapper}: {len(got)} lines of breaks for {len(rows)} rows"
            for f in got:
                faults = {w.strip() for w in f[1].split(",")} & set(FAULTS)
                one["with a fault"] += bool(faults)
                for fault in faults:
                    one[fault] += 1
                if f[3].strip() in ENDS:
                    one[f[3].strip()] += 1
        if mapper in stale:
            one["fail a week on"] = stale[mapper]
        total.update(one)
        print(f"  {mapper:9} rows {one['rows']:3} | ast-grep {one['ast-grep']:2} | count of 0: {one['zero']:2}, of 10 or more: {one['big count']:2}"
              f" | shown {one['shown']:2} true {one['true']:2} false {one['false']:2} unclear {one['unclear']}"
              f" | faults: {one['with a fault']:2} rows ({one['number']} number, {one['tautology']} tautology, {one['list']} list, {one['exists']} exists)"
              f" | broken: {one['caught']} caught, {one['missed']} missed, {one['already false']} already false, {one['no change found']} no change"
              f" | fail a week on: {one.get('fail a week on', '-')} | of the twelve: {one['of the twelve']}")
    n = total["rows"]
    tried = total["caught"] + total["missed"]
    print(f"  all       rows {n} | ast-grep {total['ast-grep']} ({100 * total['ast-grep'] // max(n, 1)}%) | shown {total['shown']} true {total['true']}"
          f" false {total['false']} ({100 * total['false'] // max(n, 1)}%) unclear {total['unclear']} | rows with a fault {total['with a fault']}"
          f" ({100 * total['with a fault'] // max(n, 1)}%) | caught {total['caught']} of {tried} broken"
          f" ({100 * total['caught'] // max(tried, 1)}%) | fail a week on {total['fail a week on']} | of the twelve, on average {total['of the twelve'] / max(len(os.listdir(os.path.join(top, 'ledgers'))), 1):.1f}")

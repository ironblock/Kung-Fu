#!/usr/bin/env python3
"""Count what a round of ledgers came to. Usage: tally.py NAME=DIR [NAME=DIR ...]

DIR holds `ledgers/<mapper>.toml`, and may hold `marks/<mapper>.tsv` (a checker's marks), `breaks/<mapper>.tsv`
(a breaker's faults and breaks), `stale.json` (for each mapper, how many rows fail at the library's later head)
and `alarms.json` (from `alarms.py`: for each mapper, the rows that fail on each copy in which nothing the code
does was changed).

After the rows of each mapper comes a line for the round. It adds three things. `by any row` counts a break as
caught when the row itself or any other row of its ledger failed. `shown rows` and `other rows` give the breaks
caught apart for rows whose sentence the checker marked `shown` and for the rest. `alarms` gives the rows that
fail on each harmless change, and on any of them.
"""
import collections, json, os, re, sys, tomllib

TWELVE = ["_cameraChangeKey", "_projRev", "_beforeRender", "_orthoProjector", "_installOrthographicProjector",
          "_useFloatingOrigin", "_rightHanded", "_arcRotateKeyboardFactory", "_clampToLimits", "_createFreeCamera",
          "createArcRotateCamera", "createFreeCamera"]
MARKS = ["shown", "true", "false", "unclear"]
FAULTS = ["number", "tautology", "list", "exists"]  # a note has the fault `note`, counted apart
ENDS = ["caught", "missed", "already false", "no change found"]


def pct(part, whole):
    """A share as a whole number of hundredths, rounded to the nearest."""
    return int(100 * part / max(whole, 1) + 0.5)


def fields(path):
    return [line.split("\t") for line in open(path, encoding="utf-8").read().splitlines() if line.strip()]


for arg in sys.argv[1:]:
    name, top = arg.split("=", 1)
    stale = json.load(open(os.path.join(top, "stale.json"))) if os.path.exists(os.path.join(top, "stale.json")) else {}
    alarms = json.load(open(os.path.join(top, "alarms.json"))) if os.path.exists(os.path.join(top, "alarms.json")) else {}
    total = collections.Counter()
    print(f"== {name}")
    for file in sorted(os.listdir(os.path.join(top, "ledgers"))):
        mapper = file[:-len(".toml")]
        rows = tomllib.load(open(os.path.join(top, "ledgers", file), "rb")).get("row", [])
        one = collections.Counter(rows=len(rows))
        note = ["run" not in r for r in rows]
        one["notes"] = sum(note)
        one["ast-grep"] = sum(r.get("run", "").startswith("ast-grep") for r in rows)
        one["zero"] = sum(r.get("count") == 0 for r in rows)
        one["big count"] = sum(r.get("count", 1) >= 10 for r in rows)
        text = "\n".join(r.get("run", "") + " " + r.get("shows", "") + " " + r.get("name", "") for r in rows)
        one["of the twelve"] = sum(bool(re.search(r"(?<![A-Za-z0-9_])" + re.escape(n) + r"(?![A-Za-z0-9_])", text)) for n in TWELVE)
        marks = os.path.join(top, "marks", mapper + ".tsv")
        marked = []
        if os.path.exists(marks):
            got = [f[1].strip() for f in fields(marks) if len(f) > 1 and f[1].strip() in MARKS]
            assert len(got) == len(rows), f"{mapper}: {len(got)} marks for {len(rows)} rows"
            marked = got
            for mark, is_note in zip(got, note):
                one[("note " if is_note else "") + mark] += 1
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
            for i, f in enumerate(got):
                end = f[3].strip()
                if end in ("caught", "missed"):
                    others = f[4].strip() if len(f) > 4 else "0"
                    by_any = end == "caught" or (others.isdigit() and int(others) > 0)
                    one["every break by any row"] += by_any
                    if not note[i]:
                        one["by any row"] += by_any
                    if note[i]:
                        one["notes broken"] += 1
                        one["notes caught by another row"] += others.isdigit() and int(others) > 0
                        one[end] -= 1  # a note has no test of its own: it is counted apart from the tests
                    elif marked:
                        kind = "shown rows" if marked[i] == "shown" else "other rows"
                        one[kind + " broken"] += 1
                        one[kind + " caught"] += end == "caught"
        if mapper in alarms:
            for kind in ("comments", "names", "format"):
                one["alarm " + kind] = len(alarms[mapper][kind])
            one["alarm any"] = len(set().union(*(alarms[mapper][k] for k in ("comments", "names", "format"))))
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
    print(f"  all       rows {n} | ast-grep {total['ast-grep']} ({pct(total['ast-grep'], n)}%) | shown {total['shown']} true {total['true']}"
          f" false {total['false']} ({pct(total['false'], n)}%) unclear {total['unclear']} | rows with a fault {total['with a fault']}"
          f" ({pct(total['with a fault'], n)}%) | caught {total['caught']} of {tried} broken"
          f" ({pct(total['caught'], tried)}%) | fail a week on {total['fail a week on']} | of the twelve, on average {total['of the twelve'] / max(len(os.listdir(os.path.join(top, 'ledgers'))), 1):.1f}")
    print(f"            by any row: caught {total['by any row']} of {tried} ({pct(total['by any row'], tried)}%)"
          f" | shown rows: caught {total['shown rows caught']} of {total['shown rows broken']}"
          f" | other rows: caught {total['other rows caught']} of {total['other rows broken']}"
          + (f" | alarms: comments {total['alarm comments']}, names {total['alarm names']}, format {total['alarm format']},"
             f" any {total['alarm any']} ({pct(total['alarm any'], n)}%)" if alarms else " | alarms: not run"))
    if total["notes"]:
        tests = n - total["notes"]
        print(f"            tests {tests}, of them shown {total['shown']} ({pct(total['shown'], tests)}%), false {total['false']}"
              f" | notes {total['notes']}: true {total['note true']}, false {total['note false']}, unclear {total['note unclear']}"
              f" | notes broken {total['notes broken']}, of them caught by another row {total['notes caught by another row']}"
              f" | every break, of a test or a note, caught by any row: {total['every break by any row']} of {tried + total['notes broken']}"
              f" ({pct(total['every break by any row'], tried + total['notes broken'])}%)")

#!/usr/bin/env python3
"""Set each try's pass or fail beside what a judge said its text holds.

    join.py

`judged.json` holds, for each of the 26 camera tasks, what a right answer needs that the bare declarations
do not tell, and a verdict on each text: "all" (it states every need rightly), "part" (some, none wrongly),
"wrong" (it says something false, or so wide that a reader who trusts it answers this task wrongly) or "none".
The judges did not know how any subject did. This program joins those verdicts with the kept grades of two
runs, `2026-11-15-camera-notes` and `2026-11-15-camera-union`, and prints the tables.

A try's text is the one its setup.json names. For an arm cut to a list's first N notes, the verdict is that
of the whole list when one of the notes the judge named has a number of N or less, and "none" otherwise. That
is a rough rule: it cannot tell "all" from "part" after a cut.
"""
import collections
import glob
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
RUNS = os.path.dirname(os.path.dirname(HERE))
with open(os.path.join(HERE, "judged.json"), encoding="utf-8") as handle:
    JUDGED = json.load(handle)
SPOILED_BY_CHECK = ("C1", "C2", "G4")
ORDER = ("all", "part", "wrong", "none")
CUTS = {"mended-top10": 10, "union-top10": 10, "union-top25": 25}
ROOM = ("A1", "A5", "C1", "C3", "C4", "C5", "F1", "F5", "G2", "G4", "G5", "I1", "P1")


def json_of(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def first_word(path):
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as handle:
        return handle.read().split(":")[0].strip()


def tries(run):
    for grade in sorted(glob.glob(os.path.join(RUNS, run, "tries", "*", "*", "*", "grade.json"))):
        kept = os.path.dirname(grade)
        made = json_of(os.path.join(kept, "setup.json"))
        if json_of(os.path.join(kept, "record.json")).get("spoiled"):
            continue
        notes = [f["text"] for f in made["files"] if f["in app as"] == "camera-notes.md"]
        yield {"arm": made["arm"], "task": made["task"], "passed": json_of(grade)["passed"],
               "text": notes[0] if notes else ("comments" if made["arm"] == "types" else None),
               "whose": first_word(os.path.join(kept, "whose.txt"))}


def verdict(one):
    """What the judge said of the text this try held, for its task."""
    if one["text"] is None:
        return "no notes"
    name = one["text"]
    for cut, n in CUTS.items():
        if name.startswith(cut):
            whole = JUDGED[one["task"]]["texts"][name.replace("-top10", "").replace("-top25", "")]
            return whole["verdict"] if any(k <= n for k in whole["notes"]) else "none"
    return JUDGED[one["task"]]["texts"][name]["verdict"]


def table(title, rows, columns):
    print("\n" + title)
    print("  " + "".ljust(26) + "".join(c.rjust(12) for c in columns))
    for name, cells in rows:
        print("  " + name.ljust(26) + "".join(cells.get(c, "-").rjust(12) for c in columns))


def main():
    texts = ["tested-1", "tested-2", "tested-3", "mended-1", "mended-2", "mended-3", "read-1", "read-2", "read-3",
             "union", "comments"]
    rows = []
    for name in texts:
        count = collections.Counter(JUDGED[t]["texts"][name]["verdict"] for t in JUDGED)
        rows.append((name, {v: str(count[v]) for v in ORDER}))
    table("What each text holds, in tasks of 26", rows, ORDER)
    rows = []
    for kind in ("tested", "mended", "read"):
        count = collections.Counter(JUDGED[t]["texts"][f"{kind}-{w}"]["verdict"] for t in JUDGED for w in (1, 2, 3))
        rows.append((f"the three {kind} lists", {v: str(count[v]) for v in ORDER}))
    table("The same, each kind's three lists added up (78 pairs of a task and a list)", rows, ORDER)

    for run, arms in (("2026-11-15-camera-notes", ("types", "tested", "mended", "read", "mended-top10", "mended-only")),
                      ("2026-11-15-camera-union", ("mended", "union", "union-top25", "union-top10", "mended-top10"))):
        every = [dict(t, verdict=verdict(t)) for t in tries(run) if t["arm"] in arms]
        for label, keep in (("all its tasks", lambda t: True),
                            ("without C1, C2 and G4", lambda t: t["task"] not in SPOILED_BY_CHECK),
                            ("the tasks with room, without C1 and G4",
                             lambda t: t["task"] in ROOM and t["task"] not in SPOILED_BY_CHECK)):
            rows = []
            for arm in arms:
                cells = {}
                for v in ORDER:
                    got = [t for t in every if t["arm"] == arm and t["verdict"] == v and keep(t)]
                    if got:
                        cells[v] = f"{sum(t['passed'] for t in got)} of {len(got)}"
                rows.append((arm, cells))
            table(f"{run}, {label}: passes of tries, by what the try's own text holds", rows, ORDER)
        # Where a judge and a reader disagree: a failure a reader put on the text although the judge found
        # the text to hold every need, and the other way round.
        odd = collections.Counter()
        for t in every:
            if t["arm"] == "mended-only":
                continue  # with no declarations a text can hold the behaviour and still lack the call's shape
            if not t["passed"] and t["verdict"] == "all" and t["whose"] == "the text's":
                odd["failed, the judge says the text holds it all, the reader says the text's"] += 1
            if not t["passed"] and t["verdict"] == "none" and t["whose"] == "the subject's":
                odd["failed, the judge says the text holds none of it, the reader says the subject's"] += 1
            if t["passed"] and t["verdict"] == "wrong":
                odd["passed, though the judge says the text is wrong on it"] += 1
        print(f"\n{run}: where a judge and a reader disagree: {dict(odd) or 'nowhere'}")

    kinds = collections.defaultdict(list)
    for task, judged in JUDGED.items():
        kinds[judged["kind"]].append(task)
    print("\nThe tasks by the kind of thing they turn on, and where in the merged list its first note on each stands")
    for kind, names in kinds.items():
        first = [min(JUDGED[t]["texts"]["union"]["notes"]) if JUDGED[t]["texts"]["union"]["notes"] else None
                 for t in names]
        places = " ".join(f"{t}:{'-' if n is None else n}" for t, n in zip(names, first))
        there = sorted(n for n in first if n is not None)
        middle = there[len(there) // 2] if there else None
        print(f"  {kind} ({len(names)} tasks): {places}; in the first ten: "
              f"{sum(1 for n in there if n <= 10)}; the middle place: {middle}")


if __name__ == "__main__":
    main()

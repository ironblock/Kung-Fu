#!/usr/bin/env python3
"""Read the mended-notes run by the rules its note fixed before any try. It changes nothing.

    mended.py tasks [ARM]   each task: the kept arms' passes of 6, this arm's of 3, and the call
    mended.py rule  [ARM]   box.passes_rule on the arm against each kept arm; a description, it decides nothing
    mended.py sorted [ARM]  is every try that did not pass sorted in whose.txt

ARM is `mended-low` unless given. Giving a kept arm's name (`union-low-b`) reads that arm as if it were
the new one, which is how this script was tried before any try was sent.
A try cut off by its length limit is not passed. Run it from the repository's root.
"""
import json, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", ".."))
import box  # noqa: E402

KEPT_RUN = os.path.join(HERE, "..", "2026-11-17-effort-ladder")
KEPT_ARMS = ["union-low", "union-low-b"]
SEED, MATTERS = 20261115, 0.25
NAMES = ("the subject's", "the test's", "the text's", "not known")


def tries_of(run, arm):
    """task -> list of (n, passed, whose's first word or None), for the kept and graded tries."""
    out, root = {}, os.path.join(run, "tries", arm)
    if not os.path.isdir(root):
        return out
    for task in sorted(os.listdir(root)):
        for n in sorted(os.listdir(os.path.join(root, task))):
            kept = os.path.join(root, task, n)
            grade, record = os.path.join(kept, "grade.json"), os.path.join(kept, "record.json")
            if not (os.path.exists(grade) and os.path.exists(record)):
                continue
            cut = json.load(open(record)).get("finish reason") == "length"
            passed = bool(json.load(open(grade))["passed"]) and not cut
            whose = os.path.join(kept, "whose.txt")
            word = open(whose).read().split(":")[0].strip() if os.path.exists(whose) else None
            out.setdefault(task, []).append((n, passed, word))
    return out


def call(before, of_before, now, of_now):
    if of_before == 6 and of_now == 3:
        if before <= 2 and now == 3:
            return "mended"
        if before >= 4 and now == 0:
            return "broken"
        return "no change shown"
    return "not 6 kept tries and 3 new ones: no call"


def main():
    what = sys.argv[1] if len(sys.argv) > 1 else "tasks"
    arm = sys.argv[2] if len(sys.argv) > 2 else "mended-low"
    run = KEPT_RUN if arm in KEPT_ARMS + ["names-low"] else HERE
    new = tries_of(run, arm)
    kept = {a: tries_of(KEPT_RUN, a) for a in KEPT_ARMS}
    tasks = json.load(open(os.path.join(HERE, "run.json")))["tasks"]
    if what == "tasks":
        calls = {}
        print(f"{'task':5s} {'kept':>6s} {arm:>12s}  call")
        for t in tasks:
            b = [p for a in KEPT_ARMS for (_, p, _) in kept[a].get(t, [])]
            n = [p for (_, p, _) in new.get(t, [])]
            c = call(sum(b), len(b), sum(n), len(n))
            calls.setdefault(c, []).append(t)
            print(f"{t:5s} {sum(b)}/{len(b):<4d} {sum(n):>8d}/{len(n):<3d}  {c}")
        total = sum(p for t in tasks for (_, p, _) in new.get(t, []))
        tries = sum(len(new.get(t, [])) for t in tasks)
        print(f"\n{arm}: passed {total} of {tries} tries")
        for c in ("mended", "broken", "no change shown"):
            print(f"  {c}: {len(calls.get(c, []))}  {' '.join(calls.get(c, []))}")
        for c in calls:
            if c not in ("mended", "broken", "no change shown"):
                print(f"  {c}: {' '.join(calls[c])}")
    elif what == "rule":
        print("A description. By the note, this decides nothing.")
        for a in KEPT_ARMS:
            first = {t: [p for (_, p, _) in new.get(t, [])] for t in tasks}
            second = {t: [p for (_, p, _) in kept[a].get(t, [])] for t in tasks}
            if not all(first[t] and second[t] for t in tasks):
                print(f"  {arm} against {a}: not both kept and graded on every task")
                continue
            r = box.passes_rule(first, second, random.Random(SEED), matters=MATTERS)
            mean, low, high, answer = r[0], r[1], r[2], r[3]
            print(f"  {arm} against {a}: {mean:+.2f} ({low:+.2f} to {high:+.2f}); passed "
                  f"{sum(map(sum, first.values()))} of {sum(map(len, first.values()))} against "
                  f"{sum(map(sum, second.values()))} of {sum(map(len, second.values()))}: {answer}")
    elif what == "sorted":
        bad, counts = [], {}
        for t in tasks:
            for (n, passed, word) in new.get(t, []):
                if passed and word is not None:
                    bad.append(f"{arm}/{t}/{n}: passed, and has a whose.txt")
                elif not passed and word not in NAMES:
                    bad.append(f"{arm}/{t}/{n}: not passed, and " + ("not sorted" if word is None else f"its whose.txt begins {word[:30]!r}"))
                elif not passed:
                    counts[word] = counts.get(word, 0) + 1
        print(f"{arm}: " + "; ".join(f"{k} {counts.get(k, 0)}" for k in NAMES))
        print("\n".join(bad) if bad else "every try that did not pass has one sort, and no passed try has any")
        sys.exit(1 if bad else 0)
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()

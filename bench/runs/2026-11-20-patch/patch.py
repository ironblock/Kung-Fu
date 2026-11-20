#!/usr/bin/env python3
"""What this run's note asks of its tries, by a command.

    python3 patch.py report [RUN]      what each reply held, whether it applied and passed, and its tokens
    python3 patch.py rule [RUN]        the note's five questions, asked of passing and of applying
    python3 patch.py simulate          the rule on made-up subjects, at this run's sizes

RUN is this folder when left out. A try cut off by its length limit is a failure of its task and a patch that
does not apply, as `box.py compare` counts it. Spoiled tries and tries played by hand are left out. Each question
starts the rule's draws again from one seed, so that its numbers do not depend on the others.
"""
import glob
import json
import os
import random
import statistics
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", ".."))
import box  # noqa: E402

SEED = 20261115
KINDS = ("beside", "inside", "leans")
# (the words of the question, first arm, second arm, the kind it is asked on; None is every task)
QUESTIONS = [
    ("1. One arm twice. If the rule tells the two rounds apart, nothing below counts.", "whole-b", "whole", None),
    ("2. Is an outline enough to add code?", "outline", "whole", "beside"),
    ("3. Is the named part enough to change it?", "region", "whole", "inside"),
    ("4. Is the named part enough when the change leans on another body?", "region", "whole", "leans"),
    ("5. The step that can fail: the named part against the outline alone.", "region", "outline-1", "inside"),
]


def tries_of(run):
    """arm -> task -> [try], every kept and graded try that is not spoiled or played by hand."""
    out = {}
    for path in sorted(glob.glob(os.path.join(run.tries, "*", "*", "*", "grade.json"))):
        kept = os.path.dirname(path)
        arm, task, n = kept.split(os.sep)[-3:]
        record = box.json_of(os.path.join(kept, "record.json"))
        if record.get("played by hand") or record.get("spoiled"):
            continue
        cut = bool(record.get("cut off by its length limit"))
        tokens = record.get("tokens") or {}
        out.setdefault(arm, {}).setdefault(task, []).append({
            "n": int(n), "cut": cut, "passed": box.json_of(path)["passed"] and not cut,
            "applies": bool(record.get("the patch applies")) and not cut,
            "holds": record.get("what the reply holds", "?"), "edits": record.get("edits") or [],
            "out": tokens.get("output") or 0, "estimated": bool(tokens.get("estimated")),
            "message": (record.get("message") or {}).get("bytes") or 0})
    return out


def kinds_of(run):
    return {t: box.text_of(box.task_file(run.set, t, "kind.txt")).strip() for t in run.tasks()}


def lengths_of(run):
    out = {}
    for task in run.tasks():
        start = os.path.join(run.set, box.text_of(box.task_file(run.set, task, "start.txt")).strip())
        out[task] = (box.text_of(box.task_file(run.set, task, "file.txt")).strip(), box.text_of(start).count("\n"))
    return out


def report(run):
    got, kinds = tries_of(run), kinds_of(run)
    print("Each cell: tries; the reply held edits / a whole file / both / nothing; the patch applies; the check "
          "passes; output tokens as median (least to most); the message's bytes, median.")
    for arm in run.arms:
        for kind in KINDS + ("all",):
            ts = [t for task, tries in got.get(arm, {}).items() if kind in ("all", kinds[task]) for t in tries]
            if not ts:
                continue
            held = [sum(t["holds"] == w for t in ts) for w in ("edits", "a whole file", "edits and a whole file",
                                                               "nothing")]
            outs = sorted(t["out"] for t in ts)
            print(f"  {arm:8s} {kind:7s} tries {len(ts):3d}; held {held[0]}/{held[1]}/{held[2]}/{held[3]}; applies "
                  f"{sum(t['applies'] for t in ts):3d}; passes {sum(t['passed'] for t in ts):3d}; cut off "
                  f"{sum(t['cut'] for t in ts)}; output {statistics.median(outs):.0f} ({outs[0]} to {outs[-1]})"
                  + (" est." if any(t["estimated"] for t in ts) else "")
                  + f"; message {statistics.median(t['message'] for t in ts):.0f}")
    print("\nRefused edits, by arm: how many, why, and how many of the texts not found would have been found once "
          "had spaces at the ends of lines and blank lines not counted.")
    for arm in run.arms:
        edits = [e for tries in got.get(arm, {}).values() for t in tries for e in t["edits"]]
        refused = [e for e in edits if e["outcome"] not in ("applied", "added at the end", "made the file")]
        why = {}
        for e in refused:
            why[e["outcome"]] = why.get(e["outcome"], 0) + 1
        loose = sum(e.get("found with spaces and blank lines not counted") == 1 for e in refused)
        added = sum(e["outcome"] == "added at the end" for e in edits)
        print(f"  {arm:8s} edits {len(edits)}, of them added at the end {added}; refused {len(refused)} "
              f"{json.dumps(why) if why else ''}; found once with spaces not counted {loose}")
    print("\nBy task: passes of its tries, then (applies), in each arm.")
    print("  task  kind    lines  " + "  ".join(f"{a:>9s}" for a in run.arms))
    lengths = lengths_of(run)
    for task in run.tasks():
        cells = []
        for arm in run.arms:
            ts = got.get(arm, {}).get(task, [])
            cells.append(f"{sum(t['passed'] for t in ts)}({sum(t['applies'] for t in ts)})/{len(ts)}" if ts else "-")
        print(f"  {task:5s} {kinds[task]:7s} {lengths[task][1]:5d}  " + "  ".join(f"{c:>9s}" for c in cells))
    print("\nThe whole file in hand, by the file's length: the patch applies, and passes, of its tries "
          "(whole and whole-b together).")
    by_file = {}
    for arm in ("whole", "whole-b"):
        for task, ts in got.get(arm, {}).items():
            by_file.setdefault(lengths[task], []).extend(ts)
    for (rel, lines), ts in sorted(by_file.items(), key=lambda kv: kv[0][1]):
        print(f"  {rel:22s} {lines:4d} lines: applies {sum(t['applies'] for t in ts)}, passes "
              f"{sum(t['passed'] for t in ts)}, of {len(ts)}")


def rule(run):
    got, kinds = tries_of(run), kinds_of(run)
    for measure, words in (("passed", "THE CHECK PASSES"), ("applies", "THE PATCH APPLIES")):
        print(f"== {words}. The mean over tasks of (share of tries by the first) less (by the second).")
        for asked, x, y, kind in QUESTIONS:
            names = [t for t in run.tasks() if kind is None or kinds[t] == kind]
            first = {t: [r[measure] for r in got.get(x, {}).get(t, [])] for t in names if got.get(x, {}).get(t)}
            second = {t: [r[measure] for r in got.get(y, {}).get(t, [])] for t in names if got.get(y, {}).get(t)}
            print(asked)
            if not first or not second:
                print(f"  {x} against {y}: not both kept and graded")
                continue
            mean, low, high, answer, up, down = box.passes_rule(first, second, random.Random(SEED), run.matters)
            both = sorted(set(first) & set(second))
            print(f"  {x} against {y}, {kind or 'all'}, {len(both)} tasks: {mean:+.2f} ({low:+.2f} to {high:+.2f}); "
                  f"tasks where the first did more {up}, less {down}; "
                  f"{sum(sum(first[t]) for t in both)} of {sum(len(first[t]) for t in both)} against "
                  f"{sum(sum(second[t]) for t in both)} of {sum(len(second[t]) for t in both)}: {answer}")
        print()


def simulate():
    """The rule's answers on made-up subjects whose chance of passing each task is chosen."""
    box.DRAWS = 1000  # as `box.py simulate` has it; the rule itself draws 10,000 times

    def cell(a, b, tries=3, times=400):
        count = {}
        for _ in range(times):
            first = {i: [rng.random() < p for _ in range(tries)] for i, p in enumerate(a)}
            second = {i: [rng.random() < p for _ in range(tries)] for i, p in enumerate(b)}
            answer = box.passes_rule(first, second, random.Random(rng.random()), 0.25)[3].split(":")[0]
            count[answer] = count.get(answer, 0) + 1
        return "; ".join(f"{k} {round(100 * v / times)}%" for k, v in sorted(count.items()))

    for k, title in ((8, "Eight tasks, three tries each in each arm: one kind, as first planned"),
                     (16, "Sixteen tasks, three tries each in each arm: one kind (questions 2 to 5)"),
                     (24, "24 tasks, three tries each in each arm: question 1")):
        rng = random.Random(k)  # each size has its own stream of made-up runs
        print(title + "; how often each answer comes in 400 made-up runs")
        rows = [("both pass every task 9 times in 10", [0.9] * k, [0.9] * k),
                ("both pass every task 8 times in 10", [0.8] * k, [0.8] * k),
                ("both pass every task 7 times in 10", [0.7] * k, [0.7] * k),
                ("both pass half the tasks always and half never", [1, 0] * (k // 2), [1, 0] * (k // 2)),
                ("first 0.9, second 0.8, on every task", [0.9] * k, [0.8] * k),
                ("first 0.9, second 0.6, on every task", [0.9] * k, [0.6] * k),
                ("first 0.9, second 0.4, on every task", [0.9] * k, [0.4] * k),
                ("first 0.9, second 0.1, on every task", [0.9] * k, [0.1] * k),
                ("first 0.9 on every task; second 0.9 on half the tasks and 0 on the other half",
                 [0.9] * k, [0.9, 0] * (k // 2)),
                ("first 0.9 on every task; second 0.9 on three quarters and 0 on one quarter",
                 [0.9] * k, [0.9, 0.9, 0.9, 0] * (k // 4))]
        for label, a, b in rows:
            print(f"  {label}: {cell(a, b)}")


def main():
    what = sys.argv[1] if len(sys.argv) > 1 else ""
    if what == "simulate":
        simulate()
        return
    if what not in ("report", "rule"):
        sys.exit(__doc__)
    run = box.Run(sys.argv[2] if len(sys.argv) > 2 else HERE)
    (report if what == "report" else rule)(run)


main()

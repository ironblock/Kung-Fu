#!/usr/bin/env python3
"""What the note of this run needs and `box.py` does not print. It changes no file.

    ladder.py first STEP              a step's first group: did the setting take effect, and what the rest will cost
    ladder.py counts                  each arm's counts, the kept run's two arms first
    ladder.py rule                    the rule that compares, for each comparison README.md fixes
    ladder.py cost                    the rule for output tokens, for each comparison README.md fixes
    ladder.py sorted                  is every try that did not pass sorted in whose.txt, a try cut off too

    ladder.py made-up [--runs 1000]        the rule that compares, on made-up subjects, both arms drawn
    ladder.py made-up-kept [--runs 1000]   the same, a made-up arm against the kept notes arm as it was graded
    ladder.py made-up-kinds [--runs 1000]  the same, on the tasks of one kind
    ladder.py made-up-cost [--runs 1000]   the rule for output tokens, on made-up subjects
    ladder.py ignored [--draws 20000]      the rule for a step's first group, on a made-up server that ignores
                                           the setting

Written by Claude Fable 5.2 on 2026-11-17, before any try. Changed the same day, before any try, after a
check by a fresh reader: README.md lists what changed.

STEP is `off`, `low` or `medium`. A step's first group is the try numbered 1 of each task of its notes arm:
23 tries. `first` needs them kept. They need not be graded.

The kept run is `bench/runs/2026-11-16-small-screen`. Its arms `names-27b` and `union-27b` are the top step of
this run's ladder. `box.py compare` reads one run's directory, so it cannot set an arm of this run beside an arm
of that one. This file asks the same rule, `box.passes_rule`, the function `box.py compare` calls, with the same
seed, the same size that matters and the same number of draws.

Every count is made from each try's `grade.json` and `record.json`. A try played by hand or spoiled is left out,
as `box.py` leaves it out. A try cut off by its length limit is never counted as passed.

`rule` asks the rule twice. The first block decides: a try cut off is a failure of its task. The second block
is what `box.py compare` prints, where a try cut off is left out of its task. It is there to set beside the
tool, and it decides nothing. If a passed try had its file taken from inside its fence, a third block counts
such a try as a failure, as the kept run's launcher would have had it.

The rule for output tokens is this file's own. For each task it takes the arm's output tokens a try. It
divides the first arm's sum over the tasks by the second's. Then it draws the tasks again and takes the middle
95 in 100 of that share. The size that matters is a fifth.

--run and --kept name the two directories when this file is not where it was written.
"""
import argparse
import glob
import os
import random
import statistics
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
BENCH = os.path.normpath(os.path.join(HERE, "..", ".."))
if os.path.exists(os.path.join(BENCH, "box.py")):
    sys.path.insert(0, BENCH)
import box

CAP = 60000          # --max-tokens of every step of this run; the kept run had 120,000
GROUP = 23           # a step's first group: one try of each task
FIFTH = 0.2
SEED = 20261115      # the seed of `box.py compare`
TOP = {"names": "names-27b", "union": "union-27b"}
STEPS = ("off", "low", "medium")
SORTS = ("the text's", "the subject's", "the test's", "not known")
# The tries of each step, by arm, as README.md fixes them.
SIZE = {"off": {"union-off": 138, "names-off": 138},
        "low": {"union-low": 69, "names-low": 69, "union-low-b": 69},
        "medium": {"union-medium": 69, "names-medium": 69}}
# The kind of thing each task turns on, as judges who knew no result labelled it. The file is in the repository.
JUDGED = os.path.join(BENCH, "runs", "2026-11-15-camera-notes", "coverage", "judged.json")
SMALL_KIND = 8       # the rule is asked on a kind that has this many tasks or more


def kind_of(arm):
    return "union" if arm.startswith("union") else "names"


def kinds_of(tasks, path):
    """kind -> [task], for the tasks of this run, the kind with the most tasks first."""
    judged = box.json_of(path)
    out = {}
    for task in tasks:
        out.setdefault(judged[task]["kind"], []).append(task)
    return dict(sorted(out.items(), key=lambda item: -len(item[1])))


def tries_of(run_dir, arm, tasks, graded=True):
    """task -> [try], in the order of the tries' numbers, for every kept try of the arm; with `graded`, only
    the graded ones."""
    out = {}
    for path in glob.glob(os.path.join(run_dir, "tries", arm, "*", "*", "record.json")):
        kept = os.path.dirname(path)
        task, n = kept.split(os.sep)[-2:]
        record = box.json_of(path)
        grade = os.path.join(kept, "grade.json")
        if task not in tasks or record.get("played by hand") or record.get("spoiled") or \
                (graded and not os.path.exists(grade)):
            continue
        cut = bool(record.get("cut off by its length limit"))
        whose = os.path.join(kept, "whose.txt")
        out.setdefault(task, []).append({
            "task": task, "n": int(n), "cut": cut,
            "passed": os.path.exists(grade) and bool(box.json_of(grade)["passed"]) and not cut,
            "out": (record.get("tokens") or {}).get("output") or 0, "finish": record.get("finish reason"),
            "files": len(record.get("files in the reply") or []),
            "fence": bool(record.get("file lines inside their fence")),
            "whose": box.text_of(whose).split("\n")[0].strip() if os.path.exists(whose) else None,
            "reasoning": bool(record.get("reasoning text in the reply"))})
    return {task: sorted(out[task], key=lambda t: t["n"]) for task in tasks if task in out}


def capped(by, cap):
    """The arm as it would stand with this run's limit on the reply: a reply over the limit is cut off there."""
    return {task: [dict(t, out=min(t["out"], cap), cut=t["cut"] or t["out"] >= cap,
                        passed=t["passed"] and t["out"] < cap) for t in tries] for task, tries in by.items()}


def outputs(by):
    return [t["out"] for tries in by.values() for t in tries]


# ------------------------------------------------------------------------------------------------- counts

def counts(by):
    tries = [t for ts in by.values() for t in ts]
    passed = sum(t["passed"] for t in tries)
    spent = sum(t["out"] for t in tries)
    to_first, with_pass, no_pass = 0, 0, 0
    for ts in by.values():
        hit = next((i for i, t in enumerate(ts) if t["passed"]), None)
        if hit is None:
            no_pass += sum(t["out"] for t in ts)
        else:
            with_pass += 1
            to_first += sum(t["out"] for t in ts[:hit + 1])
    return {"tries": len(tries), "passed": passed, "cut off": sum(t["cut"] for t in tries),
            "only a tool call": sum(t["finish"] == "tool_calls" for t in tries),
            "no file": sum(not t["files"] for t in tries), "in fence": sum(t["fence"] for t in tries),
            "every try passed": sum(all(t["passed"] for t in ts) for ts in by.values()),
            "no try passed": sum(not any(t["passed"] for t in ts) for ts in by.values()),
            "output": spent, "median": statistics.median(t["out"] for t in tries) if tries else None,
            "a try": spent / len(tries) if tries else None,
            "a passed try": spent / passed if passed else None,
            "to the first pass": to_first, "tasks with a pass": with_pass, "on tasks with no pass": no_pass}


def show_counts(args, tasks):
    def num(value):
        return "-" if value is None else f"{value:,.0f}"
    head = ("arm", "tries", "passed", "cut off", "tool call", "no file", "in fence", "tasks all", "tasks none",
            "output", "median", "a try", "a passed try", "to first pass", "on tasks", "no pass")
    rows = [head]
    arms = [(f"{TOP[k]}, as kept", tries_of(args.kept, TOP[k], tasks)) for k in ("names", "union")]
    arms += [(f"{TOP[k]}, cut at {CAP:,}", capped(tries_of(args.kept, TOP[k], tasks), CAP))
             for k in ("names", "union")]
    arms += [(arm, tries_of(args.run, arm, tasks)) for arm in box.Run(args.run).arms]
    for name, by in arms:
        c = counts(by)
        if not c["tries"]:
            rows.append((name, "0") + ("-",) * (len(head) - 2))
            continue
        rows.append((name, str(c["tries"]), str(c["passed"]), str(c["cut off"]), str(c["only a tool call"]),
                     str(c["no file"]), str(c["in fence"]), str(c["every try passed"]), str(c["no try passed"]),
                     num(c["output"]), num(c["median"]), num(c["a try"]), num(c["a passed try"]),
                     num(c["to the first pass"]), str(c["tasks with a pass"]), num(c["on tasks with no pass"])))
    wide = [max(len(r[i]) for r in rows) for i in range(len(head))]
    print("Counts over every kept and graded try. A try cut off is not passed. `tool call`: replies that ended in\n"
          "a call to a tool. `no file`: replies that gave no file. `in fence`: replies whose file was taken from\n"
          "inside its fence, which the kept run's launcher did not take. `tasks all` and `tasks none`: tasks where\n"
          "every try passed, and where none did. `output` is in tokens: the sum, then the median of a try, then\n"
          "the sum divided by the tries, then the sum divided by the passed tries. `to first pass`: the output of\n"
          "each task's tries up to and including its first passed try, by the tries' numbers, summed over the\n"
          "`on tasks` tasks that have one. `no pass`: the output spent on the tasks that have none.")
    for r in rows:
        print("  " + r[0].ljust(wide[0]) + "".join("  " + r[i].rjust(wide[i]) for i in range(1, len(head))))
    print("\nPassed of tries, by task")
    print("  " + "arm".ljust(wide[0]) + "".join(f"{t:>5s}" for t in tasks))
    for name, by in arms:
        if "cut at" not in name:
            cells = [f"{sum(t['passed'] for t in by[k])}/{len(by[k])}" if k in by else "-" for k in tasks]
            print("  " + name.ljust(wide[0]) + "".join(f"{cell:>5s}" for cell in cells))
    kinds = kinds_of(tasks, args.judged)
    print("\nPassed of tries, by the kind of thing a task turns on")
    for kind, names in kinds.items():
        print(f"  {kind}: {len(names)} tasks, {' '.join(names)}")
    print("  " + "arm".ljust(wide[0]) + "".join(f"  kind {i} " for i in range(1, len(kinds) + 1)))
    for name, by in arms:
        if "cut at" not in name:
            cells = []
            for names in kinds.values():
                got = [t for k in names for t in by.get(k, [])]
                cells.append(f"{sum(t['passed'] for t in got)}/{len(got)}" if got else "-")
            print("  " + name.ljust(wide[0]) + "".join(f"{cell:>9s}" for cell in cells))
    print("\nFailures by their sort in whose.txt, a try cut off among them")
    for name, by in arms:
        if "cut at" not in name:
            sorts = {}
            for t in (t for ts in by.values() for t in ts if not t["passed"]):
                word = (t["whose"] or "not sorted yet").split(":")[0]
                sorts[word] = sorts.get(word, 0) + 1
            print("  " + name.ljust(wide[0]) + f"  {sum(sorts.values()):3d}: "
                  + "; ".join(f"{k} {v}" for k, v in sorted(sorts.items())))
    waiting = {arm: len(outputs(tries_of(args.run, arm, tasks, graded=False)))
               - len(outputs(tries_of(args.run, arm, tasks))) for arm in box.Run(args.run).arms}
    if any(waiting.values()):
        print("\nKept and not graded, so not counted: " + ", ".join(f"{a} {n}" for a, n in waiting.items() if n))


def is_sorted(args, tasks):
    """`box.py tally --strict` does not see a try cut off. This does: every try that did not pass has one sort,
    and no passed try has any. It also stops while a kept try is not graded, or when no try is graded at all."""
    bad = graded = waiting = 0
    for arm in box.Run(args.run).arms:
        by = tries_of(args.run, arm, tasks)
        graded += len(outputs(by))
        waiting += len(outputs(tries_of(args.run, arm, tasks, graded=False))) - len(outputs(by))
        sorts = {}
        for t in (t for ts in by.values() for t in ts):
            where = f"{arm}/{t['task']}/{t['n']}"
            word = (t["whose"] or "").split(":")[0]
            if t["passed"] and t["whose"] is not None:
                bad += 1
                print(f"  {where}: passed, and has a whose.txt")
            elif not t["passed"] and word not in SORTS:
                bad += 1
                print(f"  {where}: not passed" + (", cut off" if t["cut"] else "") + ", and "
                      + ("not sorted" if t["whose"] is None else f"its whose.txt begins {t['whose'][:40]!r}"))
            elif not t["passed"]:
                sorts[word] = sorts.get(word, 0) + 1
        print(f"{arm}: " + ("no try kept and graded" if not by else
                            f"{sum(sorts.values())} sorted: " + "; ".join(f"{k} {sorts.get(k, 0)}" for k in SORTS)))
    if bad:
        sys.exit(f"ladder.py: {bad} tries are not sorted as they must be")
    if waiting:
        sys.exit(f"ladder.py: {waiting} kept tries are not graded yet")
    if not graded:
        sys.exit("ladder.py: no try is kept and graded, so nothing is sorted")
    print("every try that did not pass has one sort, and no passed try has any")


# ------------------------------------------------------------------------------------------- the first group

def first(args, tasks):
    arm = f"union-{args.step}"
    by = tries_of(args.run, arm, tasks, graded=False)
    group = [t for task in tasks for t in by.get(task, []) if t["n"] == 1]
    if len(group) < GROUP:
        sys.exit(f"ladder.py: {arm} has {len(group)} kept tries numbered 1, and the first group is {GROUP}: "
                 "one of each task")
    kept = {k: capped(tries_of(args.kept, TOP[k], tasks), CAP) for k in TOP}
    top = outputs(tries_of(args.kept, TOP["union"], tasks))
    was, now = statistics.median(top), statistics.median(t["out"] for t in group)
    low, high = (1 - FIFTH) * was, (1 + FIFTH) * was
    spent = sum(t["out"] for t in group)
    mean = spent / len(group)
    top_try = {k: sum(outputs(kept[k])) / len(outputs(kept[k])) for k in TOP}
    print(f"{arm}, the try numbered 1 of each task: {len(group)} tries")
    print(f"  output tokens: sum {spent:,}, mean {mean:,.0f}, median {now:,.0f}; cut off "
          f"{sum(t['cut'] for t in group)}; ended in a call to a tool "
          f"{sum(t['finish'] == 'tool_calls' for t in group)}; "
          f"with reasoning text in the reply {sum(t['reasoning'] for t in group)}")
    print(f"  the kept run's {TOP['union']}: median {was:,.0f} over {len(top)} tries; a fifth either side of it is "
          f"{low:,.0f} to {high:,.0f}")
    if low <= now <= high:
        print("  WITHIN A FIFTH. By the rule the server did not honour the setting. Stop, and say so.")
    elif now < low:
        print(f"  below it: the median is {now / was:.2f} of the kept run's. The setting is taken as honoured.")
    else:
        print(f"  ABOVE IT: the median is {now / was:.2f} of the kept run's. That is not what a lower setting is "
              "for. Stop, and say so.")
    print(f"  the kept run's {TOP['union']}, with a reply counted as {CAP:,} at most: {top_try['union']:,.0f} output "
          "tokens a try")
    if mean >= top_try["union"]:
        print(f"  THE MEAN IS NOT BELOW THE TOP'S: {mean:,.0f} a try. The rest would cost what the top step cost, or "
              "more. Stop, and say so.")
    else:
        print(f"  the mean is {mean / top_try['union']:.2f} of that")
    rest = {a: size - (GROUP if a == arm else 0) for a, size in SIZE[args.step].items()}
    scale = {a: top_try[kind_of(a)] / top_try["union"] for a in rest}
    print(f"  the rest of the step `{args.step}`: " + ", ".join(f"{a} {n}" for a, n in rest.items())
          + f" = {sum(rest.values())} tries")
    print(f"    at this group's mean a try: about {mean * sum(rest.values()):,.0f} output tokens")
    print(f"    with a bare arm's try taken as {scale['names-' + args.step]:.2f} of a notes arm's, as in the kept "
          f"run: about {sum(mean * scale[a] * n for a, n in rest.items()):,.0f}")
    print(f"    the same tries at the top step, at the kept run's output a try: about "
          f"{sum(top_try[kind_of(a)] * n for a, n in rest.items()):,.0f}")
    print(f"    at most, were every reply to reach its limit of {CAP:,}: {CAP * sum(rest.values()):,}")


def ignored(args, tasks):
    """A made-up server that ignores the setting gives tries like the kept run's own. Its first group is then
    one kept try of each task, cut at this run's limit. How often does each stop of `first` catch it?"""
    by = capped(tries_of(args.kept, TOP["union"], tasks), CAP)
    was = statistics.median(outputs(tries_of(args.kept, TOP["union"], tasks)))
    low, high = (1 - FIFTH) * was, (1 + FIFTH) * was
    top_try = sum(outputs(by)) / len(outputs(by))
    rng = random.Random(1)
    where = {"within a fifth": 0, "below": 0, "above": 0}
    not_below = stopped = 0
    for _ in range(args.draws):
        group = [rng.choice(by[task])["out"] for task in tasks]
        now = statistics.median(group)
        place = "within a fifth" if low <= now <= high else "below" if now < low else "above"
        where[place] += 1
        dear = sum(group) / len(group) >= top_try
        not_below += dear
        stopped += dear or place != "below"
    print(f"The kept run's {TOP['union']}: median {was:,.0f} output tokens over {len(outputs(by))} tries; a fifth "
          f"either side of it is {low:,.0f} to {high:,.0f}. Its output a try, with a reply counted as {CAP:,} at "
          f"most: {top_try:,.0f}.")
    print("Its own tries numbered 1, 2 and 3, one of each task: medians "
          + ", ".join(f"{statistics.median(by[task][n]['out'] for task in tasks):,.0f}" for n in range(3))
          + "; means " + ", ".join(f"{sum(by[task][n]['out'] for task in tasks) / len(tasks):,.0f}" for n in range(3))
          + ".")
    print(f"One kept try of each task, drawn {args.draws:,} times: the median was "
          + ", ".join(f"{k} {100 * v / args.draws:.0f} times in 100" for k, v in where.items()) + ".")
    print(f"The mean was not below the kept arm's output a try {100 * not_below / args.draws:.0f} times in 100. "
          f"One of the three stops caught the group {100 * stopped / args.draws:.0f} times in 100.")


# ------------------------------------------------------------------------------------------------- the rule

def lists(by, cut_off_fails, fence_fails=False):
    """task -> [True or False]. A task with no try left is left out, as `box.py compare` leaves it out."""
    out = {}
    for task, tries in by.items():
        got = [t["passed"] and not (fence_fails and t["fence"]) for t in tries if cut_off_fails or not t["cut"]]
        if got:
            out[task] = got
    return out


def rule(args, tasks):
    run = box.Run(args.run)
    arms = {arm: tries_of(args.run, arm, tasks) for arm in run.arms}
    arms.update({TOP[k]: tries_of(args.kept, TOP[k], tasks) for k in TOP})
    kinds = kinds_of(tasks, args.judged)
    twice = [tuple(run.cfg["twice"])] if run.cfg.get("twice") else []
    gain = [tuple(p) for p in run.cfg.get("pairs", [])]
    kept = [(f"union-{s}", TOP["union"]) for s in STEPS]
    asked = [("One arm twice. If the rule tells the two rounds apart, nothing it says below counts.", twice),
             ("Does the notes' gain survive: the step's notes arm against its bare arm.", gain),
             ("The gain at the top step, in the kept run.", [(TOP["union"], TOP["names"])]),
             ("Are the passes kept: the step's notes arm against the kept run's.", kept),
             ("The bare arm against the kept run's.", [(f"names-{s}", TOP["names"]) for s in STEPS])]

    def one(x, y, cut_off_fails, fence_fails, rng, only=None):
        first_arm = lists(arms.get(x, {}), cut_off_fails, fence_fails)
        second = lists(arms.get(y, {}), cut_off_fails, fence_fails)
        if only is not None:
            first_arm = {t: v for t, v in first_arm.items() if t in only}
            second = {t: v for t, v in second.items() if t in only}
        if not first_arm or not second:
            print(f"  {x:13s} against {y:13s} not both kept and graded")
            return
        mean, low, high, answer, up, down = box.passes_rule(first_arm, second, rng, run.matters)
        both = sorted(set(first_arm) & set(second))
        print(f"  {x:13s} against {y:13s} {mean:+.2f} ({low:+.2f} to {high:+.2f}); tasks where the first "
              f"passed more {up}, less {down}; tasks {len(both)}; passed "
              f"{sum(sum(first_arm[t]) for t in both)} of {sum(len(first_arm[t]) for t in both)} against "
              f"{sum(sum(second[t]) for t in both)} of {sum(len(second[t]) for t in both)}: {answer}")

    def block(cut_off_fails, fence_fails, by_kind):
        # Each comparison starts the stream of draws again, so that its numbers do not depend on which arms
        # have been run.
        for words, pairs in asked:
            print(words)
            for x, y in pairs:
                one(x, y, cut_off_fails, fence_fails, random.Random(SEED))
        if not by_kind:
            return
        print("By the kind of thing a task turns on. The rule is asked on a kind of "
              f"{SMALL_KIND} tasks or more. For a smaller kind only the passes are given.")
        for kind, names in kinds.items():
            print(f" {kind}: {len(names)} tasks, {' '.join(names)}")
            for x, y in kept + gain + [(TOP["union"], TOP["names"])]:
                if len(names) >= SMALL_KIND:
                    one(x, y, cut_off_fails, fence_fails, random.Random(SEED), set(names))
                    continue
                got = [[t for k in names for t in arms.get(a, {}).get(k, [])] for a in (x, y)]
                if got[0] and got[1]:
                    print(f"  {x:13s} against {y:13s} passed {sum(t['passed'] for t in got[0])} of {len(got[0])} "
                          f"against {sum(t['passed'] for t in got[1])} of {len(got[1])}: no rule is asked")
                else:
                    print(f"  {x:13s} against {y:13s} not both kept and graded")

    print("== 1. THIS BLOCK DECIDES. A try cut off is counted as a failure of its task.")
    block(True, False, True)
    print("\n== 2. As `box.py compare` asks it: a try cut off is left out of its task. It decides nothing.")
    shared = random.Random(SEED)  # the first two groups share one stream, in the tool's order, as in the tool
    for words, pairs in asked[:2]:
        print(words)
        for x, y in pairs:
            one(x, y, False, False, shared)
    for words, pairs in asked[2:]:
        print(words)
        for x, y in pairs:
            one(x, y, False, False, random.Random(SEED))
    inside = [(arm, t) for arm in run.arms for ts in arms[arm].values() for t in ts if t["fence"]]
    print(f"\n== 3. Tries whose file was taken from inside its fence: {len(inside)}, of which passed "
          f"{sum(t['passed'] for _, t in inside)}.")
    for arm, t in inside:
        print(f"  {arm}/{t['task']}/{t['n']}: " + ("passed" if t["passed"] else "not passed"))
    if any(t["passed"] for _, t in inside):
        print("The kept run's launcher took no such file, so each of these would have failed there. Block 1 again, "
              "with each counted as a failure of its task:")
        block(True, True, False)
    else:
        print("None passed, so no count differs from what the kept run's launcher would have given.")


# ---------------------------------------------------------------------------------------- the rule for output

def cost_rule(first_arm, second, rng, matters=FIFTH, draws=None):
    """first_arm, second: task -> output tokens a try. The share is the first's sum over the second's, on the
    tasks both hold. The tasks are drawn again, as the rule that compares draws them."""
    names = sorted(set(first_arm) & set(second))
    pairs = [(first_arm[t], second[t]) for t in names]
    share = sum(a for a, _ in pairs) / sum(b for _, b in pairs)
    drawn = []
    for _ in range(draws or box.DRAWS):
        pick = [pairs[rng.randrange(len(pairs))] for _ in pairs]
        drawn.append(sum(a for a, _ in pick) / sum(b for _, b in pick))
    low, high = box.interval(drawn)
    if share <= 1 - matters and high < 1:
        answer = "shown: the first spends less"
    elif share >= 1 + matters and low > 1:
        answer = "shown: the first spends more"
    elif low > 1 - matters and high < 1 + matters:
        answer = "no difference as large as a fifth"
    else:
        answer = "cannot tell"
    return share, low, high, answer


def a_try(by):
    """task -> output tokens a try. A try cut off is counted with what it wrote."""
    return {task: sum(t["out"] for t in tries) / len(tries) for task, tries in by.items() if tries}


def cost(args, tasks):
    run = box.Run(args.run)
    arms = {arm: tries_of(args.run, arm, tasks) for arm in run.arms}
    arms.update({TOP[k]: capped(tries_of(args.kept, TOP[k], tasks), CAP) for k in TOP})
    asked = [("One arm twice. If the rule tells the two rounds apart, nothing it says below counts.",
              [tuple(run.cfg["twice"])] if run.cfg.get("twice") else []),
             ("Does the step spend less: the step's notes arm against the kept run's.",
              [(f"union-{s}", TOP["union"]) for s in STEPS]),
             ("The bare arm against the kept run's.", [(f"names-{s}", TOP["names"]) for s in STEPS]),
             ("The step's notes arm against its bare arm.", [tuple(p) for p in run.cfg.get("pairs", [])]),
             ("The same at the top step, in the kept run.", [(TOP["union"], TOP["names"])])]
    print(f"Output tokens a try: the first arm's over the second's, summed over the tasks. A kept arm's reply is "
          f"counted as {CAP:,} at most, this run's limit. The size that matters is a fifth.")
    for words, pairs in asked:
        print(words)
        for x, y in pairs:
            one, other = a_try(arms.get(x, {})), a_try(arms.get(y, {}))
            if not one or not other:
                print(f"  {x:13s} against {y:13s} not both kept and graded")
                continue
            share, low, high, answer = cost_rule(one, other, random.Random(SEED))
            both = sorted(set(one) & set(other))
            passed = [sum(t["passed"] for k in both for t in arms[a][k]) for a in (x, y)]
            spent = [sum(t["out"] for k in both for t in arms[a][k]) for a in (x, y)]
            each = " against ".join(f"{s / p:,.0f}" if p else "no pass" for s, p in zip(spent, passed))
            print(f"  {x:13s} against {y:13s} {share:.2f} ({low:.2f} to {high:.2f}); tasks {len(both)}; a try "
                  f"{sum(one[k] for k in both) / len(both):,.0f} against {sum(other[k] for k in both) / len(both):,.0f}"
                  f"; a passed try {each}: {answer}")


# ---------------------------------------------------------------------------------------- made-up subjects

def tally_of(count, runs, more=True):
    share = {answer: round(100 * n / runs) for answer, n in count.items()}
    up = share.get("shown: the first passes more", 0)
    return (f"{share.get('shown: the first passes less', 0)}% / {share.get('cannot tell', 0)}% / "
            f"{share.get('no difference as large as a quarter', 0)}%" + (f" + {up}%" if more and up else ""))


def made_up(args, tasks):
    """How often each answer comes when every try passes by chance at a rate that is chosen. The first arm is
    the one that is tested, and the second is the one it is set against."""
    box.DRAWS = 1000  # as `box.py simulate` has it; `compare` draws 10,000 times
    k = len(tasks)

    def shares(arm):
        by = tries_of(args.kept, arm, tasks)
        return {task: sum(t["passed"] for t in by[task]) / len(by[task]) for task in tasks}
    notes, bare = shares(TOP["union"]), shares(TOP["names"])
    order = sorted(tasks, key=lambda task: -notes[task])
    shape = [notes[task] for task in order]
    sure = [i for i, p in enumerate(shape) if p == 1]

    def less(n):
        return [0 if i in sure[:n] else p for i, p in enumerate(shape)]
    cases = [("the same: both pass every task 9 times in 10", [0.9] * k, [0.9] * k),
             ("the same: both 0.75", [0.75] * k, [0.75] * k),
             ("the same: both one half", [0.5] * k, [0.5] * k),
             ("the same: both have the kept notes arm's share on each task", shape, shape),
             ("a quarter lower on every task: 0.65 against 0.9", [0.65] * k, [0.9] * k),
             ("a quarter lower on every task: 0.5 against 0.75", [0.5] * k, [0.75] * k),
             ("a quarter lower on every task: 0.25 against 0.5", [0.25] * k, [0.5] * k),
             ("0.4 lower on every task: 0.5 against 0.9", [0.5] * k, [0.9] * k),
             ("0.4 lower on every task: 0.35 against 0.75", [0.35] * k, [0.75] * k),
             ("0.4 lower on every task: 0.1 against 0.5", [0.1] * k, [0.5] * k),
             ((f"the kept notes arm's shares, and the first never passes 6 of its {len(sure)} sure tasks "
               f"({6 / k:.2f} lower in all)"), less(6), shape),
             ((f"the kept notes arm's shares, and the first never passes 9 of its {len(sure)} sure tasks "
               f"({9 / k:.2f} lower in all)"), less(9), shape),
             ((f"the gain as the kept run had it: the kept notes arm's shares against the kept bare arm's "
               f"({sum(notes.values()) / k - sum(bare.values()) / k:.2f} higher in all)"),
              shape, [bare[task] for task in order])]
    sizes = [(3, 3), (6, 3), (6, 6)]
    names = [f"T{i}" for i in range(1, k + 1)]
    print(f"{k} tasks; {args.runs} made-up runs a cell; {box.DRAWS} draws of the tasks a run. In each cell: how often "
          "the rule said the first passes less / cannot tell / no difference as large as a quarter"
          " (and, after a +, how often it said the first passes more).")
    print("| made-up subjects | " + " | ".join(f"{a} tries against {b}" for a, b in sizes) + " |")
    print("|---|" + "---|" * len(sizes))
    for row, (label, a, b) in enumerate(cases):
        cells = []
        for n_one, n_other in sizes:
            rng = random.Random(f"{row} {n_one} {n_other}")
            count = {}
            for _ in range(args.runs):
                one = {t: [rng.random() < p for _ in range(n_one)] for t, p in zip(names, a)}
                other = {t: [rng.random() < p for _ in range(n_other)] for t, p in zip(names, b)}
                answer = box.passes_rule(one, other, random.Random(rng.random()), 0.25)[3]
                count[answer] = count.get(answer, 0) + 1
            cells.append(tally_of(count, args.runs))
        print(f"| {label} | " + " | ".join(cells) + " |", flush=True)


def kept_lists(args, tasks):
    """The kept run's two arms as the block that decides reads them: task -> [True or False], a try cut off a
    failure. And each task's share of tries passed."""
    out = {}
    for k, arm in TOP.items():
        got = lists(tries_of(args.kept, arm, tasks), True)
        out[k] = (got, {task: sum(got[task]) / len(got[task]) for task in tasks})
    return out


def drawn_cells(args, rows, second, sizes, names, key):
    """One line of a table for each row. The first arm is drawn by chance at the row's shares. The second is
    `second` as it stands, or is drawn too when the row gives its shares."""
    for label, p, q in rows:
        cells = []
        for n_one in sizes:
            rng = random.Random(f"{key} {label} {n_one}")
            count = {}
            for _ in range(args.runs):
                one = {t: [rng.random() < p[t] for _ in range(n_one)] for t in names}
                other = second if q is None else {t: [rng.random() < q[t] for _ in range(n_one)] for t in names}
                answer = box.passes_rule(one, {t: other[t] for t in names}, random.Random(rng.random()), 0.25)[3]
                count[answer] = count.get(answer, 0) + 1
            cells.append(tally_of(count, args.runs))
        print(f"| {label} | " + " | ".join(cells) + " |", flush=True)


def made_up_kept(args, tasks):
    """Rule 5 sets a step's notes arm beside the kept notes arm. The kept arm is not run again, so it is not
    drawn here: it stands as it was graded. Only the tested arm is made up."""
    box.DRAWS = 1000
    k = len(tasks)
    kept = kept_lists(args, tasks)
    union, notes = kept["union"]
    bare = kept["names"][1]
    top = sum(notes.values()) / k
    gain = top - sum(bare.values()) / k
    sure = [task for task in tasks if notes[task] == 1]

    def less(n):
        return {task: 0 if task in sure[:n] else notes[task] for task in tasks}

    def times(f):
        return {task: f * notes[task] for task in tasks}
    rows = [("the kept notes arm's own shares: no loss", notes, None)]
    rows += [((f"never passes {n} of its {len(sure)} sure tasks: {n / k:.2f} lower, {round(100 * n / k / gain)} in "
               "100 of the notes' gain"), less(n), None) for n in (1, 2, 3, 4, 5, 6)]
    rows += [((f"every task's share times {f:g}: {(1 - f) * top:.2f} lower, {round(100 * (1 - f) * top / gain)} in "
               "100 of the gain"), times(f), None) for f in (0.9, 0.8, 0.75, 0.67)]
    rows += [(f"halfway between the kept notes arm and the kept bare arm: {gain / 2:.2f} lower",
              {task: (notes[task] + bare[task]) / 2 for task in tasks}, None),
             (f"the kept bare arm's shares: {gain:.2f} lower, the whole gain", bare, None)]
    print(f"{k} tasks; {args.runs} made-up runs a cell; {box.DRAWS} draws of the tasks a run. The second arm is the "
          f"kept notes arm as graded, {sum(sum(v) for v in union.values())} of "
          f"{sum(len(v) for v in union.values())}, a try cut off a failure. In each cell: how often the rule said "
          "the first passes less / cannot tell / no difference as large as a quarter.")
    print("| made-up notes arm | 3 tries a task | 6 tries a task |")
    print("|---|---|---|")
    drawn_cells(args, rows, union, (3, 6), tasks, "kept")


def made_up_kinds(args, tasks):
    """The rule on the tasks of one kind. As in made-up-kept, the kept arm stands as it was graded."""
    box.DRAWS = 1000
    kept = kept_lists(args, tasks)
    union, notes = kept["union"]
    bare = kept["names"][1]
    print(f"{args.runs} made-up runs a cell; {box.DRAWS} draws of the tasks a run. In each cell: how often the rule "
          "said the first passes less / cannot tell / no difference as large as a quarter (and, after a +, how "
          "often it said the first passes more).")
    for kind, names in kinds_of(tasks, args.judged).items():
        if len(names) < SMALL_KIND:
            continue
        top = sum(notes[t] for t in names) / len(names)
        low = sum(bare[t] for t in names) / len(names)
        print(f"\n{kind}: {len(names)} tasks. The kept notes arm passed "
              f"{sum(sum(union[t]) for t in names)} of {sum(len(union[t]) for t in names)} on them.")
        print("| made-up arms | 3 tries a task | 6 tries a task |")
        print("|---|---|---|")
        rows = [("a notes arm with the kept notes arm's own shares, against the kept notes arm", notes, None)]
        rows += [(f"a notes arm with every share times {f:g} ({(1 - f) * top:.2f} lower), against the kept notes arm",
                  {t: f * notes[t] for t in names}, None) for f in (0.67, 0.5, 0.25)]
        rows += [("a notes arm that never passes, against the kept notes arm", {t: 0 for t in names}, None),
                 (f"both drawn: the kept notes arm's shares against the kept bare arm's ({top - low:.2f} higher)",
                  notes, bare),
                 ("both drawn: the kept bare arm's shares in both", bare, bare)]
        drawn_cells(args, rows, union, (3, 6), names, "kinds")


def made_up_cost(args, tasks):
    """The rule for output tokens, on made-up subjects. A made-up try of a task writes what one of the kept
    notes arm's three tries of that task wrote, picked by chance, times a share that is chosen."""
    by = capped(tries_of(args.kept, TOP["union"], tasks), CAP)
    kept = a_try(by)

    def arm(rng, n, share_of):
        return {task: sum(min(CAP, share_of(i) * rng.choice(by[task])["out"]) for i in range(1, n + 1)) / n
                for task in tasks}
    rows = [("the kept arm's own output", lambda i: 1.0),
            ("0.9 of it", lambda i: 0.9), ("0.8 of it", lambda i: 0.8), ("0.65 of it", lambda i: 0.65),
            ("one half of it", lambda i: 0.5), ("a quarter of it", lambda i: 0.25),
            ("a twentieth of it", lambda i: 0.05), ("1.3 times it", lambda i: 1.3),
            ("0.75 of it in the try numbered 1 of each task, and 1.3 times it in the others",
             lambda i: 0.75 if i == 1 else 1.3)]
    print(f"{len(tasks)} tasks; {args.runs} made-up runs a cell; 1,000 draws of the tasks a run. In each cell: how "
          "often the rule said the first spends less / cannot tell / no difference as large as a fifth (and, after "
          "a +, how often it said the first spends more).")
    print("| a made-up arm that writes | 3 tries a task, against the kept notes arm | 6 tries a task, against the "
          "kept notes arm | 3 tries a task, against a made-up arm that writes what the kept arm wrote |")
    print("|---|---|---|---|")
    for label, share_of in rows:
        cells = []
        for n, both in ((3, False), (6, False), (3, True)):
            rng = random.Random(f"cost {label} {n} {both}")
            count = {}
            for _ in range(args.runs):
                other = arm(rng, 3, lambda i: 1.0) if both else kept
                answer = cost_rule(arm(rng, n, share_of), other, random.Random(rng.random()), draws=1000)[3]
                count[answer] = count.get(answer, 0) + 1
            share = {answer: round(100 * c / args.runs) for answer, c in count.items()}
            up = share.get("shown: the first spends more", 0)
            cells.append(f"{share.get('shown: the first spends less', 0)}% / {share.get('cannot tell', 0)}% / "
                         f"{share.get('no difference as large as a fifth', 0)}%" + (f" + {up}%" if up else ""))
        print(f"| {label} | " + " | ".join(cells) + " |", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--run", default=HERE, help="this run's directory")
    parser.add_argument("--kept", default=os.path.join(os.path.dirname(HERE), "2026-11-16-small-screen"),
                        help="the kept run's directory")
    parser.add_argument("--judged", default=JUDGED, help="the judges' file that gives each task's kind")
    sub = parser.add_subparsers(dest="what", required=True)
    for name, go in (("made-up", made_up), ("made-up-kept", made_up_kept), ("made-up-kinds", made_up_kinds),
                     ("made-up-cost", made_up_cost)):
        one = sub.add_parser(name)
        one.add_argument("--runs", type=int, default=1000)
        one.set_defaults(go=go)
    one = sub.add_parser("ignored")
    one.add_argument("--draws", type=int, default=20000)
    one.set_defaults(go=ignored)
    one = sub.add_parser("first")
    one.add_argument("step", choices=STEPS)
    one.set_defaults(go=first)
    sub.add_parser("counts").set_defaults(go=show_counts)
    sub.add_parser("rule").set_defaults(go=rule)
    sub.add_parser("cost").set_defaults(go=cost)
    sub.add_parser("sorted").set_defaults(go=is_sorted)
    args = parser.parse_args()
    args.go(args, box.Run(args.run).tasks())


if __name__ == "__main__":
    main()

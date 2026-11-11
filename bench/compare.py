#!/usr/bin/env python3
"""Set the arms of a run side by side.

Usage: compare.py <ast-grep binary> <run directory> [--without TASK/vN ...]

`score.py` prints every try, and that is read first. This prints only sums, and
nothing here says why a number is what it is.

For each group of tasks that the set names in its `set.json`, and for each arm:

  how many tasks passed on every try, and how many single tries passed
  what the subjects spent before they were first right, added up and as a median

What a subject spent before it was first right is the output tokens of every
message it wrote before its first right call to ast-grep. A try that never made
a right call spent everything it wrote and was never right: all its output tokens
are counted, and the number of such tries is printed beside the sum.

Then each pair of arms is compared, by the sum and by the median. The size that
matters is a half: one arm spends half of what the other spends, or less. It is
"shown" when the sum and the median both say so, "not shown" when neither does,
and "cannot tell" when they disagree, or when an arm lacks a try.

A set that names no groups is one group. A try that is not kept yet is counted
as missing, and a comparison with a missing try is "cannot tell".

`--without T02/v1` leaves variant 1 of T02 out of every arm, and says so first.
It is for a try that a reader has found spoiled: its subject read an answer, say.
The same try is left out of each arm, so that the arms still hold the same tries.
"""
import collections, os, re, statistics, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import score, sets  # noqa: E402

MATTERS = 0.5


def spent(one):
    """What one try spent before it was first right. All of it, if it never was."""
    return one["before"] if one["first"] else one["output tokens"]


def verdict(ratio_of_sums, ratio_of_medians):
    """Does the first arm spend half of the second, or less? Or the second half of the first?"""
    for low, name in ((True, "the first spends half or less"), (False, "the second spends half or less")):
        by_sum = ratio_of_sums <= MATTERS if low else ratio_of_sums >= 1 / MATTERS
        by_median = ratio_of_medians <= MATTERS if low else ratio_of_medians >= 1 / MATTERS
        if by_sum and by_median:
            return f"shown: {name}"
        if by_sum or by_median:
            return f"cannot tell: {name} by the {'sum' if by_sum else 'median'} only"
    return "not shown: neither spends half of the other, by the sum or by the median"


def main():
    args, without = sys.argv[1:], []
    if "--without" in args:
        at = args.index("--without")
        args, without = args[:at], args[at + 1:]
    if len(args) != 2 or any(not re.fullmatch(r"T\d\d/v\d+", name) for name in without):
        sys.exit("usage: compare.py <ast-grep binary> <run directory> [--without TASK/vN ...]")
    binary, top = os.path.abspath(args[0]), args[1]
    by_arm = collections.OrderedDict()
    missing = collections.Counter()
    set_name = None
    if without:
        print(f"left out of every arm: {', '.join(without)}\n")
    for arm, task, variant, kept in score.tries(top):
        by_arm.setdefault(arm, collections.defaultdict(list))
        if f"{task}/v{variant}" in without:
            continue
        one = score.read(binary, kept)
        if one is None:
            missing[arm] += 1
            continue
        if one["closed"]:
            sys.exit("compare.py: a try with no tool has no first right call. This compares runs with the tool.")
        set_name = one["setup"].get("set", "pilot")
        by_arm[arm][task].append(one)
    if set_name is None:
        sys.exit("compare.py: no try of this run is kept yet")
    tasks = sorted({task for tries in by_arm.values() for task in tries})
    groups = sets.about(set_name).get("groups") or {"all the tasks": tasks}

    for group, names in groups.items():
        print(f"{group}: {', '.join(names)}")
        sums, medians, whole = {}, {}, True
        for arm, tries in by_arm.items():
            ones = [one for task in names for one in tries.get(task, [])]
            if not ones:
                print(f"  {arm}: no try kept")
                whole = False
                continue
            costs = [spent(one) for one in ones]
            never = sum(1 for one in ones if not one["first"])
            every = sum(1 for task in names if tries.get(task) and all(o["verdict"] == "pass" for o in tries[task]))
            sums[arm], medians[arm] = sum(costs), statistics.median(costs)
            print(f"  {arm}: {every} of {len(names)} tasks passed on every try,"
                  f" {sum(o['verdict'] == 'pass' for o in ones)} of {len(ones)} single tries passed."
                  f" Spent before the first right call: {sums[arm]:,} in all, median {medians[arm]:,.0f}."
                  f" {never} of {len(ones)} tries made no right call.")
        counts = {arm: sum(len(tries.get(task, [])) for task in names) for arm, tries in by_arm.items()}
        arms = [arm for arm in by_arm if arm in sums]
        for i, first in enumerate(arms):
            for second in arms[i + 1:]:
                by_sum, by_median = sums[first] / sums[second], medians[first] / medians[second]
                said = verdict(by_sum, by_median)
                if counts[first] != counts[second] or missing[first] or missing[second]:
                    said = "cannot tell: the two arms do not have the same tries kept"
                print(f"  {first} against {second}: {by_sum:.2f} by the sum, {by_median:.2f} by the median. {said}")
        print()
    for arm, n in missing.items():
        print(f"{arm}: {n} tries not kept yet")


if __name__ == "__main__":
    main()

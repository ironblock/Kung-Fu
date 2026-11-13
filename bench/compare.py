#!/usr/bin/env python3
"""Set the arms of a run side by side.

Usage: compare.py <ast-grep binary> <run directory> [<run directory> ...] [--each-task] [--without TASK/vN ...]

`score.py` prints every try, and that is read first. This prints only sums, and
nothing here says why a number is what it is.

For each group of tasks that the set names in its `set.json`, the arms are
compared in one of two ways. Which one depends on what the subjects had.

**Subjects with the tool.** What a subject spent before it was first right is
the output tokens of every message it wrote before its first right call to
ast-grep. A try that never made a right call spent everything it wrote and was
never right: all its output tokens are counted, and the number of such tries is
printed beside the sum. Each pair of arms is compared by the sum and by the
median. The size that matters is a half: one arm spends half of what the other
spends, or less. It is "shown" when the sum and the median both say so, "not
shown" when neither does, and "cannot tell" when they disagree.

Since 2026-11-13 the same two arms are also compared by what each subject had read and written before
its first right call: what its context had to hold, and not only what it wrote. Two arms are set try
against try, and the size that matters is a third. `spent_less` has the five answers it can give.

**Subjects with no tool.** There is no call, so there is nothing to count before
one. An answer is right as it was first written, or it is not. Two arms are
compared try by try: the same task in the same variant, once in each arm. The
size that matters is a quarter of those pairs. Three answers are possible.

  shown           one arm passed more tries, by a quarter of the pairs or more,
                  and an exact sign test on the pairs that differ gives 0.05 or less
  no difference   the difference, with 95 of 100 resamplings of the pairs, lies
  that large      within a quarter of the pairs either way
  cannot tell     anything else

Beside each arm with no tool, two things are printed. One is what became of the
answers that did not pass: ast-grep refused the command, or it ran and matched
other code, or it was not a command of the form asked for. A subject with the
tool would see the first at once, and nothing would tell it of the second. The
other is the word each subject gave for how sure it was, and how many answers
under each word passed.

The resampling draws the pairs again 20,000 times with a fixed seed, so the same
records give the same answer.

A try is not the unit that a study learns about: a task is. Tries at one task
rise and fall together, and a round adds tries and no task. So beside each such
comparison the difference is given task by task, and the tasks are drawn again in
place of the pairs. That second interval says how far the sum could move with
other tasks of the same kind. It decides nothing: the rule stays as it was
written. With `--each-task`, each task is also compared by itself, by the same
rule on its own pairs.

A set that names no groups is one group. A try that is not kept yet is counted
as missing, and a comparison of two arms that do not hold the same tries is
"cannot tell".

Several run directories are read as one: a study may fix beforehand that it runs
in rounds, each a run of its own. An arm is then the tries under that arm's name
in every round, and a pair is the same task in the same variant of the same round.

`--without T02/v1` leaves variant 1 of T02 out of every arm, and says so first.
It is for a try that a reader has found spoiled: its subject read an answer, say.
The same try is left out of each arm, so that the arms still hold the same tries.
"""
import collections, math, os, random, re, statistics, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import score, sets  # noqa: E402

MATTERS = 0.5       # with the tool: one arm spends this share of the other, or less
QUARTER = 0.25      # with no tool: one arm passes this share of the pairs more
THIRD = 1 / 3       # with the tool, by what was read and written: one arm spends this share less than the other
SEED, TIMES = 20261112, 20000


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


def sign_test(up, down):
    """How often pairs that differ would split at least this unevenly, if either way were as likely."""
    n = up + down
    return 1.0 if n == 0 else min(1.0, 2 * sum(math.comb(n, i) for i in range(min(up, down) + 1)) / 2 ** n)


def interval(diffs):
    """Where the summed difference lies in 95 of 100 resamplings of the pairs."""
    draw, n = random.Random(SEED), len(diffs)
    sums = sorted(sum(draw.choice(diffs) for _ in range(n)) for _ in range(TIMES))
    return sums[int(0.025 * TIMES)], sums[int(0.975 * TIMES) - 1]


def read_and_written(one):
    """How much what a subject had read and written grew before its first right call.

    A try that made no right call counts for all it read and wrote. None when it was not kept. The harness's
    own text, handed to the subject after it began, is left out where the record says how much it was.
    """
    if one["began"] is None:
        return None
    if one["held at first"] is not None:
        grown, added = one["held at first"] - one["began"], one["added at first"]
    else:
        grown, added = one["held at end"] - one["began"], one["added at end"]
    # What the harness itself handed over is left out where it is known: it is not the test's.
    return grown - (added or 0)


def spent_less(first, second):
    """Compare two arms try by try, by what each subject had read and written before its first right call.

    R is what the first arm spent, summed over the pairs, as a share of what the second spent. Five answers:

      shown             one arm spends a third less than the other, or less still, and it spends
                        less in 95 of 100 resamplings of the pairs
      a saving,         one arm spends less in 95 of 100 resamplings, and in 95 of 100 the saving
      smaller than      is under a third
      a third
      no saving as      in 95 of 100 resamplings neither arm spends a third less than the other
      large as a third
      cannot tell       anything else
    """
    keys = sorted(first)
    a, b = [first[key] for key in keys], [second[key] for key in keys]
    n, ratio = len(keys), sum(a) / sum(b)
    draw = random.Random(SEED)
    ratios = []
    for _ in range(TIMES):
        picked = [draw.randrange(n) for _ in range(n)]
        ratios.append(sum(a[i] for i in picked) / sum(b[i] for i in picked))
    ratios.sort()
    low, high = ratios[int(0.025 * TIMES)], ratios[int(0.975 * TIMES) - 1]
    under, over = 1 - THIRD, 1 / (1 - THIRD)
    if ratio <= under and high < 1:
        said = "shown: the first spends less, by a third or more"
    elif ratio >= over and low > 1:
        said = "shown: the second spends less, by a third or more"
    elif high < 1 and low > under:
        said = "a saving, smaller than a third: the first spends less"
    elif low > 1 and high < over:
        said = "a saving, smaller than a third: the second spends less"
    elif low > under and high < over:
        said = "no saving as large as a third, either way"
    else:
        said = "cannot tell"
    mean_a, mean_b = sum(a) / n, sum(b) / n
    line = (f"{ratio:.2f} of it, and with resampling {low:.2f} to {high:.2f}."
            f" For a try: {mean_a:,.0f} tokens against {mean_b:,.0f},"
            f" {abs(mean_a - mean_b):,.0f} {'less' if mean_a < mean_b else 'more'}. {said}")
    by_task = collections.defaultdict(list)
    for key in keys:
        by_task[key[0]].append(first[key] - second[key])
    if len(by_task) > 1:
        line += "\n      task by task, for a try: " + ", ".join(
            f"{task} {sum(by_task[task]) / len(by_task[task]):+,.0f}" for task in sorted(by_task)) + "."
        # The task is the unit: tries at one task move together. So the tasks are drawn again too, each with
        # all its pairs. The rule above is fixed on the pairs, and this stands beside it.
        names = sorted(by_task)
        of = {task: ([first[key] for key in keys if key[0] == task], [second[key] for key in keys if key[0] == task])
              for task in names}
        draw = random.Random(SEED)
        again = []
        for _ in range(TIMES):
            picked = [draw.choice(names) for _ in names]
            again.append(sum(sum(of[task][0]) for task in picked) / sum(sum(of[task][1]) for task in picked))
        again.sort()
        line += (f" With the {len(names)} tasks drawn again,"
                 f" {again[int(0.025 * TIMES)]:.2f} to {again[int(0.975 * TIMES) - 1]:.2f}.")
    return line


def passes(first, second):
    """Compare two arms try by try, by whether each answer passed. Return the line that says it."""
    diffs = [int(first[key]) - int(second[key]) for key in sorted(first)]
    n, total = len(diffs), sum(diffs)
    matters = math.ceil(QUARTER * n)
    up, down = sum(d > 0 for d in diffs), sum(d < 0 for d in diffs)
    chance = sign_test(up, down)
    low, high = interval(diffs)
    if abs(total) >= matters and chance <= 0.05:
        said = f"shown: the {'first' if total > 0 else 'second'} passes more, by {matters} of {n} or more"
    elif -matters < low and high < matters:
        said = f"no difference as large as {matters} of {n}"
    else:
        said = "cannot tell"
    line = (f"{total:+d} of {n} pairs. Only the first passed in {up}, only the second in {down}."
            f" Sign test {chance:.2f}. With resampling, {low:+d} to {high:+d}. {said}")
    by_task = collections.Counter()
    for key in first:
        by_task[key[0]] += int(first[key]) - int(second[key])
    if len(by_task) > 1:
        each = [by_task[task] for task in sorted(by_task)]
        draw = random.Random(SEED)
        sums = sorted(sum(draw.choice(each) for _ in each) for _ in range(TIMES))
        line += (f"\n      task by task: {', '.join(f'{task} {by_task[task]:+d}' for task in sorted(by_task))}."
                 f" With the {len(each)} tasks drawn again, {sums[int(0.025 * TIMES)]:+d} to {sums[int(0.975 * TIMES) - 1]:+d}.")
    return line


def main():
    args, without = sys.argv[1:], []
    each_task = "--each-task" in args
    args = [arg for arg in args if arg != "--each-task"]
    if "--without" in args:
        at = args.index("--without")
        args, without = args[:at], args[at + 1:]
    if len(args) < 2 or any(not re.fullmatch(r"T\d\d/v\d+", name) for name in without):
        sys.exit("usage: compare.py <ast-grep binary> <run directory> [<run directory> ...] [--each-task]"
                 " [--without TASK/vN ...]")
    binary, tops = os.path.abspath(args[0]), args[1:]
    by_arm = collections.OrderedDict()
    closed = {}
    missing = collections.Counter()
    set_name = None
    if without:
        print(f"left out of every arm: {', '.join(without)}\n")
    if len(tops) > 1:
        print(f"{len(tops)} runs read as one: {', '.join(os.path.basename(os.path.normpath(t)) for t in tops)}\n")
    for round_, top in enumerate(tops):
        for arm, task, variant, kept in score.tries(top):
            by_arm.setdefault(arm, {})
            if f"{task}/v{variant}" in without:
                continue
            one = score.read(binary, kept)
            if one is None:
                missing[arm] += 1
                continue
            if closed.setdefault(arm, one["closed"]) != one["closed"]:
                sys.exit(f"compare.py: the arm `{arm}` holds tries with the tool and tries without it")
            if set_name not in (None, one["setup"].get("set", "pilot")):
                sys.exit("compare.py: the tries are not all on one set of tasks")
            set_name = one["setup"].get("set", "pilot")
            by_arm[arm][(task, variant, round_)] = one
    if set_name is None:
        sys.exit("compare.py: no try of this run is kept yet")
    tasks = sorted({key[0] for tries in by_arm.values() for key in tries})
    groups = sets.about(set_name).get("groups") or {"all the tasks": tasks}

    for group, names in groups.items():
        print(f"{group}: {', '.join(names)}")
        sums, medians, passed, grown = {}, {}, {}, {}
        for arm, tries in by_arm.items():
            ones = {key: one for key, one in tries.items() if key[0] in names}
            if not ones:
                print(f"  {arm}: no try kept")
                continue
            right = sum(one["verdict"] == "pass" for one in ones.values())
            if closed[arm]:
                passed[arm] = {key: one["verdict"] == "pass" for key, one in ones.items()}
                line = f"  {arm}: {right} of {len(ones)} tries passed."
                kinds = collections.Counter(one["verdict"] for one in ones.values())
                if right < len(ones):
                    line += (f" Of the others: {kinds['error']} refused by ast-grep,"
                             f" {kinds['wrong']} ran and matched other code,"
                             f" {kinds['invalid'] + kinds['none']} not a command of the form asked for.")
                said = collections.Counter((one["sure"] or "no word", one["verdict"] == "pass") for one in ones.values())
                line += " Called: " + "; ".join(
                    f"{word} {said[(word, True)] + said[(word, False)]}, of which {said[(word, True)]} passed"
                    for word in ("sure", "unsure", "guess", "no word") if said[(word, True)] + said[(word, False)]) + "."
                print(line)
                continue
            costs = [spent(one) for one in ones.values()]
            never = sum(1 for one in ones.values() if not one["first"])
            # Only the tasks this arm ran: a run may hold a part of a set.
            ran = [task for task in names if any(key[0] == task for key in ones)]
            every = sum(1 for task in ran
                        if all(one["verdict"] == "pass" for key, one in ones.items() if key[0] == task))
            sums[arm], medians[arm] = sum(costs), statistics.median(costs)
            passed[arm] = {key: one["verdict"] == "pass" for key, one in ones.items()}
            grown[arm] = {key: read_and_written(one) for key, one in ones.items()}
            print(f"  {arm}: {every} of {len(ran)} tasks passed on every try,"
                  f" {right} of {len(ones)} single tries passed."
                  f" Spent before the first right call: {sums[arm]:,} in all, median {medians[arm]:,.0f}."
                  f" {never} of {len(ones)} tries made no right call.")
        arms = [arm for arm in by_arm if arm in passed]
        for i, first in enumerate(arms):
            for second in arms[i + 1:]:
                if closed[first] != closed[second]:
                    continue
                if set(passed[first]) != set(passed[second]) or missing[first] or missing[second]:
                    said = "cannot tell: the two arms do not have the same tries kept"
                elif closed[first]:
                    said = passes(passed[first], passed[second])
                else:
                    by_sum, by_median = sums[first] / sums[second], medians[first] / medians[second]
                    said = f"{by_sum:.2f} by the sum, {by_median:.2f} by the median. {verdict(by_sum, by_median)}"
                    if all(v is not None for arm in (first, second) for v in grown[arm].values()):
                        said += ("\n    by what was read and written before the first right call, the harness's own text left out,"
                                 " the first spent "
                                 + spent_less(grown[first], grown[second]))
                        fewer = sum(passed[second].values()) - sum(passed[first].values())
                        if abs(fewer) >= math.ceil(QUARTER * len(passed[first])):
                            said += (f"\n      The {'first' if fewer > 0 else 'second'} passes fewer tries, by a quarter"
                                     " of the pairs or more: what it spends less, it saves by failing.")
                print(f"  {first} against {second}: {said}")
        if each_task and arms and all(closed[arm] for arm in arms):
            for task in names:
                alone = {arm: {key: ok for key, ok in passed[arm].items() if key[0] == task} for arm in arms}
                if not any(alone.values()):
                    continue
                print(f"  {task} by itself: " + ", ".join(
                    f"{arm} {sum(alone[arm].values())} of {len(alone[arm])}" for arm in arms if alone[arm]))
                for i, first in enumerate(arms):
                    for second in arms[i + 1:]:
                        if alone[first] and set(alone[first]) == set(alone[second]):
                            print(f"    {first} against {second}: {passes(alone[first], alone[second])}")
        print()
    for arm, n in missing.items():
        print(f"{arm}: {n} tries not kept yet")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Ask the passing rule of box.py about two arms that sit in two runs.

    python3 across.py RUN_A ARM_A RUN_B ARM_B

It answers as `box.py compare` does: the task is the unit, a try cut off by its length limit is a failure
of its task, spoiled tries are left out, and the draws start from the same seed. The first arm is set
against the second.
"""
import os
import random
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
import box  # noqa: E402


def arm(run_dir, name):
    run = box.Run(run_dir)
    cut = []
    got, _, _ = box.kept_tries(run, False, cut)
    for t in cut:
        got.setdefault(t["arm"], {}).setdefault(t["task"], []).append(dict(t, passed=False))
    if name not in got:
        sys.exit(f"across.py: {run_dir} has no kept, graded tries of {name}")
    return {t: [r["passed"] for r in rs] for t, rs in got[name].items()}, run.matters


def main():
    if len(sys.argv) != 5:
        sys.exit(__doc__)
    first, matters = arm(sys.argv[1], sys.argv[2])
    second, _ = arm(sys.argv[3], sys.argv[4])
    mean, low, high, answer, up, down = box.passes_rule(first, second, random.Random(20261115), matters)
    passed = lambda a: f"{sum(sum(v) for v in a.values())} of {sum(len(v) for v in a.values())}"
    print(f"{sys.argv[2]} ({passed(first)}) against {sys.argv[4]} ({passed(second)}): {mean:+.2f} "
          f"({low:+.2f} to {high:+.2f}); tasks where the first passed more {up}, less {down}: {answer}")


main()

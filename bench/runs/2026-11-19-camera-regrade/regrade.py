#!/usr/bin/env python3
"""Grade the kept tries of the camera set again, with the checks as they stand, and change no kept grade.

    python3 regrade.py grade [--parallel 3]     writes now/<run>.json, and now/<run>/<arm>-<task>-<n>.txt
                                                for each try whose grade is not the kept one
    python3 regrade.py reread                   which kept replies today's reader of replies reads another way
    python3 regrade.py report                   the tables, and the fixed comparisons both ways
    python3 regrade.py three-ways               the same by sorts.json: which turned tries are wrong by their ask

A try's kept grade.json and grade.txt stay as they are: they are the grade by the check as it stood when the
try was read. What is written here is the grade by the check at this commit.
"""
import argparse
import concurrent.futures
import hashlib
import json
import os
import random
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", ".."))
import box  # noqa: E402
import small  # noqa: E402

RUNS = ["2026-11-16-small-screen", "2026-11-17-effort-ladder", "2026-11-18-mended-notes"]
MENDED = ["A1", "A3", "B1", "B2", "B3", "B4", "B5", "B6", "C4", "F1", "F2", "G1", "G2", "G3", "K1"]
OLD = "e46cab0"  # the last commit before the checks were mended on 2026-11-19
NEW_ASK = ["B6", "G1", "G2"]  # their asks gained words on 2026-11-19; the kept tries answered the old asks


def run_of(name):
    return box.Run(os.path.join(HERE, "..", name))


def tries_of(run):
    for kept in run.all_tries():
        arm, task, n = kept.split(os.sep)[-3:]
        if box.is_kept(kept) and os.path.exists(os.path.join(kept, "grade.json")):
            yield kept, arm, task, int(n)


def grade(args):
    blank = argparse.Namespace(pristine=None, runner=None)
    pristine, modules = box.option(blank, "pristine"), box.runner_modules(blank)
    for name in RUNS:
        run = run_of(name)
        out = os.path.join(HERE, "now", name + ".json")
        done = box.json_of(out) if os.path.exists(out) else {}
        todo = [(kept, arm, task, n) for kept, arm, task, n in tries_of(run)
                if task in MENDED and f"{arm}/{task}/{n}" not in done
                and (not args.task or task in args.task)]

        def one(item):
            kept, arm, task, n = item
            result, text = box.grade_one(run.set, kept, task, pristine, modules, run.window, write=False)
            return item, result, text

        with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.parallel)) as pool:
            for count, ((kept, arm, task, n), result, text) in enumerate(pool.map(one, todo), 1):
                was = box.json_of(os.path.join(kept, "grade.json"))["passed"]
                key = f"{arm}/{task}/{n}"
                check = box.task_file(run.set, task, "check.test.ts")
                done[key] = {"kept": was, "now": result["passed"], "each": result["each"],
                             "could not load": result.get("could not load") or [],
                             "check sha256": hashlib.sha256(open(check, "rb").read()).hexdigest()}
                if was != result["passed"]:
                    found = box.private_in(text)
                    if found:
                        text = f"not kept: the grader's output holds {', '.join(found)}\n"
                    os.makedirs(os.path.join(HERE, "now", name), exist_ok=True)
                    box.write_text(os.path.join(HERE, "now", name, f"{arm}-{task}-{n}.txt"), text)
                print(name, key, "kept", was, "now", result["passed"], flush=True)
                if count % 20 == 0:
                    box.write_json(out, dict(sorted(done.items())))
        box.write_json(out, dict(sorted(done.items())))


def reread(_args):
    """Read each kept reply with today's small.py, and say where the files it finds are not the kept files.

    Each such try is then graded as read today, by the checks as they stood before the mends (commit OLD) and
    by the checks now. Nothing is written into the try."""
    blank = argparse.Namespace(pristine=None, runner=None)
    pristine, modules = box.option(blank, "pristine"), box.runner_modules(blank)
    root = subprocess.run(["git", "-C", HERE, "rev-parse", "--show-toplevel"], capture_output=True, text=True,
                          check=True).stdout.strip()
    with tempfile.TemporaryDirectory(prefix="regrade-") as tmp:
        archive = subprocess.run(["git", "-C", root, "archive", OLD, "bench/sets/camera"], capture_output=True,
                                 check=True).stdout
        subprocess.run(["tar", "-x", "-C", tmp], input=archive, check=True)
        old_set = os.path.join(tmp, "bench", "sets", "camera")

        def as_read(run, kept, task, files, set_dir):
            again = tempfile.mkdtemp(dir=tmp)
            shutil.copytree(os.path.join(run.set, "app"), os.path.join(again, "app"), symlinks=True)
            for rel, content in files.items():
                os.makedirs(os.path.dirname(os.path.join(again, "app", rel)), exist_ok=True)
                box.write_text(os.path.join(again, "app", rel), content)
            result, _ = box.grade_one(set_dir, again, task, pristine, modules, run.window, write=False)
            failed = [case for case, status in result["each"].items() if status not in ("passed", True)]
            return "passed" if result["passed"] else f"failed {failed or result.get('could not load') or ''}"[:400]

        _reread(as_read, old_set)


def _reread(as_read, old_set):
    for name in RUNS:
        run = run_of(name)
        for kept, arm, task, n in tries_of(run):
            steps = os.path.join(kept, "steps.json")
            if not os.path.exists(steps):
                continue
            text = "".join("".join(s.get("text") or []) for s in box.json_of(steps))
            made = box.json_of(os.path.join(kept, "setup.json"))
            files = small.parse_reply(text, made.get("box"))[0]
            was = set(box.json_of(os.path.join(kept, "record.json")).get("files in the reply") or [])
            same = lambda rel: os.path.exists(os.path.join(kept, "app", rel)) and box.text_of(
                os.path.join(kept, "app", rel)) == files[rel]
            if set(files) != was:
                print(f"{name} {arm}/{task}/{n}: kept {sorted(was)}; today's reader finds {sorted(files)}")
            elif not all(same(rel) for rel in files):
                print(f"{name} {arm}/{task}/{n}: the same files, {sorted(files)}, with other contents: "
                      f"{sorted(rel for rel in files if not same(rel))}")
            else:
                continue
            print(f"    kept grade: {'passed' if box.json_of(os.path.join(kept, 'grade.json'))['passed'] else 'failed'}")
            print(f"    as read today, by the check before the mends: {as_read(run, kept, task, files, old_set)}")
            print(f"    as read today, by the check now: {as_read(run, kept, task, files, run.set)}")


def passes(run, now):
    """arm -> task -> [(n, kept grade, grade now)], with a try cut off a failure, as box.py compare has it."""
    cut = []
    got, _, _ = box.kept_tries(run, False, cut)
    for t in cut:
        got.setdefault(t["arm"], {}).setdefault(t["task"], []).append(dict(t, passed=False))
    table = {}
    for arm, tasks in got.items():
        for task, tries in tasks.items():
            for t in tries:
                new = now.get(f"{arm}/{task}/{t['n']}", {}).get("now", t["passed"]) and not t.get("cut off")
                table.setdefault(arm, {}).setdefault(task, []).append((t["n"], t["passed"], bool(new)))
    return table


def rule(run, table, which):
    """box.py compare's answers, with the kept grades (which=1) or the grades now (which=2)."""
    rng, lines = random.Random(20261115), []
    side = lambda arm: {task: [t[which] for t in tries] for task, tries in table[arm].items()}
    pairs = ([tuple(run.cfg["twice"])] if run.cfg.get("twice") else []) + [tuple(p) for p in run.cfg.get("pairs", [])]
    for x, y in pairs:
        if x in table and y in table:
            mean, low, high, answer, up, down = box.passes_rule(side(x), side(y), rng, run.matters)
            lines.append(f"  {x:12s} against {y:12s} {mean:+.2f} ({low:+.2f} to {high:+.2f}); first passed more on "
                         f"{up} tasks, less on {down}: {answer}")
    return lines


def three_ways(_args):
    """Each arm's passes four ways, by sorts.json, and the fixed comparisons under each.

    as kept; by the checks now; with the tries that fail only by words their ask gained later counted as
    passes; and with the tries that two judges of three called wrong counted as passes too."""
    sorts = box.json_of(os.path.join(HERE, "sorts.json"))["tries"]
    for name in RUNS:
        run = run_of(name)
        now = box.json_of(os.path.join(HERE, "now", name + ".json"))
        table = passes(run, now)

        def grade(arm, task, t, way):
            sort = sorts.get(f"{name}/{arm}/{task}/{t[0]}", {}).get("sort", "")
            if way == "kept":
                return t[1]
            if way == "new words kept as passes" and sort == "only by the new words":
                return True
            if way == "and the two-of-three classes" and (sort == "only by the new words" or "two judges" in sort):
                return True
            return t[2]

        ways = ["kept", "now", "new words kept as passes", "and the two-of-three classes"]
        print(f"\n## {name}\n\n| Arm | Tries | " + " | ".join(ways) + " |\n| --- | --- | --- | --- | --- | --- |")
        for arm in sorted(table):
            rows = [(task, t) for task, tries in table[arm].items() for t in tries]
            print(f"| `{arm}` | {len(rows)} | " + " | ".join(
                str(sum(grade(arm, task, t, way) for task, t in rows)) for way in ways) + " |")
        pairs = ([tuple(run.cfg["twice"])] if run.cfg.get("twice") else []) + [tuple(p) for p in run.cfg.get("pairs", [])]
        for way in ways:
            rng = random.Random(20261115)
            for x, y in pairs:
                if x in table and y in table:
                    side = lambda arm: {task: [grade(arm, task, t, way) for t in tries]
                                        for task, tries in table[arm].items()}
                    mean, low, high, answer, up, down = box.passes_rule(side(x), side(y), rng, run.matters)
                    print(f"  {way}: {x} against {y} {mean:+.2f} ({low:+.2f} to {high:+.2f}); more on {up} tasks, "
                          f"less on {down}: {answer}")


def report(_args):
    for name in RUNS:
        run = run_of(name)
        now = box.json_of(os.path.join(HERE, "now", name + ".json"))
        table = passes(run, now)
        print(f"\n## {name}\n")
        print("| Arm | Tries | Passed, as kept | Passed now | Pass to fail | Fail to pass | Of those, on " +
              ", ".join(NEW_ASK) + " |")
        print("| --- | --- | --- | --- | --- | --- | --- |")
        for arm in sorted(table):
            rows = [(task, t) for task, tries in table[arm].items() for t in tries]
            down = [(task, t) for task, t in rows if t[1] and not t[2]]
            up = [(task, t) for task, t in rows if t[2] and not t[1]]
            print(f"| `{arm}` | {len(rows)} | {sum(t[1] for _, t in rows)} | {sum(t[2] for _, t in rows)} | "
                  f"{len(down)} | {len(up)} | {sum(1 for task, _ in down + up if task in NEW_ASK)} |")
        print("\nPass to fail, by task: " + ", ".join(
            f"{task} {count}" for task, count in sorted(
                {task: sum(1 for arm in table for t in table[arm].get(task, []) if t[1] and not t[2])
                 for task in MENDED}.items()) if count))
        for which, word in ((1, "kept grades"), (2, "grades now")):
            lines = rule(run, table, which)
            if lines:
                print(f"\nThe run's fixed comparisons, {word}:\n" + "\n".join(lines))
        print("\nEach try whose grade changed:")
        for key, got in sorted(now.items()):
            if got["kept"] != got["now"]:
                failed = [case for case, status in got["each"].items() if status != "passed"]
                print(f"  {key}: {'pass to fail' if got['kept'] else 'fail to pass'}; "
                      + (f"cases not passed: {failed}" if failed else f"could not load: {got['could not load']}"[:300]))


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    one = sub.add_parser("grade")
    one.add_argument("--parallel", type=int, default=3), one.add_argument("--task", action="append")
    sub.add_parser("reread"), sub.add_parser("report"), sub.add_parser("three-ways")
    args = parser.parse_args()
    {"grade": grade, "reread": reread, "report": report, "three-ways": three_ways}[args.command](args)


main()

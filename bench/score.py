#!/usr/bin/env python3
"""Score the runs that have been kept.

Usage: score.py <ast-grep binary> <run directory> [--strict]

For each task of each arm this prints, in order:

  the verdict on the answer, the answer itself, and every line ast-grep said about it
  the calls the subject made to ast-grep: how many were refused, how many ran and
    matched something else, how many were right, and which was the first right one
  the output tokens the subject spent, and how many came before its first right call
  what the subject took the task to be, and how sure it said it was
  for an answer that did not pass: whose failure it is, from `whose.txt`

The totals come last and cannot be printed alone.

A failure is sorted by a person who has read the request, the answer and the calls.
They write one line in `whose.txt` beside the answer. It starts with `the subject's`,
`the test's` or `not known`, and then says why. With `--strict`, a failure that
nobody has sorted makes this exit with 1.

A call is judged by running it again on `pilot/clean`. A call that reads a file the
subject made for itself cannot be run again here, and is counted as such.
"""
import collections, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PILOT = os.path.join(os.path.dirname(HERE), "pilot")
sys.path.insert(0, PILOT)
import grade  # noqa: E402  (one way of running and judging a command)

WHOSE = ("the subject's", "the test's", "not known")


def answer_of(path):
    """The command in an answer file: its first line that is not empty, without a task's name before it."""
    for line in open(path, encoding="utf-8", errors="replace"):
        line = line.strip().strip("`").strip()
        if line:
            return re.sub(r"^T\d\d:\s*", "", line)
    return ""


def judged(binary, command, expected):
    """(verdict, the lines that explain it) for one answer."""
    got, said = grade.run(binary, command)
    if isinstance(got, str):
        return got, said
    missed, extra, wrong_piece = grade.judge(got, expected)
    if not missed and not extra:
        return "pass", []
    lines = []
    if missed:
        lines.append(f"missed {len(missed)} of {len(expected)} expected: {', '.join(missed)}")
    if extra:
        lines.append(f"matched {len(extra)} not expected: {', '.join(extra)}")
    if wrong_piece:
        lines.append(f"{wrong_piece} of those start on an expected line and are not the expected piece of code")
    return "wrong", lines


def call_kind(binary, call, expected):
    """What one call to ast-grep was: other, elsewhere, not run again, refused, not right, or right."""
    args = [word for word in call["argv"] if word.split("=")[0] != "--json"]
    if not args or args[0] not in ("run", "scan"):
        return "other"
    below = os.path.normpath(call["cwd"])
    cwd = os.path.normpath(os.path.join(PILOT, "clean", below))
    inside = cwd == os.path.join(PILOT, "clean") or cwd.startswith(os.path.join(PILOT, "clean") + os.sep)
    if below.startswith("..") or not inside or not os.path.isdir(cwd):
        return "elsewhere"
    if grade.not_allowed(args[1:], json_too=False):
        return "not run again"
    got, _ = grade.matches(binary, args, cwd, below="" if below == "." else below)
    if isinstance(got, str):
        return "refused"
    missed, extra, _ = grade.judge(got, expected)
    return "right" if not missed and not extra else "not right"


def report_of(path):
    """(what the subject took the task to be, how sure it said it was) from its report."""
    text = open(path, encoding="utf-8", errors="replace").read()
    took = re.search(r"^A\.\s*(.+?)(?=^B\.|\Z)", text, re.M | re.S)
    sure = re.search(r"^B\.\s*\W*(sure|unsure|guess)\b", text, re.M | re.I)
    return (" ".join(took.group(1).split()) if took else None), (sure.group(1).lower() if sure else None)


def main():
    args = [a for a in sys.argv[1:] if a != "--strict"]
    strict = "--strict" in sys.argv[1:]
    if len(args) != 2:
        sys.exit("usage: score.py <ast-grep binary> <run directory> [--strict]")
    binary, top = os.path.abspath(args[0]), args[1]
    oracle = json.load(open(os.path.join(PILOT, "oracle.json")))
    totals = collections.OrderedDict()
    unsorted = 0
    for arm in sorted(os.listdir(top)):
        for task in sorted(os.listdir(os.path.join(top, arm))) if os.path.isdir(os.path.join(top, arm)) else []:
            kept = os.path.join(top, arm, task)
            if not os.path.isfile(os.path.join(kept, "setup.json")):
                continue
            total = totals.setdefault(arm, collections.Counter())
            if not os.path.isfile(os.path.join(kept, "record.json")):
                print(f"{arm} {task}: not kept yet\n")
                total["not kept"] += 1
                continue
            setup = json.load(open(os.path.join(kept, "setup.json")))
            record = json.load(open(os.path.join(kept, "record.json")))
            command = answer_of(os.path.join(kept, "answer.txt"))
            verdict, lines = judged(binary, command, oracle[task])
            print(f"{arm} {task}: {verdict}")
            print(f"    {command}")
            for line in lines:
                print(f"    {line}")
            total["runs"] += 1
            total["passed"] += verdict == "pass"
            total["output tokens"] += record["output_tokens"]

            written = len(record["messages"])
            spent = f"    output tokens: {record['output_tokens']:,}, in {written} message{'' if written == 1 else 's'}."
            if not setup["closed"]:
                calls = [json.loads(line) for line in open(os.path.join(kept, "calls.jsonl"))]
                kinds = [call_kind(binary, call, oracle[task]) for call in calls]
                tries = [(call, kind) for call, kind in zip(calls, kinds) if kind not in ("other", "elsewhere")]
                count = collections.Counter(kind for _, kind in tries)
                first = next((n for n, (_, kind) in enumerate(tries, 1) if kind == "right"), None)
                said = f"    calls to run or scan the task's code: {len(tries)}."
                for kind in ("refused", "not right", "right", "not run again"):
                    if count[kind]:
                        said += f" {count[kind]} {kind}."
                said += f" The first right one was call {first}." if first else " None was right."
                away = collections.Counter(kinds)
                if away["other"] or away["elsewhere"]:
                    said += f" Besides: {away['other']} for help or the like, {away['elsewhere']} on files of its own."
                print(said)
                total["calls"] += len(tries)
                if first:
                    at = tries[first - 1][0]["at"]
                    before = sum(m["output_tokens"] for m in record["messages"] if m["at"] <= at)
                    spent += f" Before the first right call: {before:,}."
                    total["before the first right call"] += before
                    total["found a right call"] += 1
                if record.get("code_unchanged") is False:
                    print("    The subject changed the code under src.")
            print(spent)
            took, sure = report_of(os.path.join(kept, "report.md"))
            print(f"    the subject took the task to be: {took or '(it did not say)'}")
            print(f"    the subject called its answer: {sure or '(it did not say)'}")
            if verdict != "pass":
                whose = os.path.join(kept, "whose.txt")
                line = open(whose, encoding="utf-8").read().strip() if os.path.isfile(whose) else ""
                found = next((w for w in WHOSE if line.startswith(w)), None)
                if found:
                    total[found] += 1
                    print(f"    this failure is sorted as: {line}")
                else:
                    unsorted += 1
                    total["not sorted yet"] += 1
                    print("    this failure is not sorted yet: write whose.txt")
            print()

    for arm, total in totals.items():
        said = f"{arm}: {total['passed']} of {total['runs']} passed. {total['output tokens']:,} output tokens."
        if total["calls"]:
            said += (f" {total['calls']} calls. {total['found a right call']} of {total['runs']} found a right call,"
                     f" after {total['before the first right call']:,} output tokens in all.")
        failed = total["runs"] - total["passed"]
        if failed:
            said += (f" Of {failed} that did not pass: {total[WHOSE[0]]} the subject's, {total[WHOSE[1]]} the test's,"
                     f" {total[WHOSE[2]]} not known, {total['not sorted yet']} not sorted yet.")
        if total["not kept"]:
            said += f" {total['not kept']} not kept yet."
        print(said)
    if strict and unsorted:
        sys.exit(1)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Score the runs that have been kept.

Usage: score.py <ast-grep binary> <run directory> [--strict]

For each try at each task of each arm this prints, in order:

  the verdict on the answer, the answer itself, and every line ast-grep said about it
  the calls the subject made to ast-grep: how many were refused, how many ran and
    matched something else, how many were right, and which was the first right one
  the output tokens the subject spent, and how many came before its first right call
  how many tokens the subject had read and written: when it began, at its first right
    call, and at its end. This is what its context held, and what a guide or a help costs to read
  what the subject took the task to be, and how sure it said it was
  for an answer that did not pass: whose failure it is, from `whose.txt`

The totals come last and cannot be printed alone. An arm passes a task when every
try at it passed. The share of single tries that passed is printed beside that.

With `--guide LEDGER` it also counts, for a subject with the tool, the calls that ask what a command of
that ledger asks, but for the path and the view. A subject given the guide may be checking a row. A
subject given nothing meets such a command by chance, and its count says how often.

A failure is sorted by a person who has read the request, the answer and the calls.
They write one line in `whose.txt` beside the answer. It starts with `the subject's`,
`the test's` or `not known`, and then says why. With `--strict`, a failure that
nobody has sorted makes this exit with 1.

Only a call that searched the task's code is counted as a try at it. Two kinds of
call searched something else, and are counted apart, whatever came of them: a call
with `--stdin`, which searches code that was piped in, and a call that names a file
or directory other than `src`, which the subject made for itself.

A try at the task's code was refused when ast-grep itself ended it with an error,
as the subject made it: that status is written down with the call. A call that ran
is run again on the code of its variant, as `build.py` built it, to see what it
matched.

When a try was kept, `keep.py` wrote down every place outside the subject's
directory that the subject named in a call to one of its tools. They are printed
here, for a reader to judge: the subject was told to stay in its directory.

A harness may hand a subject more tools than a shell and its files. The name of
each such tool that a subject called is printed too. What it was called with is
not kept: that is read in the harness's own record.
"""
import collections, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import sets  # noqa: E402
sys.path.insert(1, sets.where("pilot"))
import grade  # noqa: E402  (one way of running and judging a command)

WHOSE = ("the subject's", "the test's", "not known")
# What a subject needs for a task: a shell, its files, and the call that hands its report back.
OWN_TOOLS = ("Bash", "Read", "Write", "Edit", "Glob", "Grep", "SubagentHandback")


def answer_of(path):
    """The command in an answer file: its first line that is not empty, without a task's name before it."""
    for line in open(path, encoding="utf-8", errors="replace"):
        line = line.strip().strip("`").strip()
        if line:
            return re.sub(r"^T\d\d:\s*", "", line)
    return ""


def judged(binary, command, expected, clean):
    """(verdict, the lines that explain it) for one answer."""
    got, said = grade.run(binary, command, clean)
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


# The options of `ast-grep run`, `scan` and `outline` 0.51.1 that take the next word as their value.
# The last five are `outline`'s own. No option of one subcommand is a bare flag of another.
TAKES_A_VALUE = {"-p", "--pattern", "--selector", "--strictness", "-k", "--kind", "-r", "--rewrite", "--rule",
                 "-l", "--lang", "-c", "--config", "--custom-languages", "--no-ignore", "--globs", "-j", "--threads",
                 "--color", "--inspect", "-A", "--after", "-B", "--before", "-C", "--context", "--heading",
                 "--inline-rules", "--format", "--report-style", "--filter", "--min-severity", "--max-results",
                 "--items", "--type", "--match", "--view", "--outline-rules"}


def as_asked(args):
    """A call's words but for where it searches and how its list is shown: (the subcommand, its options).

    Two calls that differ only in the path, in `--view`, `--json` or `--color`, or in the order of their
    options, ask the tool the same thing.
    """
    options, value = set(), None
    for word in args[1:]:
        if value:
            if value not in ("--view", "--color"):
                options.add((value, word))
            value = None
        elif word.startswith("-"):
            name = word.split("=")[0]
            if name in ("--json", "--view", "--color"):
                value = word if "=" not in word and name != "--json" else None
            elif "=" in word:
                options.add((name, word.split("=", 1)[1]))
            elif word in TAKES_A_VALUE:
                value = word
            else:
                options.add((word, None))
    return args[0], frozenset(options)


def of_guide(path):
    """The commands of a guide that is a ledger: what each row runs, as `as_asked` reads a call."""
    import shlex, tomllib
    rows = tomllib.load(open(path, "rb"))["row"]
    return {as_asked(shlex.split(row["run"])[1:]) for row in rows if row.get("run", "").startswith("ast-grep ")}


def searched(args, below, work):
    """Where a call searched, from its words: (True if only the task's code, the words to run it again with).

    `below` is where the call ran, under the subject's directory. `work` is that directory
    as the subject knew it: a call may name it in full. With no place named, ast-grep
    searches where it runs.
    """
    again, places, value = [], [], False
    for word in args:
        if value or word.startswith("-"):
            value = not value and word in TAKES_A_VALUE
            again.append(word)
            continue
        full = os.path.normpath(os.path.join(work, below, word))
        # The place as seen from the subject's directory: `src/a.js`, `.`, or `../x` for one outside it.
        places.append(os.path.relpath(full, work))
        # A place named in full is named again from where the call runs, so that it is the clean copy's.
        again.append(os.path.relpath(full, os.path.join(work, below)) if os.path.isabs(word) else word)
    if not places:
        places.append(os.path.normpath(below))
    return all(p in (".", "src") or p.startswith("src" + os.sep) for p in places), again


def call_kind(binary, call, expected, clean, work):
    """What one call to ast-grep was: other, piped in, elsewhere, not run again, refused, not right, or right."""
    args = [word for word in call["argv"] if word.split("=")[0] != "--json"]
    if not args or args[0] not in ("run", "scan", "outline") \
            or any(w in ("--help", "-h", "--version", "-V") for w in args):
        return "other"
    # Code that was piped in is searched, and no file. Refused or not, it is no try at the task's code.
    if "--stdin" in args:
        return "piped in"
    below = os.path.normpath(call["cwd"])
    cwd = os.path.normpath(os.path.join(clean, below))
    if below.startswith("..") or not os.path.isdir(cwd):
        return "elsewhere"
    task, again = searched(args[1:], below, work)
    if not task:
        return "elsewhere"
    # What ast-grep itself said of the call when the subject made it. For `run` and `scan`, 0 and 1 are
    # a run: 1 is a run that matched nothing. `outline` ends with 0 when it has listed, items or none,
    # and with 1 when it refuses a type it does not have.
    if call["status"] not in ((0,) if args[0] == "outline" else (0, 1)):
        return "refused"
    if grade.not_allowed(args[1:], json_too=False):
        return "not run again"
    got, _ = grade.matches(binary, [args[0]] + again, cwd, below="" if below == "." else below)
    if isinstance(got, str):
        # It ran for the subject and does not run here: it read something the subject made.
        return "elsewhere"
    missed, extra, _ = grade.judge(got, expected)
    return "right" if not missed and not extra else "not right"


def report_of(path):
    """(what the subject took the task to be, how sure it said it was) from its report."""
    text = open(path, encoding="utf-8", errors="replace").read()
    took = re.search(r"^A\.\s*(.+?)(?=^B\.|\Z)", text, re.M | re.S)
    sure = re.search(r"^B\.\s*\W*(sure|unsure|guess)\b", text, re.M | re.I)
    return (" ".join(took.group(1).split()) if took else None), (sure.group(1).lower() if sure else None)


def tries(top):
    """Every try under a run directory, as (arm, task, variant, directory), in order."""
    for arm in sorted(os.listdir(top)):
        if not os.path.isdir(os.path.join(top, arm)):
            continue
        for task in sorted(os.listdir(os.path.join(top, arm))):
            for leaf in sorted(os.listdir(os.path.join(top, arm, task))):
                kept = os.path.join(top, arm, task, leaf)
                if re.fullmatch(r"v\d+", leaf) and os.path.isfile(os.path.join(kept, "setup.json")):
                    yield arm, task, int(leaf[1:]), kept


# The harness's own text, in tokens for a character. No program here can count its tokens, so this is
# a fit: on 2026-11-13 the 8,401 characters the harness handed each subject came to 2,728 tokens, when
# the tokens of each later step were set against the characters that came back in it.
PER_CHARACTER = 2728 / 8401


def read(binary, kept):
    """Everything `score.py` says of one kept try, as a dict. None for a try that is not kept yet."""
    if not os.path.isfile(os.path.join(kept, "record.json")):
        return None
    setup = json.load(open(os.path.join(kept, "setup.json")))
    variant = setup.get("variant", 0)
    built = sets.built(setup.get("set", "pilot"), variant)
    try:
        expected = json.load(open(os.path.join(built, "oracle.json")))[setup["task"]]
    except OSError:
        sys.exit(f"score.py: variant {variant} of `{setup.get('set', 'pilot')}` is not built. Run build.py first.")
    clean = sets.clean(setup.get("set", "pilot"), variant, setup["task"])
    record = json.load(open(os.path.join(kept, "record.json")))
    command = answer_of(os.path.join(kept, "answer.txt"))
    verdict, lines = judged(binary, command, expected, clean)
    took, sure = report_of(os.path.join(kept, "report.md"))
    one = {"setup": setup, "record": record, "command": command, "verdict": verdict, "lines": lines,
           "took": took, "sure": sure, "output tokens": record["output_tokens"], "closed": setup["closed"],
           "calls": None, "first": None, "before": None, "held at first": None}
    # What the subject had in front of it when it wrote each message. Kept in the record since 2026-11-13,
    # and beside it, in `read.json`, for a try that was kept before.
    reads = [m.get("read") for m in record["messages"]]
    if any(r is None for r in reads):
        try:
            reads = json.load(open(os.path.join(kept, "read.json"), encoding="utf-8"))["read"]
        except OSError:
            reads = None
    one["began"] = reads[0] if reads else None
    one["held at end"] = reads[-1] + record["messages"][-1]["output_tokens"] if reads else None
    # What the harness itself handed the subject after it began. It is in what the subject read, and it
    # is not the test's. Kept in the record since 2026-11-13, and in `lines.json` for the tries of that day.
    added = record.get("added")
    if added is None:
        try:
            added = json.load(open(os.path.join(kept, "lines.json"), encoding="utf-8"))["harness"]
        except OSError:
            added = None

    def of_harness(index):
        """The harness's own text in front of the subject when it wrote message `index`, in tokens."""
        if added is None or not reads:
            return None
        return round(sum(piece["characters"] for piece in added if piece["after message"] <= index) * PER_CHARACTER)
    one["added at end"], one["added at first"] = of_harness(len(record["messages"]) - 1), None
    if not setup["closed"]:
        calls = [json.loads(line) for line in open(os.path.join(kept, "calls.jsonl"))]
        kinds = [call_kind(binary, call, expected, clean, setup["work"]) for call in calls]
        made = [(call, kind) for call, kind in zip(calls, kinds) if kind not in ("other", "elsewhere", "piped in")]
        one["calls"], one["kinds"], one["made"] = calls, kinds, made
        one["first"] = next((n for n, (_, kind) in enumerate(made, 1) if kind == "right"), None)
        if one["first"]:
            at = made[one["first"] - 1][0]["at"]
            one["before"] = sum(m["output_tokens"] for m in record["messages"] if m["at"] <= at)
            # The message that made that call is the last one written before it.
            upto = [n for n, m in enumerate(record["messages"]) if m["at"] <= at]
            if reads and upto:
                one["held at first"] = reads[upto[-1]] + record["messages"][upto[-1]]["output_tokens"]
                one["added at first"] = of_harness(upto[-1])
    whose = os.path.join(kept, "whose.txt")
    one["whose"] = open(whose, encoding="utf-8").read().strip() if os.path.isfile(whose) else ""
    return one


def main():
    args = [a for a in sys.argv[1:] if a != "--strict"]
    strict = "--strict" in sys.argv[1:]
    guide = None
    if "--guide" in args:
        at = args.index("--guide")
        guide, args = of_guide(args[at + 1]), args[:at] + args[at + 2:]
    if len(args) != 2:
        sys.exit("usage: score.py <ast-grep binary> <run directory> [--strict] [--guide LEDGER]")
    binary, top = os.path.abspath(args[0]), args[1]
    totals = collections.OrderedDict()
    passed_by_task = collections.defaultdict(lambda: collections.defaultdict(list))
    unsorted = 0
    for arm, task, variant, kept in tries(top):
        total = totals.setdefault(arm, collections.Counter())
        one = read(binary, kept)
        if one is None:
            print(f"{arm} {task} v{variant}: not kept yet\n")
            total["not kept"] += 1
            continue
        record, verdict = one["record"], one["verdict"]
        print(f"{arm} {task} v{variant}: {verdict}")
        print(f"    {one['command']}")
        for line in one["lines"]:
            print(f"    {line}")
        total["tries"] += 1
        total["passed"] += verdict == "pass"
        total["output tokens"] += record["output_tokens"]
        passed_by_task[arm][task].append(verdict == "pass")

        written = len(record["messages"])
        spent = f"    output tokens: {record['output_tokens']:,}, in {written} message{'' if written == 1 else 's'}."
        if not one["closed"]:
            calls, kinds, made, first = one["calls"], one["kinds"], one["made"], one["first"]
            count = collections.Counter(kind for _, kind in made)
            said = f"    calls to ast-grep on the task's code: {len(made)}."
            for kind in ("refused", "not right", "right", "not run again"):
                if count[kind]:
                    said += f" {count[kind]} {kind}."
            said += f" The first right one was call {first}." if first else " None was right."
            away = collections.Counter(kinds)
            if away["other"] or away["elsewhere"] or away["piped in"]:
                turned_down = collections.Counter(kind for call, kind in zip(calls, kinds)
                                                  if call["status"] not in (0, 1))
                said += (f" Besides: {away['other']} for help or the like,"
                         f" {away['elsewhere']} on files of its own ({turned_down['elsewhere']} refused),"
                         f" {away['piped in']} on code it piped in ({turned_down['piped in']} refused).")
            print(said)
            if guide is not None:
                # A call that asks what a row of the guide asks is a check of that row, or a chance meeting:
                # the arm with no guide says how often it is chance.
                same = sum(1 for call, _ in made
                           if as_asked([w for w in call["argv"]]) in guide)
                print(f"    calls that ask what a command of the guide asks, but for the path and the view: {same}.")
                total["as the guide"] += same
                total["tries with a call as the guide"] += bool(same)
            total["calls"] += len(made)
            total["refused"] += count["refused"]
            if first:
                spent += f" Before the first right call: {one['before']:,}."
                total["before the first right call"] += one["before"]
                total["calls to the first right one"] += first
                total["found a right call"] += 1
            if record.get("code_unchanged") is False:
                print("    The subject changed the code under src.")
        subject = record.get("subject") or {}
        if subject.get("tools") is not None:
            more = [name for name in subject["tools"] if name not in OWN_TOOLS]
            print(f"    the subject was a `{subject.get('type')}`, handed {len(subject['tools'])} tools:"
                  f" {len(more)} besides a shell, its files and the hand-back")
            total["handed more tools"] += bool(more)
        other = sorted({name for m in record["messages"] for name in m["tools"] if name not in OWN_TOOLS})
        if other:
            total["called another tool"] += 1
            print("    tools it called that the task does not need: " + ", ".join(other))
        if "outside" not in record:
            print("    places outside its directory: not looked for when this try was kept")
        elif record["outside"]:
            total["named a place outside"] += 1
            print("    outside its directory, the subject named: "
                  + "; ".join(f"{o['place']} ({o['tool']})" for o in record["outside"]))
        print(spent)
        if one["held at end"] is None:
            print("    what the subject had read: not kept for this try")
        else:
            held = f"    read and written, in tokens: {one['began']:,} when the subject began"
            if one["held at first"] is not None:
                held += f", {one['held at first']:,} when it made its first right call"
                total["grew to the first right call"] += one["held at first"] - one["began"]
            print(held + f", {one['held at end']:,} at its end.")
            total["grew to the end"] += one["held at end"] - one["began"]
            total["with what it read"] += 1
            if one["added at end"] is None:
                total["added not known"] += 1
                if not one["closed"]:
                    print("    what the harness handed the subject after it began: not kept for this try")
            elif one["added at end"]:
                print(f"    of what it read, about {one['added at end']:,} tokens are the harness's own text,"
                      " handed over after the subject began.")
                total["added to the end"] += one["added at end"]
                total["added to the first right call"] += one["added at first"] or 0
        print(f"    the subject took the task to be: {one['took'] or '(it did not say)'}")
        print(f"    the subject called its answer: {one['sure'] or '(it did not say)'}")
        if verdict != "pass":
            found = next((w for w in WHOSE if one["whose"].startswith(w)), None)
            if found:
                total[found] += 1
                print(f"    this failure is sorted as: {one['whose']}")
            else:
                unsorted += 1
                total["not sorted yet"] += 1
                print("    this failure is not sorted yet: write whose.txt")
        print()

    for arm, total in totals.items():
        by_task = passed_by_task[arm]
        whole = sum(all(tries_) for tries_ in by_task.values())
        said = (f"{arm}: {whole} of {len(by_task)} tasks passed on every try."
                f" {total['passed']} of {total['tries']} single tries passed. {total['output tokens']:,} output tokens.")
        if total["calls"]:
            said += f" {total['calls']} calls, {total['refused']} refused."
            said += f" {total['found a right call']} of {total['tries']} tries found a right call"
            if total["found a right call"]:
                said += (f", after {total['calls to the first right one']} calls and"
                         f" {total['before the first right call']:,} output tokens in all")
            said += "."
        if guide is not None and total["calls"]:
            said += (f" {total['as the guide']} calls asked what a command of the guide asks,"
                     f" in {total['tries with a call as the guide']} tries.")
        if total["with what it read"]:
            said += (f" What a subject had read and written grew by {round(total['grew to the end'] / total['with what it read']):,}"
                     f" tokens a try to its end")
            if total["found a right call"] and total["grew to the first right call"]:
                said += f", and by {round(total['grew to the first right call'] / total['found a right call']):,} to its first right call"
            said += "."
            if total["added to the end"]:
                said += (f" Of that, the harness's own text is {round(total['added to the end'] / total['with what it read']):,}"
                         f" tokens a try to its end")
                if total["found a right call"] and total["added to the first right call"]:
                    said += f" and {round(total['added to the first right call'] / total['found a right call']):,} to its first right call"
                said += "."
            if total["added not known"]:
                said += f" What the harness added is not known for {total['added not known']} of these tries."
        failed = total["tries"] - total["passed"]
        if failed:
            said += (f" Of {failed} that did not pass: {total[WHOSE[0]]} the subject's, {total[WHOSE[1]]} the test's,"
                     f" {total[WHOSE[2]]} not known, {total['not sorted yet']} not sorted yet.")
        if total["named a place outside"]:
            said += f" {total['named a place outside']} named a place outside the subject's directory."
        if total["handed more tools"]:
            said += f" {total['handed more tools']} were handed more tools than a shell and their files."
        if total["called another tool"]:
            said += f" {total['called another tool']} called a tool the task does not need."
        if total["not kept"]:
            said += f" {total['not kept']} not kept yet."
        print(said)
    if strict and unsorted:
        sys.exit(1)


if __name__ == "__main__":
    main()

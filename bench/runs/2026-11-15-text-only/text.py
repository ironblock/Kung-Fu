#!/usr/bin/env python3
"""With no code in hand: set a try up, keep it, grade it, add the tries up, compare the arms.

    text.py texts --texts T                           print each text's size and sha256
    text.py setup ARM TASK N --work W --texts T [--fresh]
    text.py waiting
    text.py keep --records DIR --model-starts claude-haiku --model-as "a Haiku model" [--wait S] [--need N]
                 [--remove-work]
    text.py grade --pristine P --runner R [--again]
    text.py check-tasks --pristine P --runner R
    text.py tally [--strict] [--without-spoiled]
    text.py compare [--without-spoiled]
    text.py simulate

The tasks, the asks, the hidden checks, the scaffold and the grader are the reader test's, used from
`../2026-11-15-reader` as they stand. This file holds only what differs: the arms, the request, the box,
and the pairs the rules are asked about. README.md beside this file says what each number is.

T is a directory outside this repository that holds the three texts cut from the library:
`names.d.ts`, `types.d.ts` and `02-camera.md`. README.md gives the commands that make them. They are
the makers' and are not kept here: a kept try holds the text's sha256 and not the text.
"""
import argparse, glob, hashlib, json, os, random, re, secrets, shutil, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
READER = os.path.join(os.path.dirname(HERE), "2026-11-15-reader")
sys.path.insert(0, READER)
import reader  # noqa: E402  the reader test's tool: its keeper, its grader, its rules

TRIES = os.path.join(HERE, "tries")
reader.TRIES = TRIES  # the reader's functions now keep, grade and count this run's tries, and not its own

LEDGERS = reader.LEDGERS
# arm -> (the text's name in T or in the reader test's guides, the name it has in `app`)
TEXT = {
    "none": None,
    "names": ("names.d.ts", "camera-api.d.ts"),
    "types-a": ("types.d.ts", "camera-api.d.ts"),
    "types-b": ("types.d.ts", "camera-api.d.ts"),
    "doc": ("02-camera.md", "02-camera.md"),
    "ledger": ("ledger", reader.LEDGER_FILE),
    "ledger-cut": ("ledger-cut", reader.LEDGER_FILE),
}
ARMS = list(TEXT)
# A ceiling is the same text and the same request, sent to a stronger subject.
CEILINGS = {"ceiling-names": "names", "ceiling-types": "types-a", "ceiling-doc": "doc",
            "ceiling-ledger": "ledger", "ceiling-ledger-cut": "ledger-cut"}

DECLARATIONS = ("What I do have is the library's type declarations for its camera code, in "
                "@BOX@/app/camera-api.d.ts. Read them first.")
LEDGER = ("What I do have is @BOX@/app/" + reader.LEDGER_FILE + ", a ledger of facts about the library's camera "
          "code, written for this release. A row with `run` and `shows` is a search of the code and a sentence "
          "about what it finds; a tool has checked that each search still gives the count its row states. A row "
          "with `is` is a note by someone who read the code, and nothing has checked it. Read the ledger first.")
GUIDE = {
    "none": "",
    "names": DECLARATIONS, "types-a": DECLARATIONS, "types-b": DECLARATIONS,
    "doc": "What I do have is the library's own notes on its camera code, in @BOX@/app/02-camera.md. "
           "Read them first.",
    "ledger": LEDGER, "ledger-cut": LEDGER,
}

REQUEST = """I'm working on a small viewer app in @BOX@/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

@GUIDE@

@ASK@

Please keep every change inside @BOX@/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
"""


def sha256(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def text_of(arm, n, texts):
    """(where the arm's text for try n is, the name it has in `app`), or None for the arm with no text."""
    if TEXT[arm] is None:
        return None
    source, name = TEXT[arm]
    if source in ("ledger", "ledger-cut"):
        return os.path.join(READER, "guides", source, LEDGERS[(n - 1) % len(LEDGERS)] + ".toml"), name
    return os.path.join(os.path.abspath(texts), source), name


def texts(args):
    for name in ("names.d.ts", "types.d.ts", "02-camera.md"):
        path = os.path.join(os.path.abspath(args.texts), name)
        print(f"{name:14s} {os.path.getsize(path):6d} bytes  sha256 {sha256(path)}")
    for arm in ("ledger", "ledger-cut"):
        for ledger in LEDGERS:
            path = os.path.join(READER, "guides", arm, ledger + ".toml")
            print(f"{arm + '/' + ledger:14s} {os.path.getsize(path):6d} bytes  sha256 {sha256(path)}")


# ----------------------------------------------------------------------------------------------- setup

def says_which(text, box):
    """A request must not say which arm or which task it is. The words an arm's own paragraph uses for its
    text (`ledger`, `type declarations`) are the note's, and are not a name of an arm."""
    found = []
    for word in ["types-a", "types-b", "ledger-cut", "ceiling", "names.d.ts", "types.d.ts"] + reader.tasks():
        if re.search(r"(?<![\w-])" + re.escape(word) + r"(?![\w-])", text):
            found.append(word)
    for part in box.split(os.sep):
        if part in ARMS or part in CEILINGS or part in reader.tasks():
            found.append("the path part " + part)
    return found


def setup(args):
    arm, task, n = args.arm, args.task, args.n
    assert arm in ARMS or arm in CEILINGS, arm
    assert task in reader.tasks(), task
    kept = os.path.join(HERE, "fresh-reader", f"{arm}-{task}") if args.fresh else os.path.join(TRIES, arm, task, str(n))
    assert not os.path.exists(kept), f"{kept} is already set up"
    as_arm = CEILINGS.get(arm, arm)
    while True:
        box = os.path.join(os.path.abspath(args.work), secrets.token_hex(3))
        if not os.path.exists(box):
            break
    assert not os.path.abspath(box).startswith(os.path.dirname(os.path.dirname(os.path.dirname(HERE)))), \
        "the box is inside this repository"
    os.makedirs(box)
    shutil.copytree(os.path.join(READER, "scaffold", "app"), os.path.join(box, "app"))
    os.makedirs(os.path.join(box, "app", "src"), exist_ok=True)
    text = text_of(as_arm, n, args.texts)
    if text:
        shutil.copy(text[0], os.path.join(box, "app", text[1]))
    ask = open(reader.task_file(task, "ask.md"), encoding="utf-8").read().strip()
    words = GUIDE[as_arm]
    request = REQUEST.replace("@GUIDE@\n\n", (words + "\n\n") if words else "").replace("@ASK@", ask).replace("@BOX@", box)
    which = says_which(request, box)
    if which:
        shutil.rmtree(box)
        sys.exit(f"text.py: the request would hold {which}. Nothing was set up.")
    os.makedirs(kept)
    open(os.path.join(kept, "request.md"), "w", encoding="utf-8").write(request)
    json.dump({"arm": arm, "task": task, "n": n, "box": box, "subject": "bench-subject-closed",
               "text": (os.path.relpath(text[0], os.path.dirname(HERE)) if text[0].startswith(READER)
                        else os.path.basename(text[0])) if text else None,
               "text in app as": text[1] if text else None,
               "text bytes": os.path.getsize(text[0]) if text else 0,
               "text sha256": sha256(text[0]) if text else None,
               "ask sha": reader.sha(reader.task_file(task, "ask.md")),
               "set up": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())},
              open(os.path.join(kept, "setup.json"), "w"), indent=1)
    print(os.path.join(kept, "request.md"))


# ------------------------------------------------------------------------------------------------ keep

def working_directories(path):
    """Each working directory the harness's record of a subject gives."""
    found = set()
    for raw in open(path, encoding="utf-8"):
        try:
            entry = json.loads(raw)
        except ValueError:
            continue
        if isinstance(entry, dict) and entry.get("cwd"):
            found.add(entry["cwd"])
    return sorted(found)


def outside_calls(path, box):
    """(spoiling calls, calls that named a place outside the box and got an error back).

    A try is spoiled if the subject read a path outside its box and content came back, or wrote outside
    its box other than a scratch file of its own. A read that came back as an error gave the subject no
    content: it is written down and does not spoil the try."""
    asked, spoiled, tried = {}, [], []
    for raw in open(path, encoding="utf-8"):
        try:
            entry = json.loads(raw)
        except ValueError:
            continue
        content = (entry.get("message") or {}).get("content")
        if not isinstance(content, list):
            continue
        for block in content:
            if not isinstance(block, dict):
                continue
            if block.get("type") == "tool_use" and block.get("name") in ("Read", "Write"):
                target = os.path.normpath(str((block.get("input") or {}).get("file_path") or ""))
                if not (target == box or target.startswith(box + os.sep)):
                    asked[block.get("id")] = (block["name"], target)
            if block.get("type") == "tool_result" and block.get("tool_use_id") in asked:
                name, target = asked[block["tool_use_id"]]
                if block.get("is_error"):
                    tried.append(("read " if name == "Read" else "wrote ") + target)
                elif name == "Write" and "/scratchpad/" in target:
                    pass
                else:
                    spoiled.append(("read " if name == "Read" else "wrote ") + target)
    return spoiled, tried


def respoil(args):
    """Work out again, for every kept try, whether it is spoiled, from the harness's record."""
    for path in sorted(glob.glob(os.path.join(TRIES, "*", "*", "*", "record.json"))):
        record = json.load(open(path))
        made = json.load(open(os.path.join(os.path.dirname(path), "setup.json")))
        spoiled, tried = outside_calls(os.path.join(args.records, record["record"]), made["box"])
        record["spoiled"], record["tried outside its box and got an error"] = spoiled, tried
        json.dump(record, open(path, "w"), indent=1)
        if spoiled:
            print("SPOILED:", os.path.relpath(os.path.dirname(path), TRIES), spoiled)


def keep(args):
    before = set(reader.waiting(show=False).values())
    args.pristine = "/nonexistent"  # a try has no checkout, so the reader's keeper compares nothing with it
    reader.keep(args)
    repository = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
    for kept in sorted(before):
        path = os.path.join(kept, "record.json")
        if not os.path.exists(path):
            continue
        made = json.load(open(os.path.join(kept, "setup.json")))
        record = json.load(open(path))
        # The text is the makers', or is in the reader test's guides already. What is kept is whether the
        # subject left it as it was handed over.
        state = None
        if made["text in app as"]:
            there = os.path.join(kept, "app", made["text in app as"])
            state = "gone" if not os.path.exists(there) else "as handed over" if sha256(there) == made["text sha256"] \
                else "changed"
            if state == "as handed over":
                os.remove(there)
        record["the text when the subject finished"] = state
        where = working_directories(os.path.join(args.records, record["record"]))
        record["the working directory the harness gave"] = where
        json.dump(record, open(path, "w"), indent=1)
        # The harness gives a subject the sending session's working directory, and that cannot be moved out
        # of the repository. At its root the path names the project and nothing of this run. Deeper, it
        # names more.
        inside = [w for w in where if w.startswith(repository + os.sep)]
        if inside:
            print("STOP: the subject's working directory was below the repository's root:", kept, inside)
        # A try is spoiled if the subject named, in a call, a path outside its box that exists and gave
        # content back, or wrote outside its box other than a scratch file of its own.
        spoiled, tried = outside_calls(os.path.join(args.records, record["record"]), made["box"])
        record["tried outside its box and got an error"] = tried
        record["spoiled"] = spoiled
        json.dump(record, open(path, "w"), indent=1)
        if spoiled:
            print("SPOILED:", os.path.relpath(kept, TRIES), spoiled)
        if state not in (None, "as handed over"):
            print("the text was", state, "in", os.path.relpath(kept, TRIES))


# ----------------------------------------------------------------------------------------------- tally

def kept_tries(without_spoiled=False):
    got = reader.kept_tries()
    spoiled = []
    for arm in list(got):
        for task in list(got[arm]):
            for t in list(got[arm][task]):
                record = json.load(open(os.path.join(TRIES, arm, task, str(t["n"]), "record.json")))
                if record.get("spoiled"):
                    spoiled.append((arm, task, t["n"], record["spoiled"]))
                    if without_spoiled:
                        got[arm][task].remove(t)
            if not got[arm][task]:
                del got[arm][task]
    return got, spoiled


def tally(args):
    got, spoiled = kept_tries(args.without_spoiled)
    print(f"spoiled tries: {len(spoiled)}" + (", left out below" if args.without_spoiled else ", counted below"))
    for arm, task, n, why in spoiled:
        print(f"  {arm}/{task}/{n}: " + "; ".join(why))
    print()
    names = reader.tasks()

    def cell(arm, task):
        tries = got.get(arm, {}).get(task, [])
        return f"{sum(t['passed'] for t in tries)} of {len(tries)}" if tries else "-"

    def total(arm):
        tries = [t for ts in got.get(arm, {}).values() for t in ts]
        return f"{sum(t['passed'] for t in tries)} of {len(tries)}" if tries else "-"

    for title, arms in (("passed of tries, by task and arm", [a for a in ARMS if a in got]),
                        ("the ceilings: passed of tries, by task and text", [a for a in CEILINGS if a in got])):
        if not arms:
            continue
        print(title)
        print("task  " + "".join(f"{a.replace('ceiling-', ''):>12s}" for a in arms))
        for task in names:
            print(f"{task:5s} " + "".join(f"{cell(a, task):>12s}" for a in arms))
        print("all   " + "".join(f"{total(a):>12s}" for a in arms))
        print()
    if any(a in got for a in ("ceiling-ledger", "ceiling-ledger-cut", "ledger", "ledger-cut")):
        print("the ledger arms by which ledger a try had: passed of tries")
        for arm in ("ceiling-ledger", "ceiling-ledger-cut", "ledger", "ledger-cut"):
            if arm in got:
                by = {}
                for ts in got[arm].values():
                    for t in ts:
                        by.setdefault(LEDGERS[(t["n"] - 1) % 3], []).append(t["passed"])
                print(f"  {arm:20s} " + "; ".join(f"{k} {sum(v)} of {len(v)}" for k, v in sorted(by.items())))
        print()
    arms = [a for a in list(ARMS) + list(CEILINGS) if a in got]
    print("what a try grew by, in tokens read and written: the mean of each task's tries")
    print("task  " + "".join(f"{a.replace('ceiling-', 'c-'):>12s}" for a in arms))
    for task in names:
        print(f"{task:5s} " + "".join(
            f"{(round(sum(t['grew'] for t in got[a][task]) / len(got[a][task])) if got[a].get(task) else '-'):>12}"
            for a in arms))
    print("\noutput tokens, all tries: " + "; ".join(
        f"{a} {sum(t['out'] for ts in got[a].values() for t in ts):,}" for a in arms))
    print("calls, all tries: " + "; ".join(
        f"{a} {sum(t['calls'] for ts in got[a].values() for t in ts)}" for a in arms))
    print("\nthe part of each question task that a ledger's false note speaks to")
    for task, part in (("P1", "pinch"), ("I1", "a")):
        print(f"  {task} {part}: " + "; ".join(
            f"{a} wrong in {sum(not t['each'].get(part, False) for t in got[a].get(task, []))} of "
            f"{len(got[a].get(task, []))}" for a in arms))
    print("\nfailures, sorted")
    unsorted = 0
    for arm in arms:
        sorts = {}
        for ts in got[arm].values():
            for t in ts:
                if not t["passed"]:
                    word = (t["whose"] or "not sorted yet").split(":")[0]
                    sorts[word] = sorts.get(word, 0) + 1
        unsorted += sorts.get("not sorted yet", 0)
        print(f"  {arm:20s} {sum(sorts.values()):3d}: " + "; ".join(f"{k} {v}" for k, v in sorted(sorts.items())))
    if args.strict and unsorted:
        sys.exit("a failure is not sorted")


# --------------------------------------------------------------------------------------------- compare

PAIRS = [("names", "none"), ("types-a", "none"), ("types-b", "none"), ("doc", "none"), ("ledger", "none"),
         ("types-a", "names"), ("types-b", "names"), ("doc", "types-a"), ("doc", "types-b"),
         ("ledger", "types-a"), ("ledger", "types-b"), ("ledger", "doc"), ("ledger-cut", "ledger")]


def compare(args):
    got, spoiled = kept_tries(args.without_spoiled)
    print(f"spoiled tries: {len(spoiled)}" + (", left out" if args.without_spoiled else ", counted") + "\n")
    rng = random.Random(20261115)

    def one(x, y):
        first = {t: [r["passed"] for r in rs] for t, rs in got[x].items()}
        second = {t: [r["passed"] for r in rs] for t, rs in got[y].items()}
        mean, low, high, answer, up, down = reader.passes_rule(first, second, rng)
        print(f"  {x:10s} against {y:10s} {mean:+.2f} ({low:+.2f} to {high:+.2f}); tasks where the first passed "
              f"more {up}, less {down}: {answer}")
        return answer

    print("One arm twice. If the rule tells the two rounds apart, nothing it says below counts.")
    if "types-a" in got and "types-b" in got:
        one("types-a", "types-b")
    print("\nPassing: the mean over tasks of (share of tries passed by the first) less (by the second)."
          "\nA comparison with `types` counts only if both rounds give it.")
    for x, y in PAIRS:
        if x in got and y in got:
            one(x, y)
    print("\nA false note: tries that got wrong the part the note speaks to (P1 pinch, I1 a)")
    if "ledger" in got and "ledger-cut" in got:
        part = {"P1": "pinch", "I1": "a"}
        wrong = {}
        for arm in ("ledger", "ledger-cut"):
            tries = [(t, r) for t in part for r in got[arm].get(t, [])]
            wrong[arm] = (sum(not r["each"].get(part[t], False) for t, r in tries), len(tries))
        more = wrong["ledger"][0] - wrong["ledger-cut"][0]
        answer = "harm shown" if more >= 6 else "no harm that large" if more <= 2 else "cannot tell"
        print(f"  ledger {wrong['ledger'][0]} of {wrong['ledger'][1]}; ledger-cut {wrong['ledger-cut'][0]} of "
              f"{wrong['ledger-cut'][1]}; {more} more with the note: {answer}")
    print("\nThe Haiku model's share of passes beside the Opus model's with the same text")
    for ceiling, arm in list(CEILINGS.items()) + [("ceiling-types", "types-b")]:
        if ceiling in got and arm in got:
            a = [t["passed"] for ts in got[arm].values() for t in ts]
            c = [t["passed"] for ts in got[ceiling].values() for t in ts]
            print(f"  {arm:10s} {sum(a)} of {len(a)} = {sum(a) / len(a):.2f}; the Opus model {sum(c)} of {len(c)} = "
                  f"{sum(c) / len(c):.2f}; apart by {abs(sum(a) / len(a) - sum(c) / len(c)):.2f}")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="what", required=True)
    one = sub.add_parser("texts")
    one.add_argument("--texts", required=True)
    one.set_defaults(run=texts)
    one = sub.add_parser("setup")
    one.add_argument("arm"), one.add_argument("task"), one.add_argument("n", type=int)
    one.add_argument("--work", required=True), one.add_argument("--texts", required=True)
    one.add_argument("--fresh", action="store_true", help="a fresh reader's request, which is not a try")
    one.set_defaults(run=setup)
    sub.add_parser("waiting").set_defaults(run=reader.waiting)
    one = sub.add_parser("keep")
    one.add_argument("--records", required=True), one.add_argument("--model-starts", required=True)
    one.add_argument("--model-as", required=True)
    one.add_argument("--wait", type=int, default=0), one.add_argument("--need", type=int, default=0)
    one.add_argument("--remove-work", action="store_true")
    one.set_defaults(run=keep)
    one = sub.add_parser("respoil")
    one.add_argument("--records", required=True)
    one.set_defaults(run=respoil)
    one = sub.add_parser("grade")
    one.add_argument("--pristine", required=True), one.add_argument("--runner", required=True)
    one.add_argument("--again", action="store_true")
    one.set_defaults(run=reader.grade)
    one = sub.add_parser("tally")
    one.add_argument("--strict", action="store_true"), one.add_argument("--without-spoiled", action="store_true")
    one.set_defaults(run=tally)
    one = sub.add_parser("check-tasks")
    one.add_argument("--pristine", required=True), one.add_argument("--runner", required=True)
    one.set_defaults(run=reader.check_tasks)
    one = sub.add_parser("compare")
    one.add_argument("--without-spoiled", action="store_true")
    one.set_defaults(run=compare)
    sub.add_parser("simulate").set_defaults(run=reader.simulate)
    args = parser.parse_args()
    args.run(args)


if __name__ == "__main__":
    main()

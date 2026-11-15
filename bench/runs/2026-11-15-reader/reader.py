#!/usr/bin/env python3
"""The reader test: set a try up, keep it, grade it, add the tries up, compare the arms.

    reader.py guides                                  make guides/ from round five's ledgers and marks
    reader.py setup ARM TASK N --work W --pristine P --runner R
    reader.py waiting                                 the tries that are set up and not kept
    reader.py keep --records DIR --model-starts claude-haiku --model-as "a Haiku model" [--wait S] [--need N]
                   --pristine P [--remove-work]
    reader.py grade --pristine P --runner R [--again]
    reader.py check-tasks --pristine P --runner R     each task's reference answer passes and its plain answer fails
    reader.py tally
    reader.py compare
    reader.py simulate

README.md beside this file says what each number is and which rule gives which answer.
"""
import argparse, glob, hashlib, json, os, random, re, shutil, subprocess, sys, tempfile, time, tomllib

HERE = os.path.dirname(os.path.abspath(__file__))
BENCH = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, BENCH)
import keep as bench_keep  # noqa: E402  the bench's reader of a subject's record

TRIES = os.path.join(HERE, "tries")
MAP = os.path.join(os.path.dirname(HERE), "2026-11-14-map-rules", "r5")
LEDGERS = ["opus-1", "opus-2", "opus-3"]
DOC = "docs/lite/architecture/02-camera.md"
LEDGER_FILE = "camera-ledger.toml"

# What each arm adds to the request, before the ask. @BOX@ is the try's directory.
GUIDE = {
    "plain-a": "",
    "plain-b": "",
    "doc": "The library's own notes on its camera code are in the checkout, at @BOX@/babylon-lite/" + DOC
           + ". Read them first.",
    "ledger": "@BOX@/app/" + LEDGER_FILE + " is a ledger of facts about the library's camera code, "
              "written for this release. Its paths start from @BOX@/babylon-lite/packages/babylon-lite. "
              "A row with `run` and `shows` is a search of the code and a sentence about what it finds; a tool has "
              "checked that each search still gives the count its row states. A row with `is` is a note by someone "
              "who read the code, and nothing has checked it. Read the ledger first.",
}
GUIDE["ledger-cut"] = GUIDE["ledger"]
ARMS = ["plain-a", "plain-b", "doc", "ledger", "ledger-cut"]

REQUEST = """I'm working on a small viewer app in @BOX@/app. It uses Babylon Lite, and for various reasons I need the exact version that is checked out at @BOX@/babylon-lite: nothing older or newer can be used. The app's tsconfig and vitest config already point the import "@babylonjs/lite" at that checkout, and the dev dependencies of both are installed.
@GUIDE@
@ASK@

Please keep every change inside @BOX@/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
"""

# The arm `memory`: nothing in hand but the app. It says what the subject knows before it reads anything.
REQUEST_MEMORY = """I'm working on a small viewer app in @BOX@/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

@ASK@

Please keep every change inside @BOX@/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
"""


def tasks():
    return sorted(os.path.basename(d) for d in glob.glob(os.path.join(HERE, "tasks", "*")) if os.path.isdir(d))


def task_file(task, name):
    return os.path.join(HERE, "tasks", task, name)


def answer_file(task):
    """Where a subject's answer to a question task goes, or None for a task that asks for code."""
    path = task_file(task, "answer-file.txt")
    return open(path).read().strip() if os.path.exists(path) else None


def sha(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()[:12]


# ---------------------------------------------------------------------------------------------- guides

def guides(_):
    """Copy round five's three Opus ledgers, and make the same three with every row marked false taken out."""
    for name in LEDGERS:
        text = open(os.path.join(MAP, "ledgers", name + ".toml"), encoding="utf-8").read()
        false = {line.split("\t")[0] for line in open(os.path.join(MAP, "marks", name + ".tsv"), encoding="utf-8")
                 if len(line.split("\t")) > 1 and line.split("\t")[1] == "false"}
        pieces = re.split(r"(?m)^(?=\[\[row\]\])", text)
        kept, cut = [], []
        for piece in pieces:
            found = re.search(r'(?m)^name = "(.*)"\s*$', piece)
            if piece.startswith("[[row]]") and found and found.group(1) in false:
                cut.append(found.group(1))
                # A comment that heads the next group of rows sits at this row's end: keep it.
                tail = re.search(r"(?ms)(\n(?:#[^\n]*\n|\s*\n)+)\Z", piece)
                if tail and "#" in tail.group(1):
                    kept.append(tail.group(1).lstrip("\n"))
            else:
                kept.append(piece)
        assert sorted(cut) == sorted(false), (name, sorted(false - set(cut)))
        for arm, body in (("ledger", text), ("ledger-cut", "".join(kept))):
            os.makedirs(os.path.join(HERE, "guides", arm), exist_ok=True)
            path = os.path.join(HERE, "guides", arm, name + ".toml")
            open(path, "w", encoding="utf-8").write(body)
            rows = tomllib.load(open(path, "rb"))["row"]
            print(f"{arm:10s} {name}: {len(rows)} rows, {sum('is' in r for r in rows)} notes, "
                  f"{len(body.encode())} bytes" + (f", cut: {'; '.join(sorted(cut))}" if arm == "ledger-cut" else ""))


# ----------------------------------------------------------------------------------------------- setup

def box_of(work, arm, task, n):
    return os.path.join(os.path.abspath(work), arm, task, str(n))


def setup(args):
    arm, task, n = args.arm, args.task, args.n
    assert arm in ARMS + ["memory", "ceiling"], arm
    assert task in tasks(), task
    kept = os.path.join(TRIES, arm, task, str(n))
    assert not os.path.exists(kept), f"{kept} is already set up"
    box = box_of(args.work, arm, task, n)
    assert not os.path.exists(box), f"{box} exists"
    os.makedirs(box)
    shutil.copytree(os.path.join(HERE, "scaffold", "app"), os.path.join(box, "app"))
    os.makedirs(os.path.join(box, "app", "src"), exist_ok=True)
    guide = None
    if arm != "memory":
        shutil.copytree(os.path.abspath(args.pristine), os.path.join(box, "babylon-lite"), symlinks=True)
        # One copy of the installed packages for the try, made of hard links, with a link to it from each side.
        subprocess.run(["cp", "-al", os.path.abspath(args.runner), os.path.join(box, "node_modules")], check=True)
        os.symlink("../node_modules", os.path.join(box, "app", "node_modules"))
        os.symlink("../node_modules", os.path.join(box, "babylon-lite", "node_modules"))
    if arm in ("ledger", "ledger-cut"):
        ledger = LEDGERS[(n - 1) % len(LEDGERS)]
        guide = os.path.join(HERE, "guides", arm, ledger + ".toml")
        shutil.copy(guide, os.path.join(box, "app", LEDGER_FILE))
    ask = open(task_file(task, "ask.md"), encoding="utf-8").read().strip()
    form = REQUEST_MEMORY if arm == "memory" else REQUEST
    words = GUIDE.get(arm, "")
    text = form.replace("@GUIDE@", ("\n" + words + "\n") if words else "").replace("@ASK@", ask).replace("@BOX@", box)
    os.makedirs(kept)
    open(os.path.join(kept, "request.md"), "w", encoding="utf-8").write(text)
    kind = "bench-subject-closed" if arm == "memory" else "bench-subject"
    json.dump({"arm": arm, "task": task, "n": n, "box": box, "subject": kind,
               "guide": os.path.relpath(guide, HERE) if guide else (DOC if arm == "doc" else None),
               "guide sha": sha(guide) if guide else None, "ask sha": sha(task_file(task, "ask.md")),
               "set up": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())},
              open(os.path.join(kept, "setup.json"), "w"), indent=1)
    print(os.path.join(kept, "request.md"))


def waiting(_=None, show=True):
    out = {}
    for path in sorted(glob.glob(os.path.join(TRIES, "*", "*", "*", "setup.json"))):
        kept = os.path.dirname(path)
        if not os.path.exists(os.path.join(kept, "record.json")):
            out[open(os.path.join(kept, "request.md"), encoding="utf-8").read().strip()] = kept
    if show:
        for kept in out.values():
            print(os.path.relpath(kept, TRIES))
        print(len(out), "set up and not kept")
    return out


# ------------------------------------------------------------------------------------------------ keep

def record_lines(path):
    """Each call the subject made to a tool: the tool, what it was called with, how much came back."""
    calls, by_id = [], {}
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
            if block.get("type") == "tool_use" and block.get("name") != "SubagentHandback":
                given = block.get("input") or {}
                what = given.get("command") or given.get("file_path") or given.get("pattern") or ""
                extra = {k: given[k] for k in ("path", "glob", "offset", "limit") if k in given}
                call = {"tool": block.get("name"), "what": what, **({"with": extra} if extra else {}), "came back": None}
                by_id[block.get("id")] = call
                calls.append(call)
            if block.get("type") == "tool_result" and block.get("tool_use_id") in by_id:
                body = block.get("content")
                text = body if isinstance(body, str) else "".join(
                    b.get("text") or "" for b in body or [] if isinstance(b, dict))
                by_id[block["tool_use_id"]]["came back"] = len(text)
    return calls


def looked_at(calls):
    """What kinds of thing the subject opened or ran, from the words of its calls."""
    text = "\n".join(str(c["what"]) + " " + json.dumps(c.get("with") or {}) for c in calls)
    return {
        "the makers' camera doc": DOC in text or "02-camera" in text,
        "any of the makers' docs": "/docs/" in text or "docs/lite" in text,
        "the ledger": LEDGER_FILE in text,
        "the makers' unit tests": "tests/lite" in text,
        "the library's source": "packages/babylon-lite/src" in text,
        "ran vitest": bool(re.search(r"\bvitest\b|npm (run )?test", text)),
        "called npm for a package": bool(re.search(r"\bnpm (i|install|view|info|show|add)\b|\bpnpm (add|install|i)\b|"
                                                   r"\byarn add\b|registry\.npmjs", text)),
    }


def keep(args):
    wanted = waiting(show=False)
    sys.path.insert(0, BENCH)
    import claude_code as bench_cc
    deadline = time.time() + args.wait
    while True:
        found = bench_cc.finished(args.records, wanted)
        if len(found) >= min(args.need or len(wanted), len(wanted)) or time.time() >= deadline:
            break
        time.sleep(10)
    kept_now = 0
    for request, path in sorted(found.items(), key=lambda kv: wanted[kv[0]]):
        kept = wanted[request]
        made = json.load(open(os.path.join(kept, "setup.json")))
        box = made["box"]
        messages, report, models, first_in, sent, outside, subject, added = bench_keep.claude_code(path, box)
        if (sent or "").strip() != request:
            print("NOT KEPT, the request differs:", kept)
            continue
        if not all(m.startswith(args.model_starts) for m in models) or not models:
            print("NOT KEPT, the record names", models, ":", kept)
            continue
        if subject and subject.get("type") and subject["type"] != made["subject"]:
            print("NOT KEPT, the subject was a", subject["type"], ":", kept)
            continue
        app = os.path.join(box, "app")
        if os.path.isdir(app):
            shutil.copytree(app, os.path.join(kept, "app"), symlinks=True,
                            ignore=shutil.ignore_patterns("node_modules"), dirs_exist_ok=True)
        changes = "the try had no checkout\n"
        if os.path.isdir(os.path.join(box, "babylon-lite")):
            got = subprocess.run(["diff", "-rq", "-x", "node_modules", os.path.abspath(args.pristine),
                                  os.path.join(box, "babylon-lite")], capture_output=True, text=True)
            changes = got.stdout.replace(os.path.abspath(args.pristine), "PRISTINE").replace(box, "BOX") or "none\n"
        open(os.path.join(kept, "lib-changes.txt"), "w").write(changes)
        beyond = sorted(os.path.relpath(p, box) for p in glob.glob(os.path.join(box, "*"))
                        if os.path.basename(p) not in ("app", "babylon-lite", "node_modules"))
        open(os.path.join(kept, "report.txt"), "w", encoding="utf-8").write((report or "") + "\n")
        calls = record_lines(path)
        json.dump(calls, open(os.path.join(kept, "lines.json"), "w"), indent=0)
        harness = sum(a["characters"] for a in added) * 2728 / 8401
        last = messages[-1] if messages else {"read": 0, "output_tokens": 0}
        json.dump({
            "model": args.model_as, "subject": subject, "messages": len(messages),
            "output tokens": sum(m["output_tokens"] for m in messages),
            "read when it began": first_in,
            "read and written at its end": last["read"] + last["output_tokens"],
            "what the harness added after it began, in tokens": round(harness),
            # What the try cost the subject: everything it read and wrote after the request, less the harness's text.
            "grew by": last["read"] + last["output_tokens"] - (first_in or 0) - round(harness),
            "calls": {t: sum(1 for c in calls if c["tool"] == t) for t in sorted({c["tool"] for c in calls})},
            "looked at": looked_at(calls),
            "signs that it left its directory": outside,
            "left beside app and the checkout": beyond,
            "each message": [{"read": m["read"], "output_tokens": m["output_tokens"], "tools": m["tools"]} for m in messages],
            "record": os.path.basename(path),
        }, open(os.path.join(kept, "record.json"), "w"), indent=1)
        if args.remove_work:
            shutil.rmtree(box, ignore_errors=True)
        kept_now += 1
        print("kept", os.path.relpath(kept, TRIES), "| lib:", changes.strip().splitlines()[0][:80],
              "| outside:", len(outside))
    print(f"{kept_now} kept now; {len(waiting(show=False))} still set up and not kept")


# ----------------------------------------------------------------------------------------------- grade

def same(got, want):
    if isinstance(want, bool):
        if isinstance(got, str):
            got = {"true": True, "false": False}.get(got.strip().lower(), got)
        return got is want
    if isinstance(got, str):
        got = got.strip().lower()
        return got == want or (len(got) > 5 and got[:6] == want[:6])  # "resolved" for "resolves"
    return got == want


def grade_one(kept, args):
    made = json.load(open(os.path.join(kept, "setup.json")))
    task = made["task"]
    where = answer_file(task)
    if where:
        want = json.load(open(task_file(task, "expected.json")))
        path = os.path.join(kept, "app", where)
        try:
            got = json.load(open(path, encoding="utf-8"))
            each = {k: same(got.get(k), v) for k, v in want.items()} if isinstance(got, dict) else {}
            said = json.dumps(got)
        except (OSError, ValueError) as err:
            each, said = {}, f"no answer that parses: {err}"
        result = {"passed": bool(each) and all(each.values()) and len(each) == len(want), "each": each, "answer": said}
        open(os.path.join(kept, "grade.txt"), "w").write(f"answer: {said}\nexpected: {json.dumps(want)}\n")
    else:
        with tempfile.TemporaryDirectory(prefix="grade-") as tmp:
            os.symlink(os.path.abspath(args.pristine), os.path.join(tmp, "babylon-lite"))
            os.symlink(os.path.abspath(args.runner), os.path.join(tmp, "node_modules"))
            app = os.path.join(tmp, "app")
            source = os.path.join(kept, "app")
            shutil.copytree(source if os.path.isdir(source) else os.path.join(HERE, "scaffold", "app"), app)
            # The subject's own tests and config are not run: the app's config is put back as it was handed over.
            for name in ("vitest.config.ts", "tsconfig.json", "package.json"):
                shutil.copy(os.path.join(HERE, "scaffold", "app", name), os.path.join(app, name))
            shutil.rmtree(os.path.join(app, "checks"), ignore_errors=True)
            os.makedirs(os.path.join(app, "checks"))
            shutil.copy(os.path.join(HERE, "checks", "helpers.ts"), os.path.join(app, "checks", "helpers.ts"))
            shutil.copy(task_file(task, "check.test.ts"), os.path.join(app, "checks", task + ".test.ts"))
            os.symlink("../node_modules", os.path.join(app, "node_modules"))
            out = os.path.join(tmp, "out.json")
            env = dict(os.environ, VITE_CONFIG_NATIVE_IGNORE_WARNING="true", CI="")
            ran = subprocess.run(["npx", "vitest", "run", f"checks/{task}.test.ts", "--reporter=default",
                                  "--reporter=json", f"--outputFile.json={out}"],
                                 cwd=app, env=env, capture_output=True, text=True, timeout=600)
            text = (ran.stdout + ran.stderr).replace(tmp, "GRADE")
            try:
                report = json.load(open(out))
                cases = {a["fullName"]: a["status"] for f in report.get("testResults", [])
                         for a in f.get("assertionResults", [])}
                whole = [f.get("message") for f in report.get("testResults", []) if f.get("status") == "failed"
                         and not f.get("assertionResults")]
            except (OSError, ValueError):
                cases, whole = {}, ["the runner wrote no report"]
            result = {"passed": bool(cases) and all(v == "passed" for v in cases.values()) and not any(whole),
                      "each": cases, "could not load": [w[:600] for w in whole if w]}
            open(os.path.join(kept, "grade.txt"), "w").write(text)
    json.dump(result, open(os.path.join(kept, "grade.json"), "w"), indent=1)
    return result


def grade(args):
    for path in sorted(glob.glob(os.path.join(TRIES, "*", "*", "*", "record.json"))):
        kept = os.path.dirname(path)
        if os.path.exists(os.path.join(kept, "grade.json")) and not args.again:
            continue
        result = grade_one(kept, args)
        print("passed" if result["passed"] else "FAILED", os.path.relpath(kept, TRIES),
              "" if result["passed"] else json.dumps(result["each"])[:300])


# ----------------------------------------------------------------------------------------------- tally

def kept_tries():
    """arm -> task -> [ {passed, grew, out, each, looked, n} ] for every kept and graded try."""
    out = {}
    for path in sorted(glob.glob(os.path.join(TRIES, "*", "*", "*", "grade.json"))):
        kept = os.path.dirname(path)
        arm, task, n = kept.split(os.sep)[-3:]
        record = json.load(open(os.path.join(kept, "record.json")))
        result = json.load(open(path))
        whose = os.path.join(kept, "whose.txt")
        out.setdefault(arm, {}).setdefault(task, []).append({
            "n": int(n), "passed": result["passed"], "each": result.get("each") or {}, "grew": record["grew by"],
            "out": record["output tokens"], "looked": record["looked at"], "calls": sum(record["calls"].values()),
            "whose": open(whose).read().split("\n")[0].strip() if os.path.exists(whose) else None})
    return out


def tally(args):
    got = kept_tries()
    arms = [a for a in ["memory", "ceiling"] + ARMS if a in got]
    names = tasks()
    print("passed of tries, by task and arm")
    print("task  " + "".join(f"{a:>12s}" for a in arms))
    for task in names:
        print(f"{task:5s} " + "".join(
            f"{(str(sum(t['passed'] for t in got[a].get(task, []))) + ' of ' + str(len(got[a].get(task, [])))):>12s}"
            for a in arms))
    print("all   " + "".join(
        f"{(str(sum(t['passed'] for ts in got[a].values() for t in ts)) + ' of ' + str(sum(len(ts) for ts in got[a].values()))):>12s}"
        for a in arms))
    print("\nwhat a try grew by, in tokens read and written: the mean of each task's tries")
    print("task  " + "".join(f"{a:>12s}" for a in arms))
    for task in names:
        print(f"{task:5s} " + "".join(
            f"{(round(sum(t['grew'] for t in got[a][task]) / len(got[a][task])) if got[a].get(task) else '-'):>12}"
            for a in arms))
    print("\noutput tokens, all tries: " + "; ".join(
        f"{a} {sum(t['out'] for ts in got[a].values() for t in ts):,}" for a in arms))
    print("\nwhat the subjects opened or ran, in how many tries of each arm")
    things = sorted({k for a in arms for ts in got[a].values() for t in ts for k in t["looked"]})
    for thing in things:
        print(f"  {thing:32s} " + "; ".join(
            f"{a} {sum(t['looked'].get(thing, False) for ts in got[a].values() for t in ts)} of "
            f"{sum(len(ts) for ts in got[a].values())}" for a in arms))
    print("\nthe part of each question task that a ledger's false note speaks to")
    for task, part in (("P1", "pinch"), ("I1", "a")):
        print(f"  {task} {part}: " + "; ".join(
            f"{a} wrong in {sum(not t['each'].get(part, False) for t in got[a].get(task, []))} of "
            f"{len(got[a].get(task, []))}" for a in arms))
    failures = [(a, task, t) for a in arms for task, ts in got[a].items() for t in ts if not t["passed"]]
    sorts = {}
    for _, _, t in failures:
        word = (t["whose"] or "not sorted yet").split(":")[0]
        sorts[word] = sorts.get(word, 0) + 1
    print(f"\nfailures: {len(failures)}; " + "; ".join(f"{k} {v}" for k, v in sorted(sorts.items())))
    if args.strict and sorts.get("not sorted yet"):
        sys.exit("a failure is not sorted")


# --------------------------------------------------------------------------------------------- compare

QUARTER, THIRD, DRAWS = 0.25, 1 / 3, 10000


def interval(values):
    values = sorted(values)
    return values[int(0.025 * len(values))], values[int(0.975 * len(values)) - 1]


def passes_rule(first, second, rng):
    """first, second: task -> list of True/False. The tasks both hold are the units."""
    names = sorted(set(first) & set(second))
    diffs = [sum(first[t]) / len(first[t]) - sum(second[t]) / len(second[t]) for t in names]
    mean = sum(diffs) / len(diffs)
    drawn = []
    for _ in range(DRAWS):
        pick = [diffs[rng.randrange(len(diffs))] for _ in diffs]
        drawn.append(sum(pick) / len(pick))
    low, high = interval(drawn)
    if abs(mean) >= QUARTER and (low > 0 or high < 0):
        answer = "shown: the first passes more" if mean > 0 else "shown: the first passes less"
    elif low > -QUARTER and high < QUARTER:
        answer = "no difference as large as a quarter"
    else:
        answer = "cannot tell"
    return mean, low, high, answer, sum(d > 0 for d in diffs), sum(d < 0 for d in diffs)


def spend_rule(first, second, rng):
    """first, second: task -> list of what each try grew by. The ratio of the sums of the tasks' means."""
    names = sorted(set(first) & set(second))
    a = [sum(first[t]) / len(first[t]) for t in names]
    b = [sum(second[t]) / len(second[t]) for t in names]
    ratio = sum(a) / sum(b)
    drawn = []
    for _ in range(DRAWS):
        pick = [rng.randrange(len(names)) for _ in names]
        drawn.append(sum(a[i] for i in pick) / sum(b[i] for i in pick))
    low, high = interval(drawn)
    if high < 1:
        answer = "shown: the first spends less, by a third or more" if ratio <= 1 - THIRD else \
            "the first spends less, by less than a third"
    elif low > 1:
        answer = "shown: the first spends more, by half or more" if ratio >= 1.5 else \
            "the first spends more, by less than half"
    elif low > 1 - THIRD and high < 1.5:
        answer = "no saving as large as a third, and no cost as large as a half"
    else:
        answer = "cannot tell"
    return ratio, low, high, answer


def compare(_):
    got = kept_tries()
    rng = random.Random(20261115)
    pairs = [("plain-a", "plain-b"), ("doc", "plain-a"), ("doc", "plain-b"), ("ledger", "plain-a"),
             ("ledger", "plain-b"), ("ledger-cut", "plain-a"), ("ledger-cut", "plain-b"), ("ledger", "doc"),
             ("ledger-cut", "ledger")]
    print("The first two rounds are one arm run twice. If a rule tells them apart, nothing it says below counts.")
    print("\nPassing: the mean over tasks of (share of tries passed by the first) less (by the second)")
    for x, y in pairs:
        if x in got and y in got:
            first = {t: [r["passed"] for r in rs] for t, rs in got[x].items()}
            second = {t: [r["passed"] for r in rs] for t, rs in got[y].items()}
            mean, low, high, answer, up, down = passes_rule(first, second, rng)
            print(f"  {x:10s} against {y:10s} {mean:+.2f} ({low:+.2f} to {high:+.2f}); tasks where the first passed "
                  f"more {up}, less {down}: {answer}")
    print("\nSpending: the sum over tasks of what a try grew by in the first, over the same in the second")
    for x, y in pairs:
        if x in got and y in got:
            first = {t: [r["grew"] for r in rs] for t, rs in got[x].items()}
            second = {t: [r["grew"] for r in rs] for t, rs in got[y].items()}
            ratio, low, high, answer = spend_rule(first, second, rng)
            print(f"  {x:10s} against {y:10s} {ratio:.2f} ({low:.2f} to {high:.2f}): {answer}")
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


def simulate(_):
    """Ask each rule for its answer on made-up subjects whose pass rates and costs are chosen."""
    rng = random.Random(1)
    names = [f"T{i}" for i in range(1, 10)]

    def run_pass(rates_first, rates_second, tries=3, times=400):
        count = {}
        for _ in range(times):
            first = {t: [rng.random() < p for _ in range(tries)] for t, p in zip(names, rates_first)}
            second = {t: [rng.random() < p for _ in range(tries)] for t, p in zip(names, rates_second)}
            answer = passes_rule(first, second, random.Random(rng.random()))[3].split(":")[0]
            count[answer] = count.get(answer, 0) + 1
        return "; ".join(f"{k} {round(100 * v / times)}%" for k, v in sorted(count.items()))

    global DRAWS
    DRAWS = 1000
    print("Passing, nine tasks, three tries each in each arm; how often each answer comes in 400 made-up runs")
    for label, a, b in [
        ("both pass every task 9 times in 10", [0.9] * 9, [0.9] * 9),
        ("both pass every task half the time", [0.5] * 9, [0.5] * 9),
        ("both: three tasks never, six always", [0, 0, 0, 1, 1, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1, 1, 1, 1]),
        ("first 0.9, second 0.6, on every task", [0.9] * 9, [0.6] * 9),
        ("first 0.9, second 0.4, on every task", [0.9] * 9, [0.4] * 9),
        ("first 1.0 and second 0.0 on three tasks, both 0.9 on six", [1, 1, 1] + [0.9] * 6, [0, 0, 0] + [0.9] * 6),
        ("first 1.0 and second 0.0 on one task, both 0.9 on eight", [1] + [0.9] * 8, [0] + [0.9] * 8),
    ]:
        print(f"  {label}: {run_pass(a, b)}")

    def run_spend(scale, spread=0.35, tries=3, times=400):
        count = {}
        for _ in range(times):
            base = [rng.lognormvariate(10.3, 0.5) for _ in names]  # a task's own cost, about 30,000 tokens
            first = {t: [m * scale * rng.lognormvariate(0, spread) for _ in range(tries)] for t, m in zip(names, base)}
            second = {t: [m * rng.lognormvariate(0, spread) for _ in range(tries)] for t, m in zip(names, base)}
            answer = spend_rule(first, second, random.Random(rng.random()))[3].split(":")[0]
            count[answer] = count.get(answer, 0) + 1
        return "; ".join(f"{k} {round(100 * v / times)}%" for k, v in sorted(count.items()))

    print("\nSpending, nine tasks, three tries each; a try's cost spreads by about a third around its task's own")
    for label, scale in [("the same cost", 1.0), ("the first costs nine tenths", 0.9), ("the first costs two thirds", 2 / 3),
                         ("the first costs half", 0.5), ("the first costs one and a half times", 1.5)]:
        print(f"  {label}: {run_spend(scale)}")


def check_tasks(args):
    """Grade each task's own reference answer, which must pass, and its plain answer, which must fail."""
    bad = 0
    for task in tasks():
        where = answer_file(task)
        for label, must in (("reference", True), ("plain", False)):
            with tempfile.TemporaryDirectory(prefix="task-") as kept:
                json.dump({"task": task}, open(os.path.join(kept, "setup.json"), "w"))
                if where:
                    want = json.load(open(task_file(task, "expected.json")))
                    if label == "plain":  # the answer with every part turned round
                        want = {k: (not v) if isinstance(v, bool) else ("rejects" if v == "resolves" else "resolves")
                                for k, v in want.items()}
                    os.makedirs(os.path.dirname(os.path.join(kept, "app", where)))
                    json.dump(want, open(os.path.join(kept, "app", where), "w"))
                else:
                    target = os.path.join(kept, "app", open(task_file(task, "file.txt")).read().strip())
                    shutil.copytree(os.path.join(HERE, "scaffold", "app"), os.path.join(kept, "app"))
                    os.makedirs(os.path.dirname(target), exist_ok=True)
                    shutil.copy(task_file(task, label + ".ts"), target)
                result = grade_one(kept, args)
                ok = result["passed"] is must
                bad += not ok
                print("ok   " if ok else "WRONG", task, label, "passed" if result["passed"] else "failed",
                      "" if result["passed"] else json.dumps(result["each"])[:260],
                      (result.get("could not load") or [""])[0][:200])
    sys.exit(1 if bad else 0)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="what", required=True)
    sub.add_parser("guides").set_defaults(run=guides)
    one = sub.add_parser("setup")
    one.add_argument("arm"), one.add_argument("task"), one.add_argument("n", type=int)
    one.add_argument("--work", required=True), one.add_argument("--pristine", required=True)
    one.add_argument("--runner", required=True)
    one.set_defaults(run=setup)
    sub.add_parser("waiting").set_defaults(run=waiting)
    one = sub.add_parser("keep")
    one.add_argument("--records", required=True), one.add_argument("--model-starts", required=True)
    one.add_argument("--model-as", required=True), one.add_argument("--pristine", required=True)
    one.add_argument("--wait", type=int, default=0), one.add_argument("--need", type=int, default=0)
    one.add_argument("--remove-work", action="store_true")
    one.set_defaults(run=keep)
    one = sub.add_parser("grade")
    one.add_argument("--pristine", required=True), one.add_argument("--runner", required=True)
    one.add_argument("--again", action="store_true")
    one.set_defaults(run=grade)
    one = sub.add_parser("tally")
    one.add_argument("--strict", action="store_true")
    one.set_defaults(run=tally)
    one = sub.add_parser("check-tasks")
    one.add_argument("--pristine", required=True), one.add_argument("--runner", required=True)
    one.set_defaults(run=check_tasks)
    sub.add_parser("compare").set_defaults(run=compare)
    sub.add_parser("simulate").set_defaults(run=simulate)
    args = parser.parse_args()
    args.run(args)


if __name__ == "__main__":
    main()

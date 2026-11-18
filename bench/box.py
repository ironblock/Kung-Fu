#!/usr/bin/env python3
"""One run tool for runs where a subject is given a text in a box: a headless `claude -p` subject that
can read and write files and do nothing else.

    box.py declarations --pristine P --out DIR [--no-comments] [--dirs D ...] [--name NAME]
    box.py setup RUN
    box.py launch RUN [--arm A ...] [--task T ...] [--parallel 8] [--timeout 900]
    box.py fake RUN --arm A --with reference|plain [--over]
    box.py forget RUN --arm A [--task T ...] [--n N ...]
    box.py grade RUN [--again] [--parallel 4]
    box.py tally RUN [--strict]
    box.py compare RUN [--with-spoiled]
    box.py simulate RUN
    box.py answers RUN --task T [--arm A]
    box.py check-tasks SET [--window stub|none]
    box.py scan FILE ...

`declarations` cuts the type declarations of the .ts files directly in each of `--dirs`, the library's source
directories under `src` (default `camera`), and joins them in that order into NAME.d.ts, or NAME-bare.d.ts with
--no-comments (default NAME `declarations`). With one directory each file is headed `// <file>`, as the
text-only run's were; with more than one, `// <dir>/<file>`.

RUN is a run's directory. It holds `run.json`, the request form and its own texts. Each try is kept in
`RUN/tries/<arm>/<task>/<n>/`. The machine's paths come from options or from `bench/box.local.json`,
which git ignores: {"pristine": P, "runner": R, "boxes": "/home/dev", "raw": "/home/raw", "texts": T}.

run.json:

    {
      "set": "../../sets/camera",            the task set: a directory, from RUN or absolute
      "tasks": ["K1", "P1"],                 optional; all of the set's tasks when left out
      "request": "request.md",               the request form in RUN, with @BOX@, @GUIDE@ and @ASK@
      "window": "stub",                      "stub" or "none": a stand-in `window` in the grader
      "texts": {
        "bare": {"path": "/abs/outside/bare.d.ts", "sha256": "...", "bytes": 14002,
                 "made": "box.py declarations --no-comments, tsc 6.0.3"},
        "note": {"file": "note.md", "sha256": "..."}   a file in RUN; every text needs its sha256
      },                                     a `path` not from the root is taken from box.local.json's "texts"
      "arms": {
        "none": {"model": "haiku", "effort": "medium", "files": {}, "guide": "", "tries": 3},
        "bare": {"model": "haiku", "effort": "medium", "files": {"camera-api.d.ts": "bare"},
                 "guide": "What I do have is ... in @BOX@/app/camera-api.d.ts.", "tries": 3},
        "rota": {"model": "haiku", "effort": "medium", "files": {"ledger.toml": ["l1", "l2", "l3"]},
                 "guide": "...", "tries": 3}  try n takes entry (n-1) mod 3
      },
      "twice": ["none", "none-b"],           optional: one arm run twice, compared first
      "pairs": [["bare", "none"]],           the pairs the rule is asked about, in this order
      "matters": 0.25                        the difference in share passed that matters
    }

The guide paragraph replaces @GUIDE@. An empty one takes @GUIDE@ out with the blank line after it.
An arm whose "model" is "small" needs no "effort": bench/small.py sends it one message and takes one reply,
and `launch` here leaves it alone. A try small.py did not send because it was over a context limit holds
did-not-fit.json, and `tally` counts it. `tally` also counts an arm's kept tries that small.py marked as cut off
by their length limit, and those whose output tokens are an estimate, when there are any. A try cut off is not
an answer. `tally` leaves it out of its table of passes and says how many it left out; `compare` counts it as a
failure of its task. Its tokens and cost still count in its arm's line. An arm with more tries cut off is not thereby
better: its count stands beside its passes, and `small.py launch --again-cut-off` sends those tries again.
A try cut off is a failure of its own kind: its whose.txt begins "too long:". `tally` lists it with the failures,
and `tally --strict` stops if a try cut off is sorted any other way, or a try not cut off is sorted "too long".
bench/README.md, under "Runs with headless subjects", says how a run goes and what each kept file is.
"""
import argparse
import concurrent.futures
import glob
import hashlib
import json
import math
import os
import random
import re
import secrets
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time

BENCH = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(BENCH)
LOCAL = os.path.join(BENCH, "box.local.json")
PRINT = threading.RLock()

SYSTEM = ("You are given one task in one message. The message is the whole task. "
          "Do what it asks, in the form it asks for.")
MODEL_WORDS = {"haiku": "a Haiku model", "sonnet": "a Sonnet model", "opus": "an Opus model"}
# The sha256 of the two declaration texts as the text-only run's README records them.
KNOWN = {False: "8187adf9d7f9ceaaea78a84ee9b03479f0e254649336fc3540104d29c647e784",
         True: "6eb658f9f54043ed0726418845981ef05caa42032069734dc269584c84aa30a6"}
# An arm whose model is "small" is sent one message and gives one reply, by bench/small.py. box.py sets it up
# and grades, tallies and compares it, but never launches it.
ONE_SHOT = "small"
DID_NOT_FIT = "did-not-fit.json"  # small.py writes it beside setup.json for a message over its context limit
TOO_LONG = "too long"  # the sort of a try cut off by its length limit; see tally
KEPT_FILES = ("report.txt", "record.json", "steps.json", "grade.json", "grade.txt", "whose.txt")


def say(*words):
    with PRINT:
        print(*words, flush=True)


def bytes_of(path):
    with open(path, "rb") as f:
        return f.read()


def text_of(path):
    with open(path, encoding="utf-8", errors="replace") as f:
        return f.read()


def json_of(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def write_text(path, text):
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def write_json(path, value):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(value, f, indent=1)


def sha256(path):
    return hashlib.sha256(bytes_of(path)).hexdigest()


def local():
    try:
        return json_of(LOCAL)
    except (OSError, ValueError):
        return {}


def option(args, name, default=None):
    value = getattr(args, name, None) or local().get(name) or default
    if value is None:
        sys.exit(f"box.py: give --{name}, or put \"{name}\" in {LOCAL}")
    return os.path.abspath(value)


def runner_modules(args):
    runner = option(args, "runner")
    return os.path.join(runner, "node_modules") if os.path.isdir(os.path.join(runner, "node_modules")) else runner


# ------------------------------------------------------------------------------------------- the config

class Run:
    def __init__(self, path):
        self.dir = os.path.abspath(path)
        self.name = os.path.basename(self.dir.rstrip("/"))
        self.cfg = json_of(os.path.join(self.dir, "run.json"))
        self.set = os.path.normpath(os.path.join(self.dir, self.cfg["set"])) if "set" in self.cfg else None
        self.tries = os.path.join(self.dir, "tries")
        self.arms = self.cfg.get("arms", {})
        assert "tries" not in self.arms, "an arm may not be called `tries`"
        self.texts = self.cfg.get("texts", {})
        self.window = self.cfg.get("window", "stub")
        assert self.window in ("stub", "none"), self.window
        self.matters = float(self.cfg.get("matters", 0.25))

    def tasks(self):
        have = set_tasks(self.set)
        wanted = self.cfg.get("tasks") or have
        missing = [t for t in wanted if t not in have]
        assert not missing, f"the set has no task {missing}"
        return list(wanted)

    def text_path(self, name):
        """Where a text is. A `path` that does not start at the root is taken from the directory that
        box.local.json names as "texts", so that a run's config holds no machine's own path."""
        text = self.texts[name]
        if "path" not in text:
            return os.path.join(self.dir, text["file"])
        if os.path.isabs(text["path"]):
            return text["path"]
        texts = local().get("texts")
        if not texts:
            sys.exit(f"box.py: the text `{name}` is given as `{text['path']}`; put \"texts\", the directory "
                     f"that holds it, in {LOCAL}")
        return os.path.join(os.path.abspath(texts), text["path"])

    def files_of(self, arm, n):
        """file name in `app` -> text name, for try n of the arm."""
        out = {}
        for where, which in (self.arms[arm].get("files") or {}).items():
            out[where] = which[(n - 1) % len(which)] if isinstance(which, list) else which
        return out

    def try_dir(self, arm, task, n):
        return os.path.join(self.tries, arm, task, str(n))

    def raw_dir(self, args, arm, task, n):
        return os.path.join(option(args, "raw", "/home/raw"), self.name, arm, task, str(n))

    def all_tries(self):
        return sorted(os.path.dirname(p) for p in glob.glob(os.path.join(self.tries, "*", "*", "*", "setup.json")))


def set_tasks(path):
    return sorted(os.path.basename(d) for d in glob.glob(os.path.join(path, "tasks", "*")) if os.path.isdir(d))


def task_file(set_dir, task, name):
    return os.path.join(set_dir, "tasks", task, name)


def answer_file(set_dir, task):
    path = task_file(set_dir, task, "answer-file.txt")
    return text_of(path).strip() if os.path.exists(path) else None


def check_texts(run):
    """Every text in run.json, and every text an arm names, is there and has its sha256 and size.
    Returns the faults."""
    bad = []
    used = {t for arm in run.arms for n in range(1, int(run.arms[arm].get("tries", 1)) + 1)
            for t in run.files_of(arm, n).values()}
    for name in sorted(used | set(run.texts)):
        if name not in run.texts:
            bad.append(f"{name}: no such text in run.json")
            continue
        text, path = run.texts[name], run.text_path(name)
        if not os.path.isfile(path):
            bad.append(f"{name}: {path} is not there")
            continue
        if "path" in text:
            if os.path.abspath(path).startswith(REPO + os.sep):
                bad.append(f"{name}: a text given by `path` must be outside the repository")
            if not text.get("made"):
                bad.append(f"{name}: no line saying how it was made")
        if not text.get("sha256"):
            bad.append(f"{name}: run.json gives no sha256")
        elif sha256(path) != text["sha256"]:
            bad.append(f"{name}: sha256 {sha256(path)[:12]} is not the {str(text.get('sha256'))[:12]} run.json gives")
        if text.get("bytes") is not None and os.path.getsize(path) != text["bytes"]:
            bad.append(f"{name}: {os.path.getsize(path)} bytes, run.json says {text['bytes']}")
    return bad


# ------------------------------------------------------------------------------------------ declarations

def declarations(args):
    """Cut the type declarations of the library's source directories from the pristine checkout, as the
    text-only run did for `camera`. Each directory gives the .ts files directly in it. One directory gives
    each file under its own name, as before; more than one give each file under `dir/name`."""
    package = os.path.join(option(args, "pristine"), "packages", "babylon-lite")
    tsc = os.path.join(runner_modules(args), ".bin", "tsc")
    version = subprocess.run([tsc, "--version"], capture_output=True, text=True, check=False).stdout.strip()
    out = os.path.abspath(args.out)
    assert not out.startswith(REPO + os.sep), "the declarations are the makers': write them outside the repository"
    dirs = args.dirs or ["camera"]
    assert len(set(dirs)) == len(dirs), "a directory is named twice"
    for d in dirs:
        assert re.fullmatch(r"[\w.-]+(/[\w.-]+)*", d) and ".." not in d.split("/"), f"not a source directory: {d}"
        assert os.path.isdir(os.path.join(package, "src", d)), f"src/{d} is not in the pristine checkout"
    os.makedirs(out, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="decl-") as tmp:
        command = [tsc, "--ignoreConfig", "--declaration", "--emitDeclarationOnly", "--noCheck", "--skipLibCheck",
                   "--target", "ES2022", "--module", "ESNext", "--moduleResolution", "Bundler", "--rootDir", "src",
                   "--outDir", tmp] + (["--removeComments"] if args.no_comments else []) + \
            sorted(f for d in dirs for f in glob.glob(os.path.join(package, "src", d, "*.ts")))
        ran = subprocess.run(command, cwd=package, capture_output=True, text=True, check=False)
        if ran.returncode:
            sys.exit("tsc failed: " + (ran.stdout + ran.stderr)[-600:])
        names = []
        for d in dirs:
            here = os.path.join(tmp, d)
            names += [(d, n) for n in sorted(os.listdir(here), key=lambda s: s.encode())
                      if os.path.isfile(os.path.join(here, n))]
        label = (lambda d, n: n) if len(dirs) == 1 else (lambda d, n: d + "/" + n)
        body = b"".join(b"// " + label(d, n).encode() + b"\n" + bytes_of(os.path.join(tmp, d, n)) for d, n in names)
    path = os.path.join(out, args.name + ("-bare.d.ts" if args.no_comments else ".d.ts"))
    with open(path, "wb") as f:
        f.write(body)
    got = hashlib.sha256(body).hexdigest()
    print(f"{path}: {' '.join(dirs)}: {len(names)} files, {len(body)} bytes, sha256 {got}, {version}")
    if dirs != ["camera"]:
        return
    if got == KNOWN[args.no_comments]:
        print("the same sha256 as the text-only run's README records")
    else:
        print(f"NOT the sha256 the text-only run's README records ({KNOWN[args.no_comments]})")


# ------------------------------------------------------------------------------------------------ setup

class TextChanged(Exception):
    pass


def make_box(run, arm, task, n, box, handed_at_setup=None):
    """Make the box new. With `handed_at_setup` (setup.json's files), a text whose sha256 is no longer the one
    handed over at setup stops it, before anything is removed."""
    for was in handed_at_setup or []:
        source = run.text_path(was["text"])
        now = sha256(source) if os.path.isfile(source) else "missing"
        if now != was["sha256"]:
            raise TextChanged(f"text {was['text']} is now {now[:12]}, at setup it was {was['sha256'][:12]}")
    if os.path.exists(box):
        shutil.rmtree(box)
    os.makedirs(box)
    shutil.copytree(os.path.join(run.set, "app"), os.path.join(box, "app"))
    os.makedirs(os.path.join(box, "app", "src"), exist_ok=True)
    handed = []
    for where, name in sorted(run.files_of(arm, n).items()):
        source, target = run.text_path(name), os.path.join(box, "app", where)
        os.makedirs(os.path.dirname(target), exist_ok=True)
        shutil.copy(source, target)
        handed.append({"in app as": where, "text": name, "sha256": sha256(source), "bytes": os.path.getsize(source)})
    return handed


def request_of(run, arm, task, box):
    form = text_of(os.path.join(run.dir, run.cfg.get("request", "request.md")))
    guide = (run.arms[arm].get("guide") or "").strip()
    form = form.replace("@GUIDE@", guide) if guide else re.sub(r"@GUIDE@\n?\n?", "", form)
    ask = text_of(task_file(run.set, task, "ask.md")).strip()
    return form.replace("@ASK@", ask).replace("@BOX@", box).rstrip("\n") + "\n"


def command_of(arm_cfg):
    """The launch command, with the request left out."""
    return ["claude", "-p", "@REQUEST@", "--system-prompt", SYSTEM,
            "--settings", '{"attribution":{"commit":"","pr":""}}', "--setting-sources", "", "--strict-mcp-config",
            "--model", arm_cfg["model"], "--effort", arm_cfg["effort"], "--tools", "Read", "Write",
            "--permission-mode", "acceptEdits", "--output-format", "stream-json", "--verbose",
            "--no-session-persistence"]


def setup(args):
    run = Run(args.run)
    bad = check_texts(run)
    if bad:
        sys.exit("box.py: nothing was set up, a text does not match:\n  " + "\n  ".join(bad))
    boxes = option(args, "boxes", "/home/dev")
    assert not boxes.startswith(REPO + os.sep), "the boxes must be outside the repository"
    made, noted = 0, set()
    for arm, cfg in run.arms.items():
        assert cfg.get("model") in MODEL_WORDS or cfg.get("model") == ONE_SHOT, \
            f"{arm}: model must be one of {list(MODEL_WORDS) + [ONE_SHOT]}"
        for task in run.tasks():
            for n in range(1, int(cfg.get("tries", 1)) + 1):
                kept = run.try_dir(arm, task, n)
                if os.path.exists(os.path.join(kept, "setup.json")):
                    continue
                while True:
                    box = os.path.join(boxes, secrets.token_hex(3))
                    if not os.path.exists(box):
                        break
                handed = make_box(run, arm, task, n, box)
                request = request_of(run, arm, task, box)
                # A task id, or an arm's name that is not a plain word, must not reach the subject through the
                # form. An arm called by a plain word ("none") is only noted: the word is common in English.
                mine = (run.arms[arm].get("guide") or "") + text_of(task_file(run.set, task, "ask.md"))
                hits = [t for t in set_tasks(run.set) + list(run.arms)
                        if re.search(r"(?<![\w-])" + re.escape(t) + r"(?![\w-])", request) and t not in mine]
                named = [t for t in hits if t not in run.arms or not re.fullmatch(r"[a-z]+", t)]
                if named:
                    shutil.rmtree(box)
                    sys.exit(f"box.py: the request for {arm}/{task}/{n} would name {named}. Stopped.")
                for word in sorted(set(hits) - set(named) - noted):
                    noted.add(word)
                    print(f"note: the request holds the word {word!r}, which is also an arm's name")
                one_shot = cfg["model"] == ONE_SHOT
                setup_json = {"arm": arm, "task": task, "n": n, "box": box, "model": cfg["model"],
                              "effort": cfg.get("effort") if one_shot else cfg["effort"], "files": handed,
                              "command": "small.py launch: one message, one reply" if one_shot else command_of(cfg),
                              "ask sha256": sha256(task_file(run.set, task, "ask.md")),
                              "set up": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                              "launches": 0, "relaunches": 0, "did not run": [], "forgotten": []}
                found = [f"{name} holds {', '.join(f)}" for name, f in (
                    ("request.md", private_in(request)), ("setup.json", private_in(json.dumps(setup_json))))
                    if f]
                if found:
                    shutil.rmtree(box)
                    sys.exit(f"box.py: privacy: for {arm}/{task}/{n}, {'; '.join(found)}. Nothing written. Stopped.")
                os.makedirs(kept, exist_ok=True)
                write_text(os.path.join(kept, "request.md"), request)
                write_json(os.path.join(kept, "setup.json"), setup_json)
                made += 1
    print(f"{made} tries set up now; {len(run.all_tries())} set up in all")


# ------------------------------------------------------------------------------------------------- privacy

SECRETS = ("CLAUDE_CODE_USER_EMAIL", "CLAUDE_CODE_ACCOUNT_UUID", "CLAUDE_CODE_ORGANIZATION_UUID",
           "CLAUDE_CODE_SESSION_ID", "CLAUDE_CODE_REMOTE_SESSION_ID")
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}")
MODEL_ID = re.compile(r"claude-(?:[\w.]+-)*?(?:haiku|sonnet|opus|fable)", re.IGNORECASE)


def private_in(text):
    """What in the text must not go into the repository: a list of kinds, never the value itself."""
    found = []
    for name in SECRETS:
        value = os.environ.get(name) or ""
        if len(value) >= 4 and value in text:
            found.append(f"the value of {name}")
    if "claude.ai/code/" + "session_" in text:  # split, so this file does not hold what it looks for
        found.append("a session link")
    if any(m.group(0).lower() != "noreply@anthropic.com" for m in EMAIL.finditer(text)):
        found.append("an email address")
    if MODEL_ID.search(text):
        found.append("a model identifier")
    return found


def scan_tree(root):
    """(path relative to root, what it holds) for each file that holds something private."""
    out = []
    for folder, _, files in os.walk(root):
        for name in files:
            path = os.path.join(folder, name)
            if os.path.islink(path):
                continue
            text = text_of(path)
            found = private_in(text)
            if found:
                out.append((os.path.relpath(path, root), found))
    return out


def scan(args):
    bad = 0
    for path in args.files:
        found = private_in(text_of(path))
        bad += bool(found)
        print(f"{'STOP' if found else 'ok  '} {path}" + (": " + "; ".join(found) if found else ""))
    sys.exit(1 if bad else 0)


# ------------------------------------------------------------------------------------------- the stream

def events(path):
    with open(path, encoding="utf-8", errors="replace") as f:
        for raw in f:
            try:
                entry = json.loads(raw)
            except ValueError:
                continue
            if isinstance(entry, dict):
                yield entry


def cut(text, n):
    text = text if isinstance(text, str) else json.dumps(text)
    return text[:n]


def result_text(block):
    body = block.get("content")
    if isinstance(body, str):
        return body
    return "".join(b.get("text") or "" for b in body or [] if isinstance(b, dict))


def model_words(model):
    for key, words in MODEL_WORDS.items():
        if key in (model or "").lower():
            return words
    return "a model the tool does not know"


def inside(path, root):
    return path == root or path.startswith(root + os.sep)


PATH_KEYS = ("file_path", "path", "notebook_path")


def where_it_points(box, value):
    """The path a tool would open: `~` is the home directory, as the Read and Write tools take it."""
    return os.path.normpath(os.path.join(box, os.path.expanduser(value)))


def read_stream(path, box):
    """(steps, record, the result event) from a subject's raw stream.

    One message of the model can come as several events, with tool results between them. Each run of events
    with no result between them is one step, in the order of the stream; the steps of one message share its
    number. The tokens of a step are what the request held when the message began (input, cache write, cache
    read). The stream gives no message's own output tokens: each event of a message carries the same early
    count. Only the result event's sum of output tokens is kept, in record.json."""
    steps, messages, by_id, models = [], {}, {}, []
    result, empty_thinking = None, 0
    detectors = {"read outside the box": [], "named a path outside the box": [], "wrote outside app": []}
    for entry in events(path):
        kind = entry.get("type")
        if kind == "result":
            result = entry
            continue
        if kind not in ("assistant", "user"):
            continue  # no system events, no init event, no telemetry
        message = entry.get("message") or {}
        content = message.get("content")
        if kind == "assistant":
            if message.get("model"):
                models.append(message["model"])
            mid = message.get("id") or f"m{len(messages)}"
            if mid not in messages:
                usage = message.get("usage") or {}
                messages[mid] = {"input": usage.get("input_tokens", 0),
                                 "cache write": usage.get("cache_creation_input_tokens", 0),
                                 "cache read": usage.get("cache_read_input_tokens", 0)}
            if not (steps and steps[-1].get("id") == mid):
                steps.append({"id": mid, "message": list(messages).index(mid) + 1, "text": [], "reasoning": [],
                              "calls": [], "tokens when it began": messages[mid]})
            step = steps[-1]
            for block in content if isinstance(content, list) else []:
                if not isinstance(block, dict):
                    continue
                if block.get("type") == "text":
                    step["text"].append(block.get("text") or "")
                elif block.get("type") == "redacted_thinking":
                    step["reasoning"].append("(redacted)")
                elif block.get("type") == "thinking":
                    if block.get("thinking"):
                        step["reasoning"].append(block["thinking"])
                    else:
                        empty_thinking += 1
                elif block.get("type") == "tool_use":
                    given = dict(block.get("input") or {})
                    if isinstance(given.get("content"), str):
                        body = given["content"].encode()
                        given["content"] = {"first 200 bytes": body[:200].decode("utf-8", "replace"),
                                            "bytes": len(body), "sha256": hashlib.sha256(body).hexdigest()}
                    call = {"tool": block.get("name"), "input": given}
                    step["calls"].append(call)
                    by_id[block.get("id")] = (call, block)
                    for key in PATH_KEYS:
                        value = (block.get("input") or {}).get(key)
                        if isinstance(value, str) and value:
                            target = where_it_points(box, value)
                            if not inside(target, box):
                                detectors["named a path outside the box"].append(f"{block.get('name')} {target}")
                            if block.get("name") == "Write" and not inside(target, os.path.join(box, "app")):
                                detectors["wrote outside app"].append(target)
        else:
            for block in content if isinstance(content, list) else []:
                if isinstance(block, dict) and block.get("type") == "tool_result":
                    text = result_text(block)
                    got = {"result of": block.get("tool_use_id") in by_id and by_id[block["tool_use_id"]][0]["tool"],
                           "error": bool(block.get("is_error")), "length": len(text), "first 300 bytes":
                               text.encode()[:300].decode("utf-8", "replace")}
                    steps.append({"tool result": got})
                    if block.get("tool_use_id") in by_id:
                        call, use = by_id[block["tool_use_id"]]
                        target = (use.get("input") or {}).get("file_path")
                        if call["tool"] == "Read" and isinstance(target, str) and not block.get("is_error"):
                            target = where_it_points(box, target)
                            if not inside(target, box):
                                detectors["read outside the box"].append(target)
    for step in steps:
        step.pop("id", None)
    first = next(iter(messages.values()), {})
    usage = (result or {}).get("usage") or {}
    record = {
        "model": model_words(models[0] if models else ""),
        "turns": (result or {}).get("num_turns"),
        "messages": len(messages),
        "tokens": {"input": usage.get("input_tokens", sum(m["input"] for m in messages.values())),
                   "cache write": usage.get("cache_creation_input_tokens",
                                            sum(m["cache write"] for m in messages.values())),
                   "cache read": usage.get("cache_read_input_tokens",
                                           sum(m["cache read"] for m in messages.values())),
                   "output": usage.get("output_tokens"),
                   "of the output, thinking": (usage.get("output_tokens_details") or {}).get("thinking_tokens"),
                   "first request": sum(first.get(k, 0) for k in ("input", "cache write", "cache read"))},
        "cost in dollars, as the stream reports it": (result or {}).get("total_cost_usd"),
        "seconds": round(((result or {}).get("duration_ms") or 0) / 1000, 1),
        "reasoning text in the stream": any(s.get("reasoning") for s in steps),
        "thinking blocks with no text": empty_thinking,
        "one model": len(set(models)) <= 1,
        "detectors": detectors,
        "spoiled": bool(detectors["read outside the box"]),
    }
    return steps, record, result


# -------------------------------------------------------------------------------------------------- keep

def keep_try(run, kept, steps, record, report):
    """Copy the box's app and write the kept files, after the privacy check passes on every one of them."""
    made = json_of(os.path.join(kept, "setup.json"))
    box = made["box"]
    with tempfile.TemporaryDirectory(prefix="keep-") as stage:
        app = os.path.join(box, "app")
        if os.path.isdir(app):
            shutil.copytree(app, os.path.join(stage, "app"), symlinks=True,
                            ignore=shutil.ignore_patterns("node_modules"))
        states = {}
        for handed in made["files"]:
            there = os.path.join(stage, "app", handed["in app as"])
            state = "gone" if not os.path.exists(there) else \
                "as handed over" if sha256(there) == handed["sha256"] else "changed"
            states[handed["in app as"]] = state
            if state == "as handed over":
                os.remove(there)  # the text is kept by its sha256, not by its words
        record["texts when the subject finished"] = states
        record["relaunches"] = made.get("relaunches", 0)
        write_text(os.path.join(stage, "report.txt"), (report or "").rstrip("\n") + "\n")
        write_json(os.path.join(stage, "record.json"), record)
        write_json(os.path.join(stage, "steps.json"), steps)
        found = scan_tree(stage)
        if found:
            return "privacy: " + "; ".join(f"{p} holds {', '.join(f)}" for p, f in found)
        for name in ("app",) + KEPT_FILES:
            target = os.path.join(kept, name)
            if os.path.isdir(target):
                shutil.rmtree(target)
            elif os.path.exists(target):
                os.remove(target)
        for name in os.listdir(stage):
            shutil.move(os.path.join(stage, name), os.path.join(kept, name))
    return None


def not_run(kept, reason):
    """A try that did not run: write the reason down. Its box is made again when it is launched again."""
    made = json_of(os.path.join(kept, "setup.json"))
    made["did not run"].append({"at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "reason": reason})
    write_json(os.path.join(kept, "setup.json"), made)


def is_kept(kept):
    return os.path.exists(os.path.join(kept, "record.json"))


# The subjects running now. When the launcher is stopped it stops them too, so that none goes on writing into
# a box after the launcher has gone.
RUNNING, STOPPING = set(), threading.Event()


def stop_all(signum, _frame):
    STOPPING.set()
    with PRINT:
        for process in list(RUNNING):
            process.kill()
    raise SystemExit(f"box.py: stopped by signal {signum}; the subjects it had started were stopped too")


def launch_one(run, args, kept):
    made = json_of(os.path.join(kept, "setup.json"))
    arm, task, n, box = made["arm"], made["task"], made["n"], made["box"]
    where = f"{arm}/{task}/{n}"
    raw = run.raw_dir(args, arm, task, n)
    os.makedirs(raw, exist_ok=True)
    before = made.get("launches", len(made["did not run"]))
    if before:
        # A launch before this one ended without a kept try. One whose launcher was stopped left no reason.
        if before > len(made["did not run"]) + len(made.get("forgotten", [])):
            made["did not run"].append({"at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                                        "reason": "the launcher was stopped before the subject ended"})
        try:
            make_box(run, arm, task, n, box, made["files"])
        except TextChanged as err:
            write_json(os.path.join(kept, "setup.json"), made)
            say(f"not launched {where}: {err}")
            return False
        for name in ("record.jsonl", "stderr.txt"):  # the earlier launch's stream is kept beside the new one
            if os.path.exists(os.path.join(raw, name)):
                os.replace(os.path.join(raw, name), os.path.join(raw, f"launch{before}-{name}"))
    made["launches"], made["relaunches"] = before + 1, before
    write_json(os.path.join(kept, "setup.json"), made)
    request = text_of(os.path.join(kept, "request.md")).rstrip("\n")
    command = [request if w == "@REQUEST@" else w for w in made["command"]]
    env = {k: v for k, v in os.environ.items() if k != "CLAUDE_CODE_USER_EMAIL"}
    start = time.time()
    reason = None
    with open(os.path.join(raw, "record.jsonl"), "w") as out, open(os.path.join(raw, "stderr.txt"), "w") as err:
        with PRINT:
            if STOPPING.is_set():
                return False
            process = subprocess.Popen(command, cwd=box, env=env, stdin=subprocess.DEVNULL, stdout=out, stderr=err)
            RUNNING.add(process)
        try:
            code = process.wait(timeout=args.timeout)
            if code:
                reason = f"the process ended with {code}"
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
            reason = f"timed out after {args.timeout} s"
        finally:
            RUNNING.discard(process)
    if STOPPING.is_set():
        return False  # the next launch writes the reason down
    steps, record, result = read_stream(os.path.join(raw, "record.jsonl"), box)
    if not reason and (not result or result.get("subtype") != "success" or result.get("is_error")):
        reason = "no result event of subtype success" + (f" (it was {result.get('subtype')})" if result else "")
    if reason:
        not_run(kept, reason)
        say(f"did not run {where}: {reason}")
        return False
    if not record.get("one model"):
        reason = "the stream names more than one model"
    record["wall seconds"] = round(time.time() - start, 1)
    record["played by hand"] = False
    fault = reason or keep_try(run, kept, steps, record, result.get("result"))
    if fault:
        not_run(kept, fault)
        say(f"did not run {where}: NOTHING KEPT, {fault}")
        return False
    d = record["detectors"]
    say(f"kept {where}: {record['seconds']} s, {record['turns']} turns, "
        f"first request {record['tokens']['first request']} tokens, output {record['tokens']['output']}"
        + (f", relaunch {record['relaunches']}" if record["relaunches"] else "")
        + (", SPOILED" if record["spoiled"] else "")
        + (f", named outside {len(d['named a path outside the box'])}" if d["named a path outside the box"] else "")
        + (f", wrote outside app {len(d['wrote outside app'])}" if d["wrote outside app"] else ""))
    return True


def launch(args):
    run = Run(args.run)
    todo = []
    for kept in run.all_tries():
        made = json_of(os.path.join(kept, "setup.json"))
        if is_kept(kept) or (args.arm and made["arm"] not in args.arm) or \
                (args.task and made["task"] not in args.task):
            continue
        if made["model"] == ONE_SHOT:
            say(f"not launched {made['arm']}/{made['task']}/{made['n']}: its model is {ONE_SHOT!r}; small.py launches it")
            continue
        todo.append(kept)
    say(f"launching {len(todo)} tries, at most {args.parallel} at once")
    signal.signal(signal.SIGTERM, stop_all)
    signal.signal(signal.SIGINT, stop_all)
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.parallel) as pool:
        done = list(pool.map(lambda k: launch_one(run, args, k), todo))
    say(f"{sum(done)} kept, {len(done) - sum(done)} did not run")


def fake(args):
    """Play the subject by hand: copy the task's reference or plain answer into the box, then keep it."""
    run = Run(args.run)
    played = 0
    for kept in run.all_tries():
        made = json_of(os.path.join(kept, "setup.json"))
        if made["arm"] != args.arm:
            continue
        if is_kept(kept):
            record = json_of(os.path.join(kept, "record.json"))
            if not args.over:
                continue
            if not record.get("played by hand"):
                sys.exit(f"box.py: {kept} holds a subject's try; fake never writes over one")
        task, box = made["task"], made["box"]
        try:
            make_box(run, made["arm"], task, made["n"], box, made["files"])
        except TextChanged as err:
            sys.exit(f"box.py: nothing played for {kept}: {err}")
        where = answer_file(run.set, task)
        if where:
            want = json_of(task_file(run.set, task, "expected.json"))
            if args.with_ == "plain":
                want = turned_round(want)
            os.makedirs(os.path.dirname(os.path.join(box, "app", where)), exist_ok=True)
            write_text(os.path.join(box, "app", where), json.dumps(want))
        else:
            source = task_file(run.set, task, args.with_ + ".ts")
            if not os.path.exists(source):
                continue
            target = os.path.join(box, "app", text_of(task_file(run.set, task, "file.txt")).strip())
            os.makedirs(os.path.dirname(target), exist_ok=True)
            shutil.copy(source, target)
        record = {"played by hand": args.with_, "model": "nobody: played by hand", "spoiled": False,
                  "detectors": {"read outside the box": [], "named a path outside the box": [],
                                "wrote outside app": []},
                  "tokens": {"input": 0, "cache write": 0, "cache read": 0, "output": 0, "first request": 0},
                  "cost in dollars, as the stream reports it": 0, "seconds": 0, "turns": 0}
        fault = keep_try(run, kept, [], record, f"played by hand with the {args.with_} answer")
        for name in ("grade.json", "grade.txt"):
            if os.path.exists(os.path.join(kept, name)):
                os.remove(os.path.join(kept, name))
        if fault:
            sys.exit(f"box.py: nothing kept for {kept}: {fault}")
        played += 1
    print(f"{played} tries of {args.arm} played by hand with the {args.with_} answer; "
          "they are never counted as a subject's")


def forget(args):
    """Remove the kept results of some tries, keep their request and setup, and make their boxes again.
    setup.json lists each time; the next launch of the try counts as a relaunch."""
    run = Run(args.run)
    gone = 0
    for kept in run.all_tries():
        made = json_of(os.path.join(kept, "setup.json"))
        if made["arm"] != args.arm or (args.task and made["task"] not in args.task) or \
                (args.n and made["n"] not in args.n):
            continue
        try:
            make_box(run, made["arm"], made["task"], made["n"], made["box"], made["files"])
        except TextChanged as err:
            sys.exit(f"box.py: {kept} not forgotten: {err}")
        was_kept = is_kept(kept)
        for name in ("app",) + KEPT_FILES:
            target = os.path.join(kept, name)
            if os.path.isdir(target):
                shutil.rmtree(target)
            elif os.path.exists(target):
                os.remove(target)
        if was_kept and made.get("launches", 0):
            made.setdefault("forgotten", []).append(time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
            write_json(os.path.join(kept, "setup.json"), made)
        gone += 1
    print(f"{gone} tries forgotten; launch will run them again")


# ------------------------------------------------------------------------------------------------- grade

def turned_round(want):
    """A wrong answer of the right shape: each true or false turned round, each number doubled and moved by one
    (so that it is outside what the rule for numbers lets through), and each word
    swapped for "resolves" (or "rejects" for "resolves")."""
    def wrong(v):
        if isinstance(v, bool):
            return not v
        if isinstance(v, (int, float)):
            return 2 * v + 1
        return "rejects" if v == "resolves" else "resolves"
    return {k: wrong(v) for k, v in want.items()}


def same(got, want):
    """reader.py's rule, and a rule for numbers that was fixed on 2026-11-15, before any try with a number in
    its answer: a number is right when it is within 0.015 of the expected one, or within one part in a
    thousand of it, whichever is wider. The asks say "to two decimals". A number is also taken when it is
    written as a string ("4000" for 4000). An answer of the wrong kind is wrong, and never stops the grader."""
    if isinstance(want, bool):
        if isinstance(got, str):
            got = {"true": True, "false": False}.get(got.strip().lower(), got)
        return got is want
    if isinstance(want, (int, float)):
        if isinstance(got, str):
            try:
                got = float(got.strip())
            except ValueError:
                return False
        if not isinstance(got, (int, float)) or isinstance(got, bool) or math.isnan(got):
            return False
        return abs(got - want) <= max(0.015, 0.001 * abs(want))
    if isinstance(want, str):
        if not isinstance(got, str):
            return False
        got = got.strip().lower()
        return got == want or (len(got) > 5 and got[:6] == want[:6])  # "resolved" for "resolves"
    return got == want


def grade_one(set_dir, kept, task, pristine, modules, window, write=True):
    """The reader test's grader, with the set's paths and a stand-in `window` when asked."""
    where = answer_file(set_dir, task)
    if where:
        want = json_of(task_file(set_dir, task, "expected.json"))
        path = os.path.join(kept, "app", where)
        try:
            got = json_of(path)
            each = {k: same(got.get(k), v) for k, v in want.items()} if isinstance(got, dict) else {}
            said = json.dumps(got)
        except OSError as err:
            each, said = {}, f"no answer: app/{where}: {err.strerror}"
        except ValueError as err:
            each, said = {}, f"no answer that parses: {err}"
        result = {"passed": bool(each) and all(each.values()) and len(each) == len(want), "each": each, "answer": said}
        text = f"answer: {said}\nexpected: {json.dumps(want)}\n"
    else:
        with tempfile.TemporaryDirectory(prefix="grade-") as tmp:
            os.symlink(pristine, os.path.join(tmp, "babylon-lite"))
            os.symlink(modules, os.path.join(tmp, "node_modules"))
            app = os.path.join(tmp, "app")
            source = os.path.join(kept, "app")
            shutil.copytree(source if os.path.isdir(source) else os.path.join(set_dir, "app"), app, symlinks=True)
            # The subject's own tests and config are not run: the app's config is put back as it was handed over.
            for name in ("tsconfig.json", "package.json"):
                shutil.copy(os.path.join(set_dir, "app", name), os.path.join(app, name))
            config = text_of(os.path.join(set_dir, "checks", "vitest.config.ts"))
            if window == "stub":
                line = 'include: ["checks/**/*.test.ts"],'
                assert line in config, "the set's vitest config has no include line to set the stand-in beside"
                config = config.replace(line, line + '\n        setupFiles: ["./checks/window-stub.ts"],')
            write_text(os.path.join(app, "vitest.config.ts"), config)
            shutil.rmtree(os.path.join(app, "checks"), ignore_errors=True)
            os.makedirs(os.path.join(app, "checks"))
            shutil.copy(os.path.join(set_dir, "checks", "helpers.ts"), os.path.join(app, "checks", "helpers.ts"))
            # A set may keep more helpers beside helpers.ts, such as sets/scene's scene-helpers-s.ts.
            for name in sorted(os.listdir(os.path.join(set_dir, "checks"))):
                if name != "helpers.ts" and "helpers" in name and name.endswith(".ts"):
                    shutil.copy(os.path.join(set_dir, "checks", name), os.path.join(app, "checks", name))
            if window == "stub":
                shutil.copy(os.path.join(set_dir, "checks", "window-stub.ts"), os.path.join(app, "checks"))
            shutil.copy(task_file(set_dir, task, "check.test.ts"), os.path.join(app, "checks", task + ".test.ts"))
            if os.path.lexists(os.path.join(app, "node_modules")):
                os.remove(os.path.join(app, "node_modules"))
            os.symlink("../node_modules", os.path.join(app, "node_modules"))
            out = os.path.join(tmp, "out.json")
            env = dict(os.environ, VITE_CONFIG_NATIVE_IGNORE_WARNING="true", CI="")
            # No module cache on disk: every grade runs in a new directory, so the cache never hits and only
            # grows. On 2026-11-15 it filled the disk with 22 GB in the middle of two runs.
            ran = subprocess.run(["npx", "vitest", "run", f"checks/{task}.test.ts", "--reporter=default",
                                  "--reporter=json", f"--outputFile.json={out}", "--fsModuleCache=false"],
                                 cwd=app, env=env, capture_output=True, text=True, timeout=600, check=False)
            def placed(words):
                """The machine's own paths taken out: a failing check prints the library's files by path."""
                for path, word in ((tmp, "GRADE"), (os.path.realpath(pristine), "PRISTINE"), (pristine, "PRISTINE"),
                                   (os.path.realpath(modules), "RUNNER"), (modules, "RUNNER")):
                    words = words.replace(path, word)
                for path, word in ((pristine, "PRISTINE"), (modules, "RUNNER")):  # and written from elsewhere: ../../x
                    tail = "/".join(path.rstrip("/").split("/")[-3:])
                    words = re.sub(r"[^\s\"'(]*" + re.escape(tail), word, words)
                return words
            text = placed(ran.stdout + ran.stderr)
            try:
                report = json_of(out)
                cases = {a["fullName"]: a["status"] for f in report.get("testResults", [])
                         for a in f.get("assertionResults", [])}
                whole = [f.get("message") for f in report.get("testResults", []) if f.get("status") == "failed"
                         and not f.get("assertionResults")]
            except (OSError, ValueError):
                cases, whole = {}, ["the runner wrote no report"]
            result = {"passed": bool(cases) and all(v == "passed" for v in cases.values()) and not any(whole),
                      "each": cases, "could not load": [placed(w)[:600] for w in whole if w]}
    result["window"] = window
    if write:
        found = [f"{name} holds {', '.join(f)}" for name, f in (
            ("grade.txt", private_in(text)), ("grade.json", private_in(json.dumps(result)))) if f]
        if found:
            raise PrivacyStop("; ".join(found))
        write_text(os.path.join(kept, "grade.txt"), text)
        write_json(os.path.join(kept, "grade.json"), result)
    return result, text


class PrivacyStop(Exception):
    pass


def grade(args):
    run = Run(args.run)
    pristine, modules = option(args, "pristine"), runner_modules(args)
    counted, stopped = [0, 0], []
    todo = [kept for kept in run.all_tries()
            if is_kept(kept) and (args.again or not os.path.exists(os.path.join(kept, "grade.json")))]

    def one(kept):
        made = json_of(os.path.join(kept, "setup.json"))
        try:
            result, _ = grade_one(run.set, kept, made["task"], pristine, modules, run.window)
        except PrivacyStop as err:
            return kept, None, str(err)
        return kept, result, None

    # Each try is graded on its own, in its own temporary directory, so several can be graded at once.
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.parallel)) as pool:
        for kept, result, stop in pool.map(one, todo):
            if stop:
                stopped.append(os.path.relpath(kept, run.tries))
                print("NOT KEPT", stopped[-1], f"privacy: {stop}; no grade written")
                continue
            counted[result["passed"]] += 1
            print("passed" if result["passed"] else "FAILED", os.path.relpath(kept, run.tries),
                  "" if result["passed"] else json.dumps(result["each"])[:160])
    print(f"graded {sum(counted)}: {counted[1]} passed, {counted[0]} failed"
          + (f"; {len(stopped)} not graded, stopped by the privacy check" if stopped else ""))
    if stopped:
        sys.exit(1)


def check_tasks(args):
    """Grade each task's reference answer, which must pass, and its plain answer, which must fail.

    A code task may also hold hollow answers, `hollow.ts` or `hollow-<name>.ts`: answers that do not do on the
    real library what the ask asks, in a way a check might miss. Each must fail, at an assertion. Added
    2026-11-18, after bench/sets/camera/audit found that every camera code task's check passed one."""
    set_dir = os.path.abspath(args.set)
    pristine, modules = option(args, "pristine"), runner_modules(args)
    bad = 0
    for task in set_tasks(set_dir):
        where = answer_file(set_dir, task)
        kinds = [("reference", True), ("plain", False)]
        if os.path.exists(task_file(set_dir, task, "other.ts")):
            kinds.append(("other", True))
        if not where:
            kinds += [(os.path.basename(h)[:-3], False)
                      for h in sorted(glob.glob(task_file(set_dir, task, "hollow*.ts")))]
        for label, must in kinds:
            with tempfile.TemporaryDirectory(prefix="task-") as kept:
                if where:
                    want = json_of(task_file(set_dir, task, "expected.json"))
                    want = turned_round(want) if label == "plain" else want
                    os.makedirs(os.path.dirname(os.path.join(kept, "app", where)))
                    write_text(os.path.join(kept, "app", where), json.dumps(want))
                else:
                    if not os.path.exists(task_file(set_dir, task, label + ".ts")):
                        print("WRONG", task, label, "is missing")
                        bad += 1
                        continue
                    shutil.copytree(os.path.join(set_dir, "app"), os.path.join(kept, "app"))
                    target = os.path.join(kept, "app", text_of(task_file(set_dir, task, "file.txt")).strip())
                    os.makedirs(os.path.dirname(target), exist_ok=True)
                    shutil.copy(task_file(set_dir, task, label + ".ts"), target)
                result, _ = grade_one(set_dir, kept, task, pristine, modules, args.window, write=False)
                # A plain code answer must fail at an assertion, not because it would not load.
                failing = label == "plain" or label.startswith("hollow")
                ok = result["passed"] is must and not (failing and not where and result.get("could not load"))
                bad += not ok
                print("ok   " if ok else "WRONG", task, label, "passed" if result["passed"] else "failed",
                      "" if result["passed"] else json.dumps(result["each"])[:140],
                      (result.get("could not load") or [""])[0][:120])
    print(f"window: {args.window}; {'all as they must be' if not bad else str(bad) + ' WRONG'}")
    sys.exit(1 if bad else 0)


# ------------------------------------------------------------------------------------------------- tally

def kept_tries(run, with_spoiled=False, cut=None):
    """(arm -> task -> [try], spoiled, played by hand) for every kept and graded try.

    A try that small.py marked as cut off by its length limit is not an answer, and it is left out always,
    even with with_spoiled. When `cut` is a list, each such try is added to it, with its arm and task."""
    got, spoiled, by_hand = {}, [], []
    listed = set(run.tasks())
    for path in sorted(glob.glob(os.path.join(run.tries, "*", "*", "*", "grade.json"))):
        kept = os.path.dirname(path)
        arm, task, n = kept.split(os.sep)[-3:]
        if task not in listed:
            continue  # run.json no longer lists the task
        record = json_of(os.path.join(kept, "record.json"))
        result = json_of(path)
        if record.get("played by hand"):
            by_hand.append((arm, task, int(n), result["passed"], record["played by hand"]))
            continue
        if record.get("spoiled"):
            spoiled.append((arm, task, int(n)))
            if not with_spoiled:
                continue
        whose = os.path.join(kept, "whose.txt")
        tokens = record.get("tokens") or {}
        if record.get("cut off by its length limit"):
            into = cut if cut is not None else []
        else:
            into = got.setdefault(arm, {}).setdefault(task, [])
        into.append({
            "arm": arm, "task": task, "n": int(n), "passed": result["passed"], "each": result.get("each") or {},
            "out": tokens.get("output", record.get("output tokens", 0)),
            "cost": record.get("cost in dollars, as the stream reports it") or 0,
            "estimated": bool(tokens.get("estimated")), "cut off": bool(record.get("cut off by its length limit")),
            "closing tag only": bool(record.get("only a closing tag")),
            "inside reasoning": bool(record.get("ended inside its reasoning")
                                     or record.get("nothing outside its reasoning")),
            "again after cut": len(json_of(os.path.join(kept, "setup.json")).get("cut off, launched again", []))
            if os.path.exists(os.path.join(kept, "setup.json")) else 0,
            "whose": text_of(whose).split("\n")[0].strip() if os.path.exists(whose) else None})
    return got, spoiled, by_hand


def tally(args):
    run = Run(args.run)
    cut = []
    got, spoiled, by_hand = kept_tries(run, cut=cut)
    names = run.tasks()
    arms = [a for a in run.arms if a in got] + sorted(a for a in got if a not in run.arms)
    waiting, failed = {}, {}
    for kept in run.all_tries():
        made = json_of(os.path.join(kept, "setup.json"))
        if made["task"] not in names:
            continue
        if is_kept(kept) and not os.path.exists(os.path.join(kept, "grade.json")):
            waiting.setdefault(made["arm"], {}).setdefault("not graded", 0)
            waiting[made["arm"]]["not graded"] += 1
        if not is_kept(kept):
            key = "not run" if made["did not run"] else \
                "did not fit" if os.path.exists(os.path.join(kept, DID_NOT_FIT)) else "not launched"
            waiting.setdefault(made["arm"], {}).setdefault(key, 0)
            waiting[made["arm"]][key] += 1
            if made["did not run"]:
                failed[os.path.relpath(kept, run.tries)] = made["did not run"][-1]["reason"]
    if cut:
        print(f"passed of tries, by task and arm (spoiled tries, tries played by hand, and {len(cut)} tries cut off "
              "by their length limit left out of the passes and of their count; each is listed below among the failures, "
              "as too long)")
    elif arms:
        print("passed of tries, by task and arm (spoiled tries and tries played by hand left out)")
    if arms:
        print("task  " + "".join(f"{a[:11]:>12s}" for a in arms))

        def cell(ts):
            return f"{sum(t['passed'] for t in ts)} of {len(ts)}" if ts else "-"
        for task in names:
            print(f"{task:5s} " + "".join(f"{cell(got[a].get(task, [])):>12s}" for a in arms))
        print("all   " + "".join(f"{cell([t for ts in got[a].values() for t in ts]):>12s}" for a in arms))
    for arm in list(run.arms) + sorted((set(arms) | set(waiting) | {a for a, *_ in spoiled}
                                        | {t["arm"] for t in cut}) - set(run.arms)):
        tries = [t for ts in got.get(arm, {}).values() for t in ts]
        spent = tries + [t for t in cut if t["arm"] == arm]  # a try cut off spent its tokens all the same
        w = waiting.get(arm, {})
        print(f"{arm}: kept {len(tries)}, not run {w.get('not run', 0)}, not launched {w.get('not launched', 0)}, "
              f"not graded {w.get('not graded', 0)}, spoiled {sum(1 for s in spoiled if s[0] == arm)}"
              + (f", did not fit {w['did not fit']}" if w.get("did not fit") else "")
              + (f", cut off {sum(t['cut off'] for t in spent)}" if any(t["cut off"] for t in spent) else "")
              + (f", launched again after a cut-off {sum(1 for t in spent if t['again after cut'])}"
                 if any(t["again after cut"] for t in spent) else "")
              + (f", ended with nothing outside its reasoning {sum(t['inside reasoning'] for t in spent)}"
                 if any(t["inside reasoning"] for t in spent) else "")
              + (f", a closing reasoning tag with no opening one {sum(t['closing tag only'] for t in spent)}"
                 if any(t["closing tag only"] for t in spent) else "") + "; "
              f"output tokens {sum(t['out'] or 0 for t in spent):,}"
              + (f" (an estimate, bytes / 3.5, for {sum(t['estimated'] for t in spent)} of {len(spent)})"
                 if any(t["estimated"] for t in spent) else "")
              + f"; cost ${sum(t['cost'] for t in spent):.4f}")
    for where, why in sorted(failed.items()):
        print(f"  did not run {where}: {why}")
    if by_hand:
        hands = {}
        for arm, _, _, passed, how in by_hand:
            hands.setdefault((arm, how), [0, 0])[passed] += 1
        print("played by hand, never counted: " + "; ".join(
            f"{a} with the {h} answer {v[1]} of {sum(v)} passed" for (a, h), v in sorted(hands.items())))
    print(f"failures, sorted by whose.txt; a try cut off is among them, sorted \"{TOO_LONG}\"")
    unsorted, wrong = 0, []
    for arm in arms + sorted({t["arm"] for t in cut} - set(arms)):
        sorts = {}
        failed = [(t, False) for ts in got.get(arm, {}).values() for t in ts if not t["passed"]]
        failed += [(t, True) for t in cut if t["arm"] == arm]
        for t, was_cut in failed:
            word = (t["whose"] or "not sorted yet").split(":")[0]
            if word != "not sorted yet" and (word == TOO_LONG) != was_cut:
                wrong.append(f"{arm}/{t['task']}/{t['n']}: " + (f"cut off, and sorted {word!r}" if was_cut
                                                                 else f"not cut off, and sorted {TOO_LONG!r}"))
            sorts[word] = sorts.get(word, 0) + 1
        unsorted += sorts.get("not sorted yet", 0)
        print(f"  {arm:20s} {sum(sorts.values()):3d}: " + "; ".join(f"{k} {v}" for k, v in sorted(sorts.items())))
    for line in wrong:
        print(f"  {line}")
    if args.strict and unsorted:
        sys.exit("a failure is not sorted")
    if args.strict and wrong:
        sys.exit(f"a try cut off must be sorted {TOO_LONG!r}, and only such a try may be; {len(wrong)} tries break this")


# ----------------------------------------------------------------------------------------------- compare
# The reader test's rule, as reader.py has it. `matters` is its quarter; 0.25 gives the same answers.

DRAWS = 10000


def interval(values):
    values = sorted(values)
    return values[int(0.025 * len(values))], values[int(0.975 * len(values)) - 1]


def passes_rule(first, second, rng, matters=0.25):
    """first, second: task -> list of True/False. The tasks both hold are the units."""
    names = sorted(set(first) & set(second))
    diffs = [sum(first[t]) / len(first[t]) - sum(second[t]) / len(second[t]) for t in names]
    mean = sum(diffs) / len(diffs)
    drawn = []
    for _ in range(DRAWS):
        pick = [diffs[rng.randrange(len(diffs))] for _ in diffs]
        drawn.append(sum(pick) / len(pick))
    low, high = interval(drawn)
    size = "a quarter" if matters == 0.25 else f"{matters:g}"
    if abs(mean) >= matters and (low > 0 or high < 0):
        answer = "shown: the first passes more" if mean > 0 else "shown: the first passes less"
    elif low > -matters and high < matters:
        answer = f"no difference as large as {size}"
    else:
        answer = "cannot tell"
    return mean, low, high, answer, sum(d > 0 for d in diffs), sum(d < 0 for d in diffs)


def compare(args):
    run = Run(args.run)
    cut = []
    got, spoiled, _ = kept_tries(run, args.with_spoiled, cut)
    for t in cut:  # a try cut off is too long: a failure of its task (AGENTS.md, rule 6; changed 2026-11-18)
        got.setdefault(t["arm"], {}).setdefault(t["task"], []).append(dict(t, passed=False))
    print(f"spoiled tries: {len(spoiled)}" + (", counted" if args.with_spoiled else ", left out")
          + (f"; tries cut off by their length limit: {len(cut)}, each counted as a failure of its task" if cut else "")
          + "\n")
    rng = random.Random(20261115)

    def one(x, y):
        first = {t: [r["passed"] for r in rs] for t, rs in got[x].items()}
        second = {t: [r["passed"] for r in rs] for t, rs in got[y].items()}
        mean, low, high, answer, up, down = passes_rule(first, second, rng, run.matters)
        print(f"  {x:10s} against {y:10s} {mean:+.2f} ({low:+.2f} to {high:+.2f}); tasks where the first passed "
              f"more {up}, less {down}: {answer}")

    if run.cfg.get("twice"):
        print("One arm twice. If the rule tells the two rounds apart, nothing it says below counts.")
        x, y = run.cfg["twice"]
        if x in got and y in got:
            one(x, y)
    print("\nPassing: the mean over tasks of (share of tries passed by the first) less (by the second).")
    for x, y in run.cfg.get("pairs", []):
        if x in got and y in got:
            one(x, y)
        else:
            print(f"  {x:10s} against {y:10s} not both kept and graded")


def simulate(args):
    """Ask the rule for its answer on made-up subjects whose pass rates are chosen."""
    run = Run(args.run)
    global DRAWS
    DRAWS = 1000
    rng = random.Random(1)
    count_tasks = len(run.tasks())
    tries = max([int(a.get("tries", 1)) for a in run.arms.values()] or [3])
    names = [f"T{i}" for i in range(1, count_tasks + 1)]

    def run_pass(a, b, times=400):
        count = {}
        for _ in range(times):
            first = {t: [rng.random() < p for _ in range(tries)] for t, p in zip(names, a)}
            second = {t: [rng.random() < p for _ in range(tries)] for t, p in zip(names, b)}
            answer = passes_rule(first, second, random.Random(rng.random()), run.matters)[3].split(":")[0]
            count[answer] = count.get(answer, 0) + 1
        return "; ".join(f"{k} {round(100 * v / times)}%" for k, v in sorted(count.items()))

    k = count_tasks
    third = max(1, k // 3)
    print(f"Passing, {k} tasks, {tries} tries each in each arm; how often each answer comes in 400 made-up runs")
    for label, a, b in [
        ("both pass every task 9 times in 10", [0.9] * k, [0.9] * k),
        ("both pass every task half the time", [0.5] * k, [0.5] * k),
        ("first 0.9, second 0.6, on every task", [0.9] * k, [0.6] * k),
        ("first 0.9, second 0.4, on every task", [0.9] * k, [0.4] * k),
        (f"first 1.0 and second 0.0 on {third} tasks, both 0.9 on the rest",
         [1] * third + [0.9] * (k - third), [0] * third + [0.9] * (k - third)),
        ("first 1.0 and second 0.0 on one task, both 0.9 on the rest", [1] + [0.9] * (k - 1), [0] + [0.9] * (k - 1)),
    ]:
        print(f"  {label}: {run_pass(a, b)}")


# ----------------------------------------------------------------------------------------------- answers

def strip_comments(text, name):
    if not name.endswith((".ts", ".js", ".tsx", ".jsx", ".mts", ".cts")):
        return text
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.DOTALL)
    text = re.sub(r"(?m)(^|[^:\"'])//.*$", r"\1", text)
    return "\n".join(line for line in text.splitlines() if line.strip())


def answers(args):
    run = Run(args.run)
    start = os.path.join(run.set, "app")
    for kept in run.all_tries():
        made = json_of(os.path.join(kept, "setup.json"))
        if made["task"] != args.task or (args.arm and made["arm"] not in args.arm) or not is_kept(kept):
            continue
        result = json_of(os.path.join(kept, "grade.json")) if os.path.exists(
            os.path.join(kept, "grade.json")) else None
        verdict = "not graded" if result is None else "passed" if result["passed"] else "FAILED"
        if json_of(os.path.join(kept, "record.json")).get("cut off by its length limit"):
            verdict += ", but cut off by its length limit: not an answer, and not counted"
        print(f"=== {made['arm']} n={made['n']}: {verdict}")
        print("last words: " + text_of(os.path.join(kept, "report.txt")).strip())
        app = os.path.join(kept, "app")
        for folder, _, files in os.walk(app):
            for name in sorted(files):
                path = os.path.join(folder, name)
                rel = os.path.relpath(path, app)
                before = os.path.join(start, rel)
                if os.path.exists(before) and bytes_of(before) == bytes_of(path):
                    continue
                lines = strip_comments(text_of(path), name).splitlines()
                print(f"--- {rel} ({'changed' if os.path.exists(before) else 'new'}, {len(lines)} lines"
                      + (", first 120" if len(lines) > 120 else "") + ")")
                print("\n".join(lines[:120]))
        if result is not None and not result["passed"]:
            tail = text_of(os.path.join(kept, "grade.txt")).rstrip().splitlines()[-25:]
            print("--- the check's last 25 lines")
            print("\n".join(tail))


# -------------------------------------------------------------------------------------------------- main

def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="what", required=True)

    def machine(one, *names):
        for name in names:
            one.add_argument("--" + name)
        return one

    one = machine(sub.add_parser("declarations"), "pristine", "runner")
    one.add_argument("--out", required=True), one.add_argument("--no-comments", action="store_true")
    one.add_argument("--dirs", nargs="+", help="the library's source directories under src, joined in this order "
                     "(default: camera)")
    one.add_argument("--name", default="declarations", help="the file is NAME.d.ts, or NAME-bare.d.ts")
    one.set_defaults(go=declarations)
    one = machine(sub.add_parser("setup"), "boxes")
    one.add_argument("run")
    one.set_defaults(go=setup)
    one = machine(sub.add_parser("launch"), "raw")
    one.add_argument("run"), one.add_argument("--arm", action="append"), one.add_argument("--task", action="append")
    one.add_argument("--parallel", type=int, default=8), one.add_argument("--timeout", type=int, default=900)
    one.set_defaults(go=launch)
    one = sub.add_parser("fake")
    one.add_argument("run"), one.add_argument("--arm", required=True)
    one.add_argument("--with", dest="with_", required=True, choices=["reference", "plain"])
    one.add_argument("--over", action="store_true", help="play again tries that were played by hand before")
    one.set_defaults(go=fake)
    one = sub.add_parser("forget")
    one.add_argument("run"), one.add_argument("--arm", required=True), one.add_argument("--task", action="append")
    one.add_argument("--n", type=int, action="append")
    one.set_defaults(go=forget)
    one = machine(sub.add_parser("grade"), "pristine", "runner")
    one.add_argument("run"), one.add_argument("--again", action="store_true")
    one.add_argument("--parallel", type=int, default=1)
    one.set_defaults(go=grade)
    one = sub.add_parser("tally")
    one.add_argument("run"), one.add_argument("--strict", action="store_true")
    one.set_defaults(go=tally)
    one = sub.add_parser("compare")
    one.add_argument("run"), one.add_argument("--with-spoiled", action="store_true")
    one.set_defaults(go=compare)
    one = sub.add_parser("simulate")
    one.add_argument("run")
    one.set_defaults(go=simulate)
    one = sub.add_parser("answers")
    one.add_argument("run"), one.add_argument("--task", required=True), one.add_argument("--arm", action="append")
    one.set_defaults(go=answers)
    one = machine(sub.add_parser("check-tasks"), "pristine", "runner")
    one.add_argument("set"), one.add_argument("--window", choices=["stub", "none"], default="stub")
    one.set_defaults(go=check_tasks)
    one = sub.add_parser("scan")
    one.add_argument("files", nargs="+")
    one.set_defaults(go=scan)
    args = parser.parse_args()
    args.go(args)


if __name__ == "__main__":
    main()

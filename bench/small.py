#!/usr/bin/env python3
"""Runs where the subject is sent one message and gives one reply: a small model behind an OpenAI-compatible
chat endpoint, which may have no tool calls and a bounded context.

    small.py launch RUN --base-url URL --model NAME [--api-key-env VAR] [--arm A ...] [--task T ...]
                        [--parallel 2] [--timeout 900] [--temperature T] [--max-tokens N]
                        [--context-limit TOKENS] [--label WORDS] [--system [TEXT]] [--raw DIR]
    small.py launch RUN --via-claude MODEL [the same options, less those of the endpoint]
    small.py prompt RUN --arm A --task T --n N

RUN is a run's directory that `box.py setup RUN` has set up. Its arms give "model": "small", so that
`box.py launch` leaves them alone. Each try is kept in `RUN/tries/<arm>/<task>/<n>/`, in the layout box.py
uses, so that `box.py grade`, `tally`, `compare` and `answers` work on the run as they are.

The message. One message per try, built like this:

    the try's request.md, with its box path left as it is;
    then a blank line and "Here are the files in the app that matter:";
    then, for each file the arm puts in the box's app directory (the texts), and each file of the task's
    starting app that the task's ask names or that already exists at the path the ask names, a line
    "FILE: app/<path>" followed by the content in a fenced block;
    then: "Reply with every file you write or change, each as a line 'FILE: app/<path>' followed by its whole
    content in one fenced block. After the files, tell me in a sentence or two what you did, and say if there
    was anything you were not sure of."

Nothing else is sent: no word about a test. The arm's files come first, in the order of their paths, then the
starting app's. A fence is three backticks, or one more than the longest run of backticks in the file. When
there is no file at all, the heading line is left out too, so that it does not stand over nothing. There is
no system message unless --system is given; --system alone sends the one line box.py uses, and --system TEXT
sends TEXT. Through --via-claude the local program always gets a system prompt (that line, or TEXT): with
none it would use its own long one.

The size of a message in tokens is an estimate: its bytes divided by 3.5. It is not the model's count. With
--context-limit, a message whose estimate alone is over the limit is not sent. The try is written down as
"did not fit" in did-not-fit.json beside its setup.json, counted in the launch summary and shown by
`box.py tally`. It is not kept, and a later launch with a larger limit sends it.

The reply. Each line "FILE: app/<path>" followed by a fenced block is a file. Two other forms of the path are
taken and counted: the box's own path, which the request names (<box>/app/<path>), and a path from inside the
app with no "app/" before it. Blank lines may stand between
the two, and the line may be wrapped in `*` or backticks. The block closes at the first line that is only a
fence of the same character, at least as long. These are counted in record.json, and nothing is written for
them: a path that does not start with app/ or leaves it; a FILE line with no block after it; a fence that is
never closed. When one path has two blocks, the last one wins, and the path is listed under "written twice".
A reply with no file is a kept try with no files: it fails its check, and that is data, not an error.
report.txt is the reply's text after the last file block (the whole reply when it has none).

What is kept, beside request.md (unchanged) and setup.json: sent.md (the whole message as sent), app/ (the
files of the reply, written into the box's app and kept from it as box.py keeps a subject's files),
report.txt, steps.json (one step: the reply's text and the files it carried), and record.json (the model in
the words of --label, never an identifier; the endpoint's token counts where its "usage" gives them, else an
estimate marked as one; seconds; whether the reply was cut off by its length limit; "one shot": true; the
context limit and the message's size). Every kept file passes box.py's privacy scan first. The raw request
and response go to RAW/<run>/<arm>/<task>/<n>/ (the "raw" path of bench/box.local.json), outside the
repository; the API key is never written. A try whose request fails, times out, or comes back with no choice
is not kept. It is written down in setup.json under "did not run", and the same command launches it again,
counted as a relaunch. Nothing is retried on its own.

--via-claude MODEL sends the same message through the local `claude` program, with no tools, in an empty
temporary directory:

    env -u CLAUDE_CODE_USER_EMAIL claude -p "<message>" --system-prompt "<the one line>"
      --settings '{"attribution":{"commit":"","pr":""}}' --setting-sources "" --strict-mcp-config
      --model MODEL --effort medium --tools "" --permission-mode default --output-format json
      --no-session-persistence < /dev/null

The program takes `--tools ""` as "no tools" (its help: 'Use "" to disable all tools'). The message is one
argument, so it must be under 128 KiB, the system's limit for one argument. This is for setting the one-shot
form beside the box form on one machine, not for a run on the small model.
"""
import argparse
import concurrent.futures
import hashlib
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.request

import box

LEAD = "Here are the files in the app that matter:"
TAIL = ("Reply with every file you write or change, each as a line 'FILE: app/<path>' followed by its whole "
        "content in one fenced block. After the files, tell me in a sentence or two what you did, and say if there "
        "was anything you were not sure of.")
BYTES_PER_TOKEN = 3.5
RUNNING, STOPPING = set(), threading.Event()


def estimate(text):
    return round(len(text.encode()) / BYTES_PER_TOKEN)


def now():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


# ---------------------------------------------------------------------------------------------- the message

def fence_for(content):
    longest = max([len(m) for m in re.findall(r"`+", content)] or [0])
    return "`" * max(3, longest + 1)


def named_in(ask, rel):
    """The ask names the file by its path from the app's root (with or without app/), or by its file name."""
    for word in {rel, "app/" + rel, os.path.basename(rel)}:
        if "." in word and re.search(r"(?<![\w./-])" + re.escape(word) + r"(?![\w-])", ask):
            return True
    return False


def files_for(run, made):
    """[(path in app, content)]: the arm's texts as handed over at setup, then the starting app's named files."""
    out, handed = [], set()
    for was in sorted(made["files"], key=lambda w: w["in app as"]):
        source = run.text_path(was["text"])
        if not os.path.isfile(source) or box.sha256(source) != was["sha256"]:
            raise box.TextChanged(f"text {was['text']} is not the one handed over at setup")
        out.append((was["in app as"], box.text_of(source)))
        handed.add(was["in app as"])
    ask = box.text_of(box.task_file(run.set, made["task"], "ask.md"))
    start = os.path.join(run.set, "app")
    for folder, _, names in sorted(os.walk(start)):
        for name in sorted(names):
            rel = os.path.relpath(os.path.join(folder, name), start)
            if rel not in handed and named_in(ask, rel):
                out.append((rel, box.text_of(os.path.join(folder, name))))
    return out


def message_of(run, kept):
    made = box.json_of(os.path.join(kept, "setup.json"))
    parts = [box.text_of(os.path.join(kept, "request.md")).rstrip("\n")]
    files = files_for(run, made)
    if files:
        parts.append(LEAD)
        for rel, content in files:
            body = content if content.endswith("\n") or not content else content + "\n"
            fence = fence_for(content)
            parts.append(f"FILE: app/{rel}\n{fence}\n{body}{fence}")
    parts.append(TAIL)
    return "\n\n".join(parts) + "\n"


# ------------------------------------------------------------------------------------------------ the reply

FILE_LINE = re.compile(r"^[\s*_`#>]*FILE:\s*`?([^`*]+?)`?[\s*_]*$")
OPEN = re.compile(r"^\s*(`{3,}|~{3,})[^`]*$")


def where_in_app(path, box_path=None, counted=None):
    """The path under app/, or None when it would leave it.

    The reply is asked for "app/<path>". Two other forms are taken and counted, because a file lost to its
    path's form would measure whether a model keeps to a form, and the runs are about what a text teaches:
    the box's own path, which the request itself names (<box>/app/<path>), and a path given from inside the
    app with no "app/" before it (src/x.ts). Any other path that begins with a slash is refused."""
    path = path.strip()
    if "\\" in path or "\0" in path:
        return None
    form = None
    if path.startswith("app/"):
        rel = path[len("app/"):]
    elif box_path and path.startswith(box_path.rstrip("/") + "/app/"):
        rel, form = path[len(box_path.rstrip("/") + "/app/"):], "paths given with the box"
    elif not path.startswith("/"):
        rel, form = path, "paths given without app/"
    else:
        return None
    parts = rel.split("/")
    if not rel or rel.startswith("/") or any(p in ("", ".", "..") for p in parts):
        return None
    if form and counted is not None:
        counted[form] += 1
    return rel


def parse_reply(text, box_path=None):
    """{path in app: content}, the report, and what was counted."""
    lines = (text or "").replace("\r\n", "\n").split("\n")
    files, order = {}, []
    counted = {"refused paths": [], "file lines with no block": 0, "unclosed fences": 0, "written twice": [],
               "paths given with the box": 0, "paths given without app/": 0}
    end, i = 0, 0
    while i < len(lines):
        line = FILE_LINE.match(lines[i])
        if not line:
            i += 1
            continue
        j = i + 1
        while j < len(lines) and not lines[j].strip():
            j += 1
        opened = OPEN.match(lines[j]) if j < len(lines) else None
        if not opened:
            counted["file lines with no block"] += 1
            i += 1
            continue
        fence = opened.group(1)
        close = re.compile(r"^\s*" + re.escape(fence[0]) + "{" + str(len(fence)) + r",}\s*$")
        k = next((k for k in range(j + 1, len(lines)) if close.match(lines[k])), None)
        if k is None:
            counted["unclosed fences"] += 1
            break
        rel = where_in_app(line.group(1), box_path, counted)
        if rel is None:
            counted["refused paths"].append(line.group(1).strip()[:200])
        else:
            if rel in files and rel not in counted["written twice"]:
                counted["written twice"].append(rel)
            files[rel] = "\n".join(lines[j + 1:k]) + ("\n" if k > j + 1 else "")
            if rel not in order:
                order.append(rel)
        end = i = k + 1
    report = "\n".join(lines[end:]).strip()
    return {p: files[p] for p in order}, report, counted


# --------------------------------------------------------------------------------------------- the senders

class NotRun(Exception):
    pass


def endpoint_url(base):
    base = base.rstrip("/")
    if base.endswith("/chat/completions"):
        return base
    return base + ("/chat/completions" if base.endswith("/v1") else "/v1/chat/completions")


def send_endpoint(args, message, raw):
    body = {"model": args.model, "messages": ([{"role": "system", "content": args.system}] if args.system else [])
            + [{"role": "user", "content": message}], "stream": False}
    if args.temperature is not None:
        body["temperature"] = args.temperature
    if args.max_tokens is not None:
        body["max_tokens"] = args.max_tokens
    url = endpoint_url(args.base_url)
    box.write_json(os.path.join(raw, "request.json"), {"url": url, "body": body})
    headers = {"Content-Type": "application/json"}
    if args.api_key_env:
        headers["Authorization"] = "Bearer " + os.environ[args.api_key_env]
    request = urllib.request.Request(url, data=json.dumps(body).encode(), headers=headers, method="POST")
    start = time.time()
    try:
        with urllib.request.urlopen(request, timeout=args.timeout) as answer:
            got = answer.read()
    except urllib.error.HTTPError as err:
        box.write_text(os.path.join(raw, "response.txt"), err.read().decode("utf-8", "replace"))
        raise NotRun(f"the endpoint answered {err.code}") from err
    except (urllib.error.URLError, TimeoutError, OSError) as err:
        raise NotRun(f"the request failed or timed out after {args.timeout} s: {type(err).__name__}") from err
    seconds = round(time.time() - start, 1)
    with open(os.path.join(raw, "response.json"), "wb") as f:
        f.write(got)
    try:
        response = json.loads(got)
        choice = response["choices"][0]
    except (ValueError, KeyError, IndexError, TypeError) as err:
        raise NotRun("the response holds no choice") from err
    said = choice.get("message") or {}
    usage = response.get("usage") or {}
    reasoning = said.get("reasoning_content") or said.get("reasoning") or ""
    text = said.get("content") or ""
    if isinstance(text, list):  # some endpoints give the content as parts
        text = "".join(p.get("text") or "" for p in text if isinstance(p, dict))
    if not isinstance(text, str):
        raise NotRun("the response's content is not text")
    given = isinstance(usage.get("prompt_tokens"), int) and isinstance(usage.get("completion_tokens"), int)
    tokens = {"input": usage["prompt_tokens"] if given else estimate((args.system or "") + message),
              "output": usage["completion_tokens"] if given else estimate(text + reasoning),
              "estimated": not given}
    if not given:
        tokens["how"] = "the endpoint gave no usage: bytes / 3.5"
    return {"text": text, "reasoning": reasoning if isinstance(reasoning, str) else "", "tokens": tokens,
            "seconds": seconds, "finish reason": choice.get("finish_reason"),
            "cut off": choice.get("finish_reason") == "length", "turns": 1, "cost": None}


def claude_command(args, message):
    return ["claude", "-p", message, "--system-prompt", args.system,
            "--settings", '{"attribution":{"commit":"","pr":""}}', "--setting-sources", "", "--strict-mcp-config",
            "--model", args.via_claude, "--effort", "medium", "--tools", "", "--permission-mode", "default",
            "--output-format", "json", "--no-session-persistence"]


def send_claude(args, message, raw):
    command = claude_command(args, message)
    box.write_json(os.path.join(raw, "request.json"), {"command": ["@MESSAGE@" if w == message else w
                                                                   for w in command], "message": message})
    env = {k: v for k, v in os.environ.items() if k != "CLAUDE_CODE_USER_EMAIL"}
    start = time.time()
    with tempfile.TemporaryDirectory(prefix="one-shot-") as empty:
        with open(os.path.join(raw, "response.json"), "w") as out, open(os.path.join(raw, "stderr.txt"), "w") as err:
            process = subprocess.Popen(command, cwd=empty, env=env, stdin=subprocess.DEVNULL, stdout=out, stderr=err)
            RUNNING.add(process)
            try:
                code = process.wait(timeout=args.timeout)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
                raise NotRun(f"timed out after {args.timeout} s") from None
            finally:
                RUNNING.discard(process)
        left = os.listdir(empty)
    if code:
        raise NotRun(f"the process ended with {code}")
    try:
        result = box.json_of(os.path.join(raw, "response.json"))
    except ValueError as err:
        raise NotRun("the program wrote no JSON result") from err
    if result.get("subtype") != "success" or result.get("is_error") or not isinstance(result.get("result"), str):
        raise NotRun(f"no result of subtype success (it was {result.get('subtype')})")
    usage = result.get("usage") or {}
    return {"text": result["result"], "reasoning": "", "seconds": round((result.get("duration_ms") or
                                                                        (time.time() - start) * 1000) / 1000, 1),
            "tokens": {"input": usage.get("input_tokens"), "cache write": usage.get("cache_creation_input_tokens"),
                       "cache read": usage.get("cache_read_input_tokens"), "output": usage.get("output_tokens"),
                       "of the output, thinking": (usage.get("output_tokens_details") or {}).get("thinking_tokens"),
                       "first request": sum(usage.get(k) or 0 for k in ("input_tokens", "cache_creation_input_tokens",
                                                                           "cache_read_input_tokens")),
                       "estimated": False},
            "finish reason": result.get("stop_reason"), "cut off": result.get("stop_reason") == "max_tokens",
            "turns": result.get("num_turns"), "cost": result.get("total_cost_usd"),
            "files left in the empty directory": len(left)}


# ------------------------------------------------------------------------------------------------- launch

def did_not_fit(kept, args, size, tokens):
    box.write_json(os.path.join(kept, box.DID_NOT_FIT), {
        "at": now(), "context limit": args.context_limit, "message bytes": size,
        "message tokens, estimated as bytes / 3.5": tokens})


def launch_one(run, args, kept):
    """'kept', 'did not run' or 'did not fit'."""
    made = box.json_of(os.path.join(kept, "setup.json"))
    arm, task, n = made["arm"], made["task"], made["n"]
    where = f"{arm}/{task}/{n}"
    try:
        message = message_of(run, kept)
    except box.TextChanged as err:
        box.say(f"not launched {where}: {err}")
        return "did not run"
    if os.path.exists(os.path.join(kept, "sent.md")):
        os.remove(os.path.join(kept, "sent.md"))  # left by an earlier launch that was not kept, or forgotten
    size, tokens = len(message.encode()), estimate(message)
    if args.context_limit is not None and tokens > args.context_limit:
        did_not_fit(kept, args, size, tokens)
        box.say(f"did not fit {where}: about {tokens} tokens (bytes / 3.5), the limit is {args.context_limit}")
        return "did not fit"
    if STOPPING.is_set():
        return "did not run"  # never sent, so not counted as a launch
    raw = run.raw_dir(args, arm, task, n)
    os.makedirs(raw, exist_ok=True)
    before = made.get("launches", len(made["did not run"]))
    if before:
        if before > len(made["did not run"]) + len(made.get("forgotten", [])):
            made["did not run"].append({"at": now(), "reason": "the launcher was stopped before the reply came"})
        for name in ("request.json", "response.json", "response.txt", "stderr.txt"):
            if os.path.exists(os.path.join(raw, name)):
                os.replace(os.path.join(raw, name), os.path.join(raw, f"launch{before}-{name}"))
    made["launches"], made["relaunches"] = before + 1, before
    box.write_json(os.path.join(kept, "setup.json"), made)
    if STOPPING.is_set():
        return "did not run"
    start = time.time()
    try:
        got = (send_claude if args.via_claude else send_endpoint)(args, message, raw)
    except NotRun as err:
        if STOPPING.is_set():
            return "did not run"  # the next launch writes the reason down
        box.not_run(kept, str(err))
        box.say(f"did not run {where}: {err}")
        return "did not run"
    if STOPPING.is_set():
        return "did not run"  # stopped while the reply came: the next launch writes the reason down
    files, report, counted = parse_reply(got["text"], made["box"])
    try:
        box.make_box(run, arm, task, n, made["box"], made["files"])
    except box.TextChanged as err:
        box.not_run(kept, str(err))
        box.say(f"did not run {where}: {err}")
        return "did not run"
    app = os.path.join(made["box"], "app")
    written = []
    for rel, content in files.items():
        target = os.path.join(app, rel)
        try:
            os.makedirs(os.path.dirname(target), exist_ok=True)
            box.write_text(target, content)
            written.append(rel)
        except OSError:
            counted["refused paths"].append("app/" + rel)
    record = {
        "model": args.label, "one shot": True,
        "sent through": "the local claude program, with no tools" if args.via_claude else
        "an OpenAI-compatible chat endpoint",
        "system message": args.system,
        "temperature": args.temperature, "max tokens": args.max_tokens,
        "context limit": args.context_limit,
        "message": {"bytes": size, "tokens, estimated as bytes / 3.5": tokens},
        "turns": got["turns"], "messages": 1,
        "tokens": dict({"first request": got["tokens"].get("input")}, **got["tokens"]),
        "cost in dollars, as the stream reports it": got["cost"],
        "seconds": got["seconds"], "wall seconds": round(time.time() - start, 1),
        "finish reason": got["finish reason"], "cut off by its length limit": got["cut off"],
        "files in the reply": written, **counted,
        "reasoning text in the reply": bool(got["reasoning"]),
        "played by hand": False, "spoiled": False,
        "detectors": {"read outside the box": [], "named a path outside the box": [],
                      "wrote outside app": counted["refused paths"]},
    }
    if "files left in the empty directory" in got:
        record["files left in the empty directory"] = got["files left in the empty directory"]
    if os.path.exists(os.path.join(kept, box.DID_NOT_FIT)):
        record["did not fit before"] = box.json_of(os.path.join(kept, box.DID_NOT_FIT))
    step = {"message": 1, "text": [got["text"]], "reasoning": [got["reasoning"]] if got["reasoning"] else [],
            "files": {rel: {"bytes": len(c.encode()), "sha256": hashlib.sha256(c.encode()).hexdigest()}
                      for rel, c in files.items()}}
    found = box.private_in(message)
    if found:
        fault = "privacy: sent.md holds " + ", ".join(found)
    else:
        box.write_text(os.path.join(kept, "sent.md"), message)
        fault = box.keep_try(run, kept, [step], record, report)
    if fault:
        box.not_run(kept, fault)
        box.say(f"did not run {where}: NOTHING KEPT, {fault}")
        return "did not run"
    if os.path.exists(os.path.join(kept, box.DID_NOT_FIT)):
        os.remove(os.path.join(kept, box.DID_NOT_FIT))  # its words are in record.json
    for name in ("grade.json", "grade.txt"):
        if os.path.exists(os.path.join(kept, name)):
            os.remove(os.path.join(kept, name))
    t = record["tokens"]
    box.say(f"kept {where}: {record['seconds']} s, message {size} bytes, input {t['input']}, output {t['output']}"
            + (" (estimated)" if t.get("estimated") else "") + f", {len(written)} files"
            + (", CUT OFF" if record["cut off by its length limit"] else "")
            + (f", relaunch {before}" if before else "")
            + (f", refused {len(counted['refused paths'])}" if counted["refused paths"] else "")
            + (f", unclosed {counted['unclosed fences']}" if counted["unclosed fences"] else "")
            + (f", twice {len(counted['written twice'])}" if counted["written twice"] else ""))
    return "kept"


def stop_all(signum, _frame):
    STOPPING.set()
    for process in list(RUNNING):
        process.kill()
    raise SystemExit(f"small.py: stopped by signal {signum}; nothing in flight was kept")


def launch(args):
    if bool(args.via_claude) == bool(args.base_url):
        sys.exit("small.py: give --base-url and --model, or --via-claude MODEL")
    if args.base_url and not args.model:
        sys.exit("small.py: give --model, the name the endpoint knows the model by")
    if args.via_claude and (args.temperature is not None or args.max_tokens is not None or args.api_key_env):
        sys.exit("small.py: --temperature, --max-tokens and --api-key-env are for an endpoint, not --via-claude")
    if args.api_key_env and not os.environ.get(args.api_key_env):
        sys.exit(f"small.py: the variable {args.api_key_env} is empty")
    if args.via_claude and not shutil.which("claude"):
        sys.exit("small.py: no `claude` program on PATH")
    if args.via_claude and not args.system:
        args.system = box.SYSTEM  # the local program gets a system prompt always: with none it uses its own
    args.label = args.label or (box.model_words(args.via_claude) if args.via_claude else "a small model")
    if box.private_in(args.label):
        sys.exit("small.py: --label must be words, never an identifier")
    run = box.Run(args.run)
    todo = []
    for kept in run.all_tries():
        made = box.json_of(os.path.join(kept, "setup.json"))
        if box.is_kept(kept) or (args.arm and made["arm"] not in args.arm) or \
                (args.task and made["task"] not in args.task):
            continue
        todo.append(kept)
    box.say(f"launching {len(todo)} tries, at most {args.parallel} at once, one message and one reply each")
    signal.signal(signal.SIGTERM, stop_all)
    signal.signal(signal.SIGINT, stop_all)
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.parallel)) as pool:
        done = list(pool.map(lambda k: launch_one(run, args, k), todo))
    box.say(f"{done.count('kept')} kept, {done.count('did not run')} did not run, "
            f"{done.count('did not fit')} did not fit")


def prompt(args):
    run = box.Run(args.run)
    kept = run.try_dir(args.arm, args.task, args.n)
    if not os.path.exists(os.path.join(kept, "setup.json")):
        sys.exit(f"small.py: {kept} is not set up; run box.py setup first")
    message = message_of(run, kept)
    sys.stdout.write(message)
    sys.stdout.flush()
    print(f"\n[{len(message.encode())} bytes, about {estimate(message)} tokens (bytes / 3.5, an estimate)]",
          file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="what", required=True)
    one = sub.add_parser("launch")
    one.add_argument("run")
    one.add_argument("--base-url"), one.add_argument("--model"), one.add_argument("--api-key-env")
    one.add_argument("--via-claude", metavar="MODEL")
    one.add_argument("--arm", action="append"), one.add_argument("--task", action="append")
    one.add_argument("--parallel", type=int, default=2), one.add_argument("--timeout", type=int, default=900)
    one.add_argument("--temperature", type=float), one.add_argument("--max-tokens", type=int)
    one.add_argument("--context-limit", type=int)
    one.add_argument("--label", help='the model in words, kept in record.json (default "a small model")')
    one.add_argument("--system", nargs="?", const=box.SYSTEM, default=None,
                     help="send a system message: the one line box.py uses, or TEXT")
    one.add_argument("--raw")
    one.set_defaults(go=launch)
    one = sub.add_parser("prompt")
    one.add_argument("run"), one.add_argument("--arm", required=True), one.add_argument("--task", required=True)
    one.add_argument("--n", type=int, required=True)
    one.set_defaults(go=prompt)
    args = parser.parse_args()
    args.go(args)


if __name__ == "__main__":
    main()

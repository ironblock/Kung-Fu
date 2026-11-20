#!/usr/bin/env python3
"""Runs where the subject is sent one message and gives one reply: a small model behind an OpenAI-compatible
chat endpoint, which may have no tool calls and a bounded context.

    small.py launch RUN --base-url URL --model NAME [--api-key-env VAR] [--arm A ...] [--task T ...]
                        [--parallel 1] [--timeout 900] [--temperature T] [--max-tokens N]
                        [--context-limit TOKENS] [--extra JSON] [--again-cut-off] [--label WORDS]
                        [--system [TEXT]] [--raw DIR]
    small.py launch RUN --via-claude MODEL [the same options, less those of the endpoint]
    small.py prompt RUN --arm A --task T --n N
    small.py selfcheck

RUN is a run's directory that `box.py setup RUN` has set up. Its arms give "model": "small", so that
`box.py launch` leaves them alone. Each try is kept in `RUN/tries/<arm>/<task>/<n>/`, in the layout box.py
uses, so that `box.py grade`, `tally`, `compare` and `answers` work on the run as they are.

The message. One message per try, built like this:

    the try's request.md, with its box path left as it is;
    then a blank line and the line that stands over the files: "You cannot open files or run anything from
    where you are, so here is each of those files, whole:" (the runs up to 2026-11-17 had "Here are the files
    in the app that matter:"; --message-form 1 gives that line again, and record.json says which was sent);
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

The size of a message in tokens is an estimate: its bytes divided by 3.5. It is not the model's count.
--context-limit counts the message and the room for the reply together: a try fits when the message's estimate
plus --max-tokens is at most the limit. So --context-limit without --max-tokens is refused. A try that does not
fit is not sent. It is written down as "did not fit" in did-not-fit.json beside its setup.json, with both
numbers, counted in the launch summary and shown by `box.py tally`. It is not kept, and a later launch with a
larger limit sends it.

What is sent to the sampler. --temperature and --max-tokens are sent when they are given, and record.json holds
each value. One that was not given is not sent, and record.json says "not sent: the server's own value applies"
in its place. --extra '<JSON object>' is merged into the request body, for a server's own switches, such as
top_p, a seed, or turning reasoning on or off. It is written into record.json too. It may not carry "model",
"messages" or "stream", which small.py sends itself, nor any name that holds "key" or "authorization". Give
temperature and max_tokens (or max_completion_tokens) with their own options, not in --extra.

--parallel is 1 by default. A self-hosted server often has one slot. A second request waits there, and its
timeout runs while it waits. A request that times out may go on running on the server. Set --parallel to the
server's slots.

The reply. A FILE line that stands as the first line inside its fence is taken as that file's, and counted.
First the reply's reasoning is taken out of the content. Some servers give a model's reasoning in its own
field ("reasoning_content" or "reasoning"). Others leave it in the content, between <think> and </think>, and a
model often drafts its file there. Each <think>...</think> block is taken out. Then, if a </think> is left, all
before it is reasoning too: the opening tag was in the prompt. Else, if a <think> is left, the reply ended
inside its reasoning, and all after it is reasoning. parse_reply does this itself, so every caller gets it,
and it returns the files, the report, what was counted, and the reasoning. record.json counts "reasoning blocks
taken out of the content", "bytes of reasoning taken out", "only a closing tag" and "ended inside its
reasoning", so that a file whose own text holds <think> is seen. steps.json keeps the reasoning whole, under
"reasoning": the server's field first, then what was taken out of the content. record.json says under
"reasoning kept from" which of the two it came from.

The files are looked for in what is left. Each line "FILE: app/<path>" followed by a fenced block is a file. Two other forms of the path are
taken and counted: the box's own path, which the request names (<box>/app/<path>), and a path from inside the
app with no "app/" before it. Blank lines may stand between
the two, and the line may be wrapped in `*` or backticks. The block closes at the first line that is only a
fence of the same character, at least as long. These are counted in record.json, and nothing is written for
them: a path that does not start with app/ or leaves it; a FILE line with no block after it; a fence that is
never closed. When one path has two blocks, the last one wins, and the path is listed under "written twice".
A FILE line may also sit in a fence of its own, with the file's block after that fence: the block after it is
taken, and counted under "file lines in a fence of their own". Whether the fence before the FILE line opens one
is read from the end of the last block taken, so the closing fence of an example in the prose opens nothing. Up to 2026-11-19 the reader took the closing fence of
the FILE line's own fence as the file's opening one, so the file began with a fence. Two kept tries came out so,
both in 2026-11-17-effort-ladder: names-low/B6/2 and names-low/C5/3. `small.py selfcheck` reads made-up replies,
this shape among them, and fails when one comes out otherwise.
A reply with no file is a kept try with no files: it fails its check, and that is data, not an error. So is a
reply that ended inside its reasoning with a finish reason other than "length": record.json then says "ended
inside its reasoning". (Files before its opening tag would still be taken; in the shapes tried there were
none.) report.txt is the text left after the reasoning is taken out, from after the last file block (all of it
when it has none).

A reply that ended with the finish reason "length" was cut off by its length limit. It is not an answer: not a
failure of the text and not a pass. It is kept and marked "cut off by its length limit" in record.json.
`box.py tally` and `compare` leave it out of the passes, as a spoiled try is left out, and tally counts it in
its arm's line as "cut off N" and says so in its first line. `small.py launch RUN --again-cut-off` launches each
cut-off try again, with whatever --max-tokens is given now. Each counts as a relaunch, and the earlier raw files
are kept under a launch<N>- name, as for any relaunch; setup.json lists each time under "cut off, launched
again". An arm with more tries cut off is not thereby better. Its count stands beside its passes.

What is kept, beside request.md (unchanged) and setup.json: sent.md (the whole message as sent), app/ (the
files of the reply, written into the box's app and kept from it as box.py keeps a subject's files),
report.txt, steps.json (one step: the reply's whole text, its reasoning, and the files it carried), and
record.json (the model in the words of --label, never an identifier; the endpoint's token counts where its
"usage" gives them, else an estimate marked as one; seconds; what was sent to the sampler; whether the reply
was cut off by its length limit; what was counted in the reply; "one shot": true; the context limit and the
message's size). Every kept file passes box.py's privacy scan first. The raw request
and response go to RAW/<run>/<arm>/<task>/<n>/ (the "raw" path of bench/box.local.json), outside the
repository; the API key is never written. A try whose request fails, times out, or comes back with no choice
is not kept. It is written down in setup.json under "did not run", and the same command launches it again,
counted as a relaunch. Nothing is retried on its own.

Edits (added 2026-11-20). When the run's run.json gives "reply": "edits", the message ends by asking for the
change as edits against the file as it is, and the reply's edits are applied to the box's app before it is kept.
An edit is a line `EDIT: app/<path>` and then, between a line `<<<<<<< SEARCH` and a line `=======`, the text to
find, and from there to a line `>>>>>>> REPLACE` the text to put in its place. The text to find must be in the
file exactly once, or the edit is refused; nothing is forgiven, not a space. A refused edit leaves the file as it
was and the edits after it are still tried. An empty text to find adds the other text at the end of the file. A
whole file may still be given by a FILE line; it is written first, and then the edits are applied in their order.
record.json holds what the reply held ("edits", "a whole file", "edits and a whole file" or "nothing"), what came
of each edit, and "the patch applies": the reply held an edit or a file and no edit was refused. For a refused
edit it also says how often its text is found when spaces at the ends of lines and blank lines are not counted;
that is for reading, and changes no file. An arm's "holds" (box.py's docstring) puts the task's holds/<name>.md
into the message in place of the task's files, with no line over it: the text carries its own.

--via-claude MODEL sends the same message through the local `claude` program, with no tools, in an empty
temporary directory:

    <message> | env -u CLAUDE_CODE_USER_EMAIL claude -p --system-prompt "<the one line>"
      --settings '{"attribution":{"commit":"","pr":""}}' --setting-sources "" --strict-mcp-config
      --model MODEL --effort medium --tools "" --permission-mode default --output-format json
      --no-session-persistence

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

# The line that stands over the files. Form 1 was used up to 2026-11-17. With it, and a request that says
# "Read them first", a small model three times in 276 tries tried to open the files with a tool it did not
# have. Form 2 says that nothing can be opened and that the files are given whole.
LEADS = {1: "Here are the files in the app that matter:",
         2: "You cannot open files or run anything from where you are, so here is each of those files, whole:"}
MESSAGE_FORM = 2
TAIL = ("Reply with every file you write or change, each as a line 'FILE: app/<path>' followed by its whole "
        "content in one fenced block. After the files, tell me in a sentence or two what you did, and say if there "
        "was anything you were not sure of.")
# The end of the message when the run's run.json gives "reply": "edits" (added 2026-11-20). The change is asked
# for as edits against the file as it is, in the search-and-replace form; a whole file may still be written.
TAIL_EDITS = ("Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced "
              "block of this form:\n\n"
              "```\n<<<<<<< SEARCH\ntext that is in the file now, copied exactly\n=======\n"
              "the text to put in its place\n>>>>>>> REPLACE\n```\n\n"
              "The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are "
              "applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at "
              "the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its "
              "whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say "
              "if there was anything you were not sure of.")
BYTES_PER_TOKEN = 3.5
RUNNING, STOPPING = set(), threading.Event()


def reply_form(run):
    form = run.cfg.get("reply", "files")
    assert form in ("files", "edits"), f"run.json: \"reply\" must be \"files\" or \"edits\", not {form!r}"
    return form


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


def message_of(run, kept, form=MESSAGE_FORM):
    made = box.json_of(os.path.join(kept, "setup.json"))
    parts = [box.text_of(os.path.join(kept, "request.md")).rstrip("\n")]
    held = made.get("holds")
    if held:
        # The arm says what its reader holds of the task's file: that text stands in place of the files, with
        # its own first line and no other. It must be the text that was there at setup.
        if made["files"]:
            raise box.TextChanged("an arm with \"holds\" may hand over no other file")
        path = box.task_file(run.set, made["task"], os.path.join("holds", held["name"] + ".md"))
        if not os.path.isfile(path) or box.sha256(path) != held["sha256"]:
            raise box.TextChanged(f"holds/{held['name']}.md is not the one that was there at setup")
        parts.append(box.text_of(path).rstrip("\n"))
        files = []
    else:
        files = files_for(run, made)
    if files:
        parts.append(LEADS[form])
        for rel, content in files:
            body = content if content.endswith("\n") or not content else content + "\n"
            fence = fence_for(content)
            parts.append(f"FILE: app/{rel}\n{fence}\n{body}{fence}")
    parts.append(TAIL_EDITS if reply_form(run) == "edits" else TAIL)
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


# Reasoning stands between <think> and </think>, or <thinking> and </thinking>, in any letter case.
THINK = re.compile(r"<(think|thinking)>.*?</\1>", re.DOTALL | re.IGNORECASE)
THINK_OPENS = re.compile(r"<(?:think|thinking)>", re.IGNORECASE)
THINK_CLOSES = re.compile(r"</(?:think|thinking)>", re.IGNORECASE)


def split_reasoning(text):
    """The content with its reasoning taken out, and the reasoning.

    A second session's twelve lines, tried on seven shapes of reply, and widened by the designer to a second
    tag name and to any letter case. It looks at tags and nothing else, so a kept file whose own text holds
    such a tag would lose text to it; record.json and `box.py tally` count the two shapes where that can
    happen ("only a closing tag", "ended inside its reasoning"), so that it is seen."""
    found = [m.group(0) for m in THINK.finditer(text)]
    rest = THINK.sub("", text)
    closes, opens = THINK_CLOSES.search(rest), THINK_OPENS.search(rest)
    if closes:      # the opening tag was in the prompt, so only the closing one is in the reply
        found.append(rest[:closes.start()])
        rest = rest[closes.end():]
    elif opens:     # the reply ended inside its reasoning
        found.append(rest[opens.end():])
        rest = rest[:opens.start()]
    return rest.lstrip("\n"), "\n".join(found)


def own_fence(lines, end, i, j):
    """Where the file's block opens when the FILE line at i sits in a fence of its own, else None.

    That is: the last line before it that is not blank opens a fence, after the last block already taken (end);
    line j, the next line that is not blank, is only a fence that closes that one; and the next line after j
    that is not blank opens a fence. Whether a fence line opens or closes is read from end on: one that closes
    an earlier block, such as an example in the prose, opens nothing (mended 2026-11-19, after a review)."""
    before = i - 1
    while before >= end and not lines[before].strip():
        before -= 1
    if before < end or j >= len(lines):
        return None
    mark, opened_at = None, None
    for n in range(end, i):
        if mark is None:
            found = OPEN.match(lines[n])
            if found:
                mark, opened_at = found.group(1), n
        elif re.fullmatch(r"\s*" + re.escape(mark[0]) + "{" + str(len(mark)) + r",}\s*", lines[n]):
            mark, opened_at = None, None
    if mark is None or opened_at != before:
        return None
    if not re.fullmatch(r"\s*" + re.escape(mark[0]) + "{" + str(len(mark)) + r",}\s*", lines[j]):
        return None
    after = j + 1
    while after < len(lines) and not lines[after].strip():
        after += 1
    return after if after < len(lines) and OPEN.match(lines[after]) else None


def parse_reply(text, box_path=None):
    """{path in app: content}, the report, what was counted, and the reasoning taken out of the content.

    The reasoning is taken out first, by split_reasoning, and the files are looked for in what is left."""
    text = (text or "").replace("\r\n", "\n")
    whole = [m.group(0) for m in THINK.finditer(text)]
    left = THINK.sub("", text)
    only_closing = bool(THINK_CLOSES.search(left))
    ended_inside = not only_closing and bool(THINK_OPENS.search(left))
    text, reasoning = split_reasoning(text)
    lines = text.split("\n")
    files, order = {}, []
    counted = {"refused paths": [], "file lines with no block": 0, "unclosed fences": 0, "written twice": [],
               "paths given with the box": 0, "paths given without app/": 0, "file lines inside their fence": 0,
               "file lines in a fence of their own": 0,
               "reasoning blocks taken out of the content": len(whole) + (only_closing or ended_inside),
               "bytes of reasoning taken out": len(reasoning.encode()),
               "only a closing tag": only_closing, "ended inside its reasoning": ended_inside,
               "nothing outside its reasoning": bool(reasoning) and not text.strip()}
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
        inside = False
        own = own_fence(lines, end, i, j)
        if own is not None:
            # The FILE line sits in a fence of its own, and the file's block follows: take that block. Mended
            # 2026-11-19: before, the closing fence of the FILE line's own fence was taken as the file's opening
            # one, and the file began with the real opening fence.
            counted["file lines in a fence of their own"] += 1
            j = own
            opened = OPEN.match(lines[j])
        if not opened:
            # The FILE line may stand as the first line inside its fence. That is taken, and counted: a right
            # file lost to where one line stood would measure the keeping of a form.
            before = i - 1
            while before >= 0 and not lines[before].strip():
                before -= 1
            opened = OPEN.match(lines[before]) if before >= 0 else None
            inside = bool(opened)
            j = i
        if not opened:
            counted["file lines with no block"] += 1
            i += 1
            continue
        if inside:
            counted["file lines inside their fence"] += 1
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
    return {p: files[p] for p in order}, report, counted, reasoning


# ------------------------------------------------------------------------------------------------ the edits

EDIT_LINE = re.compile(r"^[\s*_`#>]*EDIT:\s*`?([^`*]+?)`?[\s*_]*$")
SEARCH_LINE = re.compile(r"^\s*<{5,9}\s*SEARCH\s*$")
DIVIDER_LINE = re.compile(r"^\s*={5,9}\s*$")
REPLACE_LINE = re.compile(r"^\s*>{5,9}\s*REPLACE\s*$")
FENCE_LINE = re.compile(r"^\s*(`{3,}|~{3,})\s*$")


def parse_edits(text, box_path=None, only_file=None):
    """The edits of a reply, in order, what was counted, and the line after the last one.

    The reasoning must be out of the text already. An edit is a line `<<<<<<< SEARCH`, the text to find, a line
    `=======`, the text to put in its place, and a line `>>>>>>> REPLACE`; five to nine of each mark are taken.
    Its file is the one the last `EDIT: app/<path>` line before it names, in the forms where_in_app takes. An edit
    with no EDIT line before it is given to `only_file`, the task's one file, and counted: a right patch lost to
    a missing line would measure the keeping of a form. The first `=======` after SEARCH divides, so a text to put
    in that itself holds such a line cannot be given; the set's files hold none. Fences are not looked at: the
    marks carry the edit, whether a fence stands around one edit, around several, or around none.

    The two texts are the lines between the marks, joined by newlines, with no newline at the end. So the text to
    find is looked for as it stands, wherever in a line it begins or ends."""
    lines = (text or "").replace("\r\n", "\n").split("\n")
    edits, path, end = [], None, 0
    counted = {"edit lines": 0, "refused edit paths": [], "edits with no EDIT line": 0, "edits not closed": 0}
    i = 0
    while i < len(lines):
        named = EDIT_LINE.match(lines[i])
        if named:
            counted["edit lines"] += 1
            rel = where_in_app(named.group(1), box_path)
            if rel is None:
                counted["refused edit paths"].append(named.group(1).strip()[:200])
            path = rel
            i += 1
            continue
        if not SEARCH_LINE.match(lines[i]):
            i += 1
            continue
        j = next((n for n in range(i + 1, len(lines)) if DIVIDER_LINE.match(lines[n])), None)
        k = next((n for n in range(j + 1, len(lines)) if REPLACE_LINE.match(lines[n])), None) if j is not None else None
        if k is None:
            counted["edits not closed"] += 1
            break
        where = path
        if where is None and not counted["edit lines"] and only_file:
            where = only_file
            counted["edits with no EDIT line"] += 1
        if where is not None:
            edits.append({"path": where, "search": "\n".join(lines[i + 1:j]), "replace": "\n".join(lines[j + 1:k])})
        elif not counted["edit lines"]:
            counted["edits with no EDIT line"] += 1
        end = i = k + 1
        if end < len(lines) and FENCE_LINE.match(lines[end]):
            end += 1  # the fence that closes the block the edit stood in
    return edits, counted, end


def squeezed(text):
    """The text with each line's spaces at both ends gone, and its blank lines gone: for reading only."""
    return "\n".join(line.strip() for line in text.split("\n") if line.strip())


def apply_edits(app, edits):
    """Apply each edit to its file under `app`, in order, and say what came of each.

    The text to find must be in the file exactly once. Nothing is forgiven. A refused edit leaves the file as it
    was, and the edits after it are still tried. An empty text to find adds the other text at the end of the file,
    on a line of its own, and makes the file when it is not there. Each outcome also says whether a refused edit
    would have been applied had the spaces at the ends of lines and the blank lines not counted; that changes no
    file."""
    out = []
    for edit in edits:
        target = os.path.join(app, edit["path"])
        search, replace = edit["search"], edit["replace"]
        said = {"path": edit["path"], "search bytes": len(search.encode()), "replace bytes": len(replace.encode()),
                "search lines": search.count("\n") + 1 if search else 0}
        there = os.path.isfile(target)
        text = box.text_of(target).replace("\r\n", "\n") if there else ""
        if not search.strip():
            body = replace if replace.endswith("\n") else replace + "\n"
            text = text + ("" if text.endswith("\n") or not text else "\n") + body
            said["outcome"] = "added at the end" if there else "made the file"
        elif not there:
            said["outcome"] = "no such file"
        else:
            found = text.count(search)
            if found == 1:
                text = text.replace(search, replace, 1)
                said["outcome"] = "applied"
            else:
                said["outcome"] = "no such text" if not found else f"found {found} times"
                loose = squeezed(text).count(squeezed(search)) if squeezed(search) else 0
                said["found with spaces and blank lines not counted"] = loose
        if said["outcome"] in ("applied", "added at the end", "made the file"):
            try:
                os.makedirs(os.path.dirname(target), exist_ok=True)
                box.write_text(target, text)
            except OSError:
                said["outcome"] = "could not be written"
        out.append(said)
    return out


APPLIED = ("applied", "added at the end", "made the file")


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
    body.update(args.extra or {})
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
    # The message goes on standard input, not as an argument: one argument may hold at most 128 KB on Linux, and
    # a message with a library's source in it is larger. Changed 2026-11-18; the program reads the same prompt.
    return ["claude", "-p", "--system-prompt", args.system,
            "--settings", '{"attribution":{"commit":"","pr":""}}', "--setting-sources", "", "--strict-mcp-config",
            "--model", args.via_claude, "--effort", "medium", "--tools", "", "--permission-mode", "default",
            "--output-format", "json", "--no-session-persistence"]


def send_claude(args, message, raw):
    command = claude_command(args, message)
    box.write_json(os.path.join(raw, "request.json"), {"command": command, "message on standard input": message})
    env = {k: v for k, v in os.environ.items() if k != "CLAUDE_CODE_USER_EMAIL"}
    start = time.time()
    with tempfile.TemporaryDirectory(prefix="one-shot-") as empty:
        with open(os.path.join(raw, "response.json"), "w") as out, open(os.path.join(raw, "stderr.txt"), "w") as err:
            process = subprocess.Popen(command, cwd=empty, env=env, stdin=subprocess.PIPE, stdout=out, stderr=err)
            RUNNING.add(process)
            try:
                process.stdin.write(message.encode())
                process.stdin.close()
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

NOT_SENT = "not sent: the server's own value applies"


def did_not_fit(kept, args, size, tokens):
    box.write_json(os.path.join(kept, box.DID_NOT_FIT), {
        "at": now(), "context limit": args.context_limit, "message bytes": size,
        "message tokens, estimated as bytes / 3.5": tokens, "max tokens, the room for the reply": args.max_tokens,
        "the two together": tokens + args.max_tokens})


def again_cut_off(kept):
    """Take a kept try that was cut off by its length limit back to not kept, so that it is launched again.
    setup.json lists each time, with the earlier record's finish reason and output tokens."""
    made = box.json_of(os.path.join(kept, "setup.json"))
    record = box.json_of(os.path.join(kept, "record.json"))
    made.setdefault("cut off, launched again", []).append({
        "at": now(), "finish reason": record.get("finish reason"), "max tokens": record.get("max tokens"),
        "output tokens": (record.get("tokens") or {}).get("output")})
    for name in ("app",) + box.KEPT_FILES:
        target = os.path.join(kept, name)
        if os.path.isdir(target):
            shutil.rmtree(target)
        elif os.path.exists(target):
            os.remove(target)
    box.write_json(os.path.join(kept, "setup.json"), made)


def launch_one(run, args, kept):
    """'kept', 'did not run' or 'did not fit'."""
    made = box.json_of(os.path.join(kept, "setup.json"))
    arm, task, n = made["arm"], made["task"], made["n"]
    where = f"{arm}/{task}/{n}"
    try:
        message = message_of(run, kept, args.message_form)
    except box.TextChanged as err:
        box.say(f"not launched {where}: {err}")
        return "did not run"
    if os.path.exists(os.path.join(kept, "sent.md")):
        os.remove(os.path.join(kept, "sent.md"))  # left by an earlier launch that was not kept, or forgotten
    size, tokens = len(message.encode()), estimate(message)
    if args.context_limit is not None and tokens + args.max_tokens > args.context_limit:
        did_not_fit(kept, args, size, tokens)
        box.say(f"did not fit {where}: the message is about {tokens} tokens (bytes / 3.5), and with "
                f"{args.max_tokens} for the reply that is {tokens + args.max_tokens}; the limit is {args.context_limit}")
        return "did not fit"
    if STOPPING.is_set():
        return "did not run"  # never sent, so not counted as a launch
    raw = run.raw_dir(args, arm, task, n)
    os.makedirs(raw, exist_ok=True)
    before = made.get("launches", len(made["did not run"]))
    if before:
        if before > len(made["did not run"]) + len(made.get("forgotten", [])) + \
                len(made.get("cut off, launched again", [])):
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
    files, report, counted, reasoning = parse_reply(got["text"], made["box"])
    if got["reasoning"] and not (got["text"] or "").strip():
        counted["nothing outside its reasoning"] = True  # all of its text was in the server's reasoning field
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
    patch = None
    if reply_form(run) == "edits":
        # A whole file of the reply is written first, then its edits are applied in their order.
        patch = patch_of(run, made, got["text"], app, written)
        if patch["report"] is not None:
            report = patch.pop("report")
        else:
            patch.pop("report")
    record = {
        "model": args.label, "one shot": True, "message form": args.message_form,
        "sent through": "the local claude program, with no tools" if args.via_claude else
        "an OpenAI-compatible chat endpoint",
        "system message": args.system,
        "temperature": NOT_SENT if args.temperature is None else args.temperature,
        "max tokens": NOT_SENT if args.max_tokens is None else args.max_tokens,
        "extra in the request body": args.extra or {},
        "context limit": args.context_limit,
        "message": {"bytes": size, "tokens, estimated as bytes / 3.5": tokens},
        "message and room for the reply, estimated": None if args.max_tokens is None else tokens + args.max_tokens,
        "turns": got["turns"], "messages": 1,
        "tokens": dict({"first request": got["tokens"].get("input")}, **got["tokens"]),
        "cost in dollars, as the stream reports it": got["cost"],
        "seconds": got["seconds"], "wall seconds": round(time.time() - start, 1),
        "finish reason": got["finish reason"], "cut off by its length limit": got["cut off"],
        "files in the reply": written, **counted,
        "reasoning text in the reply": bool(got["reasoning"] or reasoning),
        "reasoning kept from": " and ".join(w for w, r in (("the server's own field", got["reasoning"]),
                                                          ("the content, between <think> and </think>", reasoning))
                                            if r) or "none: the reply held no reasoning",
        "played by hand": False, "spoiled": False,
        "detectors": {"read outside the box": [], "named a path outside the box": [],
                      "wrote outside app": counted["refused paths"]},
    }
    if made.get("holds"):
        record["holds"] = made["holds"]
    if patch is not None:
        record.update(patch)
    if "files left in the empty directory" in got:
        record["files left in the empty directory"] = got["files left in the empty directory"]
    if os.path.exists(os.path.join(kept, box.DID_NOT_FIT)):
        record["did not fit before"] = box.json_of(os.path.join(kept, box.DID_NOT_FIT))
    step = {"message": 1, "text": [got["text"]], "reasoning": [r for r in (got["reasoning"], reasoning) if r],
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
            + (", ENDED INSIDE ITS REASONING" if counted["ended inside its reasoning"] else "")
            + (f", reasoning {counted['bytes of reasoning taken out']} bytes taken out of the content"
               if counted["reasoning blocks taken out of the content"] else "")
            + (f", relaunch {before}" if before else "")
            + (f", refused {len(counted['refused paths'])}" if counted["refused paths"] else "")
            + (f", unclosed {counted['unclosed fences']}" if counted["unclosed fences"] else "")
            + (f", twice {len(counted['written twice'])}" if counted["written twice"] else ""))
    return "cut off" if record["cut off by its length limit"] else "kept"


def patch_of(run, made, reply, app, written):
    """For a run whose reply is edits: read the reply's edits, apply them under `app`, and give what goes into
    record.json. "the patch applies" is true when the reply holds an edit or a whole file and no edit was refused.
    "report" is the text after the last edit when that comes after the last file, else None."""
    text, _ = split_reasoning((reply or "").replace("\r\n", "\n"))
    only = box.text_of(box.task_file(run.set, made["task"], "file.txt")).strip() \
        if os.path.exists(box.task_file(run.set, made["task"], "file.txt")) else None
    edits, counted, end = parse_edits(text, made["box"], only)
    outcomes = apply_edits(app, edits)
    refused = [o for o in outcomes if o["outcome"] not in APPLIED]
    lines = text.split("\n")
    after_files = parse_reply(reply, made["box"])[1]
    after_edits = "\n".join(lines[end:]).strip() if edits else None
    report = after_edits if after_edits is not None and len(after_edits) <= len(after_files) else None
    return {"reply asked for as": "edits",
            "what the reply holds": ("edits and a whole file" if edits and written else "edits" if edits else
                                     "a whole file" if written else "nothing"),
            "edits": outcomes, "edits in the reply": len(edits), "edits applied": len(edits) - len(refused),
            "edits refused": len(refused), "the patch applies": bool(edits or written) and not refused,
            **counted, "report": report}


def extra_of(given):
    """--extra: a JSON object merged into the request body. It may not carry what small.py sends itself."""
    if given is None:
        return {}
    try:
        extra = json.loads(given)
    except ValueError as err:
        sys.exit(f"small.py: --extra is not JSON: {err}")
    if not isinstance(extra, dict):
        sys.exit("small.py: --extra must be a JSON object, such as '{\"top_p\": 0.9}'")

    def names(value):
        if isinstance(value, dict):
            for k, v in value.items():
                yield str(k)
                yield from names(v)
        elif isinstance(value, list):
            for v in value:
                yield from names(v)
    for name in names(extra):
        if "key" in name.lower() or "authorization" in name.lower():
            sys.exit(f"small.py: --extra may not carry {name!r}: a key or an authorization would be written into "
                     "record.json and the raw request")
    for name in ("model", "messages", "stream"):
        if name in extra:
            sys.exit(f"small.py: --extra may not carry {name!r}: small.py sends it itself")
    for name, flag in (("temperature", "--temperature"), ("max_tokens", "--max-tokens"),
                       ("max_completion_tokens", "--max-tokens")):
        if name in extra:
            sys.exit(f"small.py: give {name} with {flag}, not in --extra, so that the record and the context "
                     "limit see it")
    return extra


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
    if args.via_claude and (args.temperature is not None or args.max_tokens is not None or args.api_key_env
                            or args.extra):
        sys.exit("small.py: --temperature, --max-tokens, --extra and --api-key-env are for an endpoint, "
                 "not --via-claude")
    if args.max_tokens is not None and args.max_tokens < 1:
        sys.exit("small.py: --max-tokens must be at least 1: it is the room for the reply")
    if args.context_limit is not None and args.max_tokens is None:
        sys.exit("small.py: --context-limit needs --max-tokens, because the reply must fit in the context too: "
                 "a try fits when the message's estimate plus --max-tokens is at most the limit")
    args.extra = extra_of(args.extra)
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
    todo, again = [], 0
    for kept in run.all_tries():
        made = box.json_of(os.path.join(kept, "setup.json"))
        if (args.arm and made["arm"] not in args.arm) or (args.task and made["task"] not in args.task):
            continue
        if box.is_kept(kept):
            if not (args.again_cut_off and box.json_of(os.path.join(kept, "record.json")).get(
                    "cut off by its length limit")):
                continue
            again_cut_off(kept)
            again += 1
        todo.append(kept)
    box.say(f"launching {len(todo)} tries" + (f", {again} of them cut off before and launched again" if again else "")
            + f", at most {args.parallel} at once, one message and one reply each"
            + (f"; a try fits when the message's estimate plus {args.max_tokens} for the reply is at most "
               f"{args.context_limit}" if args.context_limit is not None else ""))
    signal.signal(signal.SIGTERM, stop_all)
    signal.signal(signal.SIGINT, stop_all)
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.parallel)) as pool:
        done = list(pool.map(lambda k: launch_one(run, args, k), todo))
    box.say(f"{done.count('kept') + done.count('cut off')} kept, of them {done.count('cut off')} cut off by "
            f"their length limit, {done.count('did not run')} did not run, {done.count('did not fit')} did not fit"
            + (f" (the message's estimate plus {args.max_tokens} for the reply over {args.context_limit})"
               if done.count("did not fit") else ""))


def prompt(args):
    run = box.Run(args.run)
    kept = run.try_dir(args.arm, args.task, args.n)
    if not os.path.exists(os.path.join(kept, "setup.json")):
        sys.exit(f"small.py: {kept} is not set up; run box.py setup first")
    message = message_of(run, kept, args.message_form)
    sys.stdout.write(message)
    sys.stdout.flush()
    print(f"\n[{len(message.encode())} bytes, about {estimate(message)} tokens (bytes / 3.5, an estimate)]",
          file=sys.stderr)


# Made-up replies, each with the files the reader must take from it. `small.py selfcheck` reads each and stops at
# the first that comes out otherwise. Added 2026-11-19, with the case of a FILE line in a fence of its own.
CASES = [
    ("a file in its block",
     "FILE: app/src/a.ts\n```ts\nexport const a = 1;\n```\nI wrote it.",
     {"src/a.ts": "export const a = 1;\n"}, "I wrote it."),
    ("a FILE line in a fence of its own (2026-11-17-effort-ladder, names-low/C5/3)",
     "The answer.\n\n```\nFILE: app/notes/same-frame.json\n```\n```json\n{ \"rejects\": false }\n```\n\nDone.",
     {"notes/same-frame.json": "{ \"rejects\": false }\n"}, "Done."),
    ("a FILE line in a fence of its own, blank lines between, a longer fence",
     "````text\nFILE: app/src/b.ts\n\n````\n\n```ts\nconst b = 2;\n```",
     {"src/b.ts": "const b = 2;\n"}, ""),
    ("a FILE line as the first line inside its fence",
     "```ts\nFILE: app/src/c.ts\nconst c = 3;\n```",
     {"src/c.ts": "const c = 3;\n"}, ""),
    ("two files one after the other: the closing fence of the first opens nothing",
     "FILE: app/a.ts\n```ts\na\n```\nFILE: app/b.ts\n```ts\nb\n```\nok",
     {"a.ts": "a\n", "b.ts": "b\n"}, "ok"),
    ("a file whose block holds a fenced block of its own",
     "FILE: app/README.md\n````md\n```\nx\n```\n````",
     {"README.md": "```\nx\n```\n"}, ""),
    ("a draft in the reasoning is not taken",
     "<think>FILE: app/a.ts\n```ts\ndraft\n```</think>FILE: app/a.ts\n```ts\nfinal\n```",
     {"a.ts": "final\n"}, ""),
    # The next two were added 2026-11-19 after a review: the closing fence of an example in the prose opens
    # nothing, so the FILE line after it is not in a fence of its own.
    ("an example block, then an empty file, then a file",
     "Layout:\n```\napp/\n```\nFILE: app/.gitkeep\n```\n```\n\nFILE: app/src/a.ts\n```ts\nexport const a = 1;\n```\nDone.",
     {".gitkeep": "", "src/a.ts": "export const a = 1;\n"}, "Done."),
    ("an example block, then a file in a longer fence that begins with a code block",
     "Run it with:\n```\nnpm test\n```\nFILE: app/README.md\n````\n```bash\nnpm i\n```\n````\nDone.",
     {"README.md": "```bash\nnpm i\n```\n"}, "Done."),
]


# Made-up replies that hold edits (added 2026-11-20): the file as it starts, the reply, the file as it must end,
# and what must come of each edit. The file is always app/src/a.ts.
START = "const a = 1;\nconst b = 2;\n\nexport function sum(): number {\n    return a + b;\n}\n"
E = "<<<<<<< SEARCH\n{}\n=======\n{}\n>>>>>>> REPLACE"
EDIT_CASES = [
    ("one edit in its fence",
     "EDIT: app/src/a.ts\n```\n" + E.format("    return a + b;", "    return a + b + 1;") + "\n```\nDone.",
     START.replace("a + b;", "a + b + 1;"), ["applied"], "Done."),
    ("two edits under one EDIT line, in one fence, and a typed fence",
     "EDIT: app/src/a.ts\n```ts\n" + E.format("const a = 1;", "const a = 10;") + "\n"
     + E.format("const b = 2;", "const b = 20;") + "\n```",
     START.replace("= 1;", "= 10;").replace("= 2;", "= 20;"), ["applied", "applied"], ""),
    ("no fence at all, and the path given without app/",
     "EDIT: src/a.ts\n" + E.format("const a = 1;", "const a = 3;") + "\nI changed a.",
     START.replace("= 1;", "= 3;"), ["applied"], "I changed a."),
    ("an edit with no EDIT line goes to the task's one file",
     "```\n" + E.format("const a = 1;", "const a = 4;") + "\n```",
     START.replace("= 1;", "= 4;"), ["applied"], ""),
    ("the text is not in the file: refused, and the next edit is still tried",
     "EDIT: app/src/a.ts\n```\n" + E.format("return a+b;", "return 0;") + "\n```\nEDIT: app/src/a.ts\n```\n"
     + E.format("const b = 2;", "const b = 5;") + "\n```",
     START.replace("= 2;", "= 5;"), ["no such text", "applied"], ""),
    ("an indent that is not the file's is not forgiven",
     "EDIT: app/src/a.ts\n```\n" + E.format("export function sum(): number {\n  return a + b;", "x") + "\n```",
     START, ["no such text"], ""),
    ("the text is there twice: refused",
     "EDIT: app/src/a.ts\n```\n" + E.format("const ", "let ") + "\n```",
     START, ["found 2 times"], ""),
    ("an empty SEARCH adds at the end",
     "EDIT: app/src/a.ts\n```\n<<<<<<< SEARCH\n=======\nexport const c = 3;\n>>>>>>> REPLACE\n```",
     START + "export const c = 3;\n", ["added at the end"], ""),
    ("an edit that begins and ends inside lines, and one that takes lines out",
     "EDIT: app/src/a.ts\n```\n" + E.format("sum(): number", "sum(c = 0): number") + "\n```\n"
     "EDIT: app/src/a.ts\n```\n<<<<<<< SEARCH\nconst b = 2;\n\n=======\n>>>>>>> REPLACE\n```",
     START.replace("sum(): number", "sum(c = 0): number").replace("const b = 2;\n", ""), ["applied", "applied"], ""),
    ("a draft in the reasoning is not applied",
     "<think>EDIT: app/src/a.ts\n```\n" + E.format("const a = 1;", "const a = 7;") + "\n```</think>"
     "EDIT: app/src/a.ts\n```\n" + E.format("const a = 1;", "const a = 8;") + "\n```",
     START.replace("= 1;", "= 8;"), ["applied"], ""),
    ("an edit never closed applies nothing",
     "EDIT: app/src/a.ts\n```\n<<<<<<< SEARCH\nconst a = 1;\n=======\nconst a = 9;\n```",
     START, [], None),
]


def selfcheck(_args=None):
    bad = 0
    for name, reply, files, report in CASES:
        got, said, _, _ = parse_reply(reply)
        if got != files or said != report:
            bad += 1
            print(f"FAILED {name}: took {got!r} and the report {said!r}; wanted {files!r} and {report!r}")
        else:
            print(f"ok     {name}")
    print(f"{len(CASES) - bad} of {len(CASES)} made-up replies read as they must be")
    wrong = 0
    for name, reply, want, outcomes, report in EDIT_CASES:
        with tempfile.TemporaryDirectory(prefix="edits-") as app:
            os.makedirs(os.path.join(app, "src"))
            box.write_text(os.path.join(app, "src", "a.ts"), START)
            text, _ = split_reasoning(reply)
            edits, _, end = parse_edits(text, None, "src/a.ts")
            came = [o["outcome"] for o in apply_edits(app, edits)]
            now_ = box.text_of(os.path.join(app, "src", "a.ts"))
            said = "\n".join(text.split("\n")[end:]).strip() if edits else None
        if now_ != want or came != outcomes or said != report:
            wrong += 1
            print(f"FAILED {name}: outcomes {came!r}, report {said!r}, file {now_!r}; wanted {outcomes!r}, "
                  f"{report!r}, {want!r}")
        else:
            print(f"ok     {name}")
    print(f"{len(EDIT_CASES) - wrong} of {len(EDIT_CASES)} made-up replies with edits applied as they must be")
    sys.exit(1 if bad or wrong else 0)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="what", required=True)
    one = sub.add_parser("launch")
    one.add_argument("run")
    one.add_argument("--base-url"), one.add_argument("--model"), one.add_argument("--api-key-env")
    one.add_argument("--via-claude", metavar="MODEL")
    one.add_argument("--arm", action="append"), one.add_argument("--task", action="append")
    one.add_argument("--parallel", type=int, default=1, help="set it to the server's slots (default 1)")
    one.add_argument("--timeout", type=int, default=900)
    one.add_argument("--temperature", type=float), one.add_argument("--max-tokens", type=int)
    one.add_argument("--context-limit", type=int, help="needs --max-tokens: the message and the reply must fit")
    one.add_argument("--extra", metavar="JSON", help="a JSON object merged into the request body")
    one.add_argument("--again-cut-off", action="store_true",
                     help="launch again every kept try that was cut off by its length limit")
    one.add_argument("--label", help='the model in words, kept in record.json (default "a small model")')
    one.add_argument("--message-form", type=int, choices=sorted(LEADS), default=MESSAGE_FORM,
                     help="which line stands over the files; 1 is the line of the runs up to 2026-11-17")
    one.add_argument("--system", nargs="?", const=box.SYSTEM, default=None,
                     help="send a system message: the one line box.py uses, or TEXT")
    one.add_argument("--raw")
    one.set_defaults(go=launch)
    one = sub.add_parser("prompt")
    one.add_argument("run"), one.add_argument("--arm", required=True), one.add_argument("--task", required=True)
    one.add_argument("--n", type=int, required=True)
    one.add_argument("--message-form", type=int, choices=sorted(LEADS), default=MESSAGE_FORM)
    one.set_defaults(go=prompt)
    one = sub.add_parser("selfcheck", help="read made-up replies, each with the files it must give")
    one.set_defaults(go=selfcheck)
    args = parser.parse_args()
    args.go(args)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""What a reader holds of a file it is asked to change: the texts for the arms of a patch run.

    holds.py make SET     write tasks/<task>/holds/{name,outline,region,whole}.md for every task of the set
    holds.py check SET    say whether those texts, and the rest of what a patch task needs, are as they must be
    holds.py sizes SET    the size of each text, for each task

SET is a task set that `box.py` reads, whose tasks each change one file that is there already. Such a task holds,
beside what every code task holds:

    file.txt             where the file is in the app, such as src/moorings.ts
    start.txt            the file as it starts, from the set's root, such as files/moorings.ts
    plain.ts             the file unchanged: the same bytes as the starting file. Its check must fail it.
    reference.ts         the file as a right change leaves it
    reference.edits.md   the same change as edits, in the form small.py asks a subject for
    kind.txt             one word: beside, inside or leans (the run's note says what each is)

The four texts. Each is what one arm's reader is given of the file, and each begins with the line that says so.

    name      the file's path
    outline   the path, and what `ast-grep outline --view expanded --items all` prints for the file
    region    the outline, and then the lines of each declaration the ask names
    whole     the file

Nobody writes or picks any of them. The outline is the tool's own output, unchanged, from ast-grep 0.51.2; `make`
and `check` refuse any other version, since another may print another outline. The region comes from the ask by
this rule. Take the ask's code spans, the text between single backticks outside its fenced blocks. In each, a
pair `Name.member` whose Name is declared at the file's top level and has that member gives the member's lines.
Any other word that is the name of a top-level declaration of the file (an import is not one) gives that
declaration's lines. Each run of lines is widened upward over the comment that stands directly above it. Runs that
touch or overlap are joined. When the ask names nothing the file declares, the region text is the outline text.

`check` says, for each task: whether the kept texts are what `make` would write now; whether plain.ts is the
starting file; whether the reference edits apply to the starting file, every one, and leave reference.ts byte for
byte; and whether the arm that is meant to be able to make the change can quote what the reference edits quote.
That last means: for a `beside` task, each text the reference edits look for is in the outline's lines (or is
empty, which adds at the end of the file); for an `inside` or a `leans` task, each is inside the region's lines.
It also says how many first lines the outline shows cut, that is, with a bracket left open, and it fails a
starting file that holds a line small.py would read as a mark of an edit or of a file.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

import box
import small

VERSION = "0.51.2"
KINDS = ("beside", "inside", "leans")
NAMES = ("name", "outline", "region", "whole")
LEAD = "You cannot open files or run anything from where you are."
WORD = r"[A-Za-z_$][\w$]*"


def tool():
    path = shutil.which("ast-grep")
    if not path:
        sys.exit("holds.py: no `ast-grep` program on PATH")
    said = subprocess.run([path, "--version"], capture_output=True, text=True, check=False).stdout.strip()
    if said != f"ast-grep {VERSION}":
        sys.exit(f"holds.py: the outline is ast-grep {VERSION}'s; this one says `{said}`")
    return path


def outline_of(rel, content):
    """(what the tool prints, its items) for the file, run from a directory that holds only it at `rel`."""
    program = tool()
    with tempfile.TemporaryDirectory(prefix="outline-") as app:
        os.makedirs(os.path.dirname(os.path.join(app, rel)), exist_ok=True)
        box.write_text(os.path.join(app, rel), content)
        common = [program, "outline", rel, "--items", "all", "--color", "never"]
        printed = subprocess.run(common + ["--view", "expanded"], cwd=app, capture_output=True, text=True, check=True)
        told = subprocess.run(common + ["--json=compact"], cwd=app, capture_output=True, text=True, check=True)
    files = json.loads(told.stdout)
    assert len(files) == 1, f"the tool told of {len(files)} files"
    return printed.stdout.rstrip("\n") + "\n", files[0]["items"]


def spans_of(ask):
    """The ask's code spans: between single backticks, outside its fenced blocks."""
    out, fenced = [], None
    for line in ask.split("\n"):
        mark = re.match(r"\s*(`{3,}|~{3,})", line)
        if mark and fenced is None:
            fenced = mark.group(1)
            continue
        if fenced is not None:
            if re.fullmatch(r"\s*" + re.escape(fenced[0]) + "{" + str(len(fenced)) + r",}\s*", line):
                fenced = None
            continue
        out += re.findall(r"(?<!`)`([^`\n]+)`(?!`)", line)
    return out


def widened(lines, start):
    """The first line of the comment that stands directly above line `start` (from 0), else `start`."""
    at = start
    if at > 0 and lines[at - 1].strip().endswith("*/"):
        up = at - 1
        while up >= 0 and not lines[up].lstrip().startswith("/*"):
            up -= 1
        return up if up >= 0 else start
    while at > 0 and lines[at - 1].lstrip().startswith("//"):
        at -= 1
    return at


def region_of(ask, content, items):
    """[(first, last)] lines from 0, and what named each, by the rule in the docstring."""
    lines = content.split("\n")
    top = {i["name"]: i for i in items if not i.get("isImport") and i.get("name")}
    runs, named = [], []
    for span in spans_of(ask):
        taken = set()
        for pair in re.finditer(r"(?<![\w$.])(" + WORD + r")\.(" + WORD + r")(?![\w$])", span):
            owner = top.get(pair.group(1))
            member = next((m for m in (owner or {}).get("members", []) if m.get("name") == pair.group(2)), None)
            if member:
                runs.append((member["range"]["start"]["line"], member["range"]["end"]["line"]))
                named.append(pair.group(0))
                taken.add(pair.start(1))
        for word in re.finditer(r"(?<![\w$])" + WORD, span):
            if word.group(0) in top and word.start() not in taken:
                item = top[word.group(0)]
                runs.append((item["range"]["start"]["line"], item["range"]["end"]["line"]))
                named.append(word.group(0))
    runs = sorted({(widened(lines, a), b) for a, b in runs})
    joined = []
    for a, b in runs:
        if joined and a <= joined[-1][1] + 1:
            joined[-1] = (joined[-1][0], max(joined[-1][1], b))
        else:
            joined.append((a, b))
    return joined, sorted(set(named))


def texts_of(set_dir, task):
    """{name: text} for the task, and what `check` wants to know of it."""
    rel = box.text_of(box.task_file(set_dir, task, "file.txt")).strip()
    content = box.text_of(os.path.join(set_dir, box.text_of(box.task_file(set_dir, task, "start.txt")).strip()))
    ask = box.text_of(box.task_file(set_dir, task, "ask.md"))
    printed, items = outline_of(rel, content)
    runs, named = region_of(ask, content, items)
    lines = content.split("\n")
    outline = (f"{LEAD} Here is what you have of app/{rel}.\n\n"
               "Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number "
               "and the first line of a declaration or of one of its members. The rest of the file is not shown.\n\n"
               f"{small.fence_for(printed)}\n{printed}{small.fence_for(printed)}\n")
    region = outline
    for a, b in runs:
        part = "\n".join(lines[a:b + 1]) + "\n"
        fence = small.fence_for(part)
        region += f"\nLines {a + 1} to {b + 1} of the file, as they are:\n\n{fence}ts\n{part}{fence}\n"
    body = content if content.endswith("\n") else content + "\n"
    fence = small.fence_for(content)
    texts = {
        "name": f"{LEAD} All you have of the file is its path: app/{rel}.\n",
        "outline": outline,
        "region": region,
        "whole": f"{LEAD[:-1]}, so here is app/{rel}, whole:\n\nFILE: app/{rel}\n{fence}\n{body}{fence}\n",
    }
    return texts, {"rel": rel, "content": content, "printed": printed, "runs": runs, "named": named, "items": items}


def make(args):
    set_dir = os.path.abspath(args.set)
    for task in box.set_tasks(set_dir):
        texts, _ = texts_of(set_dir, task)
        os.makedirs(box.task_file(set_dir, task, "holds"), exist_ok=True)
        for name in NAMES:
            box.write_text(box.task_file(set_dir, task, os.path.join("holds", name + ".md")), texts[name])
    print(f"{len(box.set_tasks(set_dir))} tasks: {', '.join(NAMES)} written for each")


def open_brackets(line):
    """True when the line leaves a round bracket open: a first line that does not hold all its parameters."""
    depth = 0
    for mark in re.sub(r"(\"[^\"]*\"|'[^']*'|`[^`]*`)", "", line):
        depth += mark == "("
        depth -= mark == ")"
    return depth > 0


def check(args):
    set_dir = os.path.abspath(args.set)
    bad, cut_lines, same_as_outline = 0, {}, []

    def wrong(task, words):
        nonlocal bad
        bad += 1
        print("WRONG", task, words)

    for task in box.set_tasks(set_dir):
        need = ["file.txt", "start.txt", "plain.ts", "reference.ts", "reference.edits.md", "kind.txt", "ask.md"]
        missing = [n for n in need if not os.path.exists(box.task_file(set_dir, task, n))]
        if missing:
            wrong(task, f"has no {', '.join(missing)}")
            continue
        kind = box.text_of(box.task_file(set_dir, task, "kind.txt")).strip()
        if kind not in KINDS:
            wrong(task, f"kind.txt says {kind!r}, not one of {KINDS}")
        texts, told = texts_of(set_dir, task)
        content, rel = told["content"], told["rel"]
        for name in NAMES:
            path = box.task_file(set_dir, task, os.path.join("holds", name + ".md"))
            if not os.path.exists(path) or box.text_of(path) != texts[name]:
                wrong(task, f"holds/{name}.md is not what `make` writes now")
        if box.bytes_of(box.task_file(set_dir, task, "plain.ts")) != content.encode():
            wrong(task, "plain.ts is not the starting file")
        marks = [n + 1 for n, line in enumerate(content.split("\n"))
                 if small.SEARCH_LINE.match(line) or small.DIVIDER_LINE.match(line) or small.REPLACE_LINE.match(line)
                 or small.FILE_LINE.match(line) or small.EDIT_LINE.match(line)]
        if marks:
            wrong(task, f"the starting file's lines {marks} would be read as marks of an edit or a file")
        # The reference edits: every one applies, and the file they leave is reference.ts.
        edits, counted, _ = small.parse_edits(box.text_of(box.task_file(set_dir, task, "reference.edits.md")), None, rel)
        with tempfile.TemporaryDirectory(prefix="edits-") as app:
            os.makedirs(os.path.dirname(os.path.join(app, rel)), exist_ok=True)
            box.write_text(os.path.join(app, rel), content)
            came = small.apply_edits(app, edits)
            left = box.bytes_of(os.path.join(app, rel))
        if not edits or counted["edits not closed"] or any(e["path"] != rel for e in edits):
            wrong(task, f"reference.edits.md holds {len(edits)} edits for {rel}, {counted}")
        elif any(c["outcome"] not in small.APPLIED for c in came):
            wrong(task, f"a reference edit is refused: {[c['outcome'] for c in came]}")
        elif left != box.bytes_of(box.task_file(set_dir, task, "reference.ts")):
            wrong(task, "the reference edits do not leave reference.ts")
        # What the reference edits quote must be in front of the arm that is meant to be able to make the change.
        lines = content.split("\n")
        shown = "\n".join("\n".join(lines[a:b + 1]) for a, b in told["runs"])
        for edit in edits:
            if not edit["search"].strip():
                continue
            if kind == "beside" and edit["search"] not in told["printed"]:
                wrong(task, f"beside: a reference edit quotes text the outline does not show: {edit['search'][:60]!r}")
            if kind in ("inside", "leans") and edit["search"] not in shown:
                wrong(task, f"{kind}: a reference edit quotes text outside the region: {edit['search'][:60]!r}")
        if kind in ("inside", "leans") and not told["runs"]:
            wrong(task, f"{kind}: the ask names nothing the file declares, so there is no region")
        if texts["region"] == texts["outline"]:
            same_as_outline.append(task)
        cut_lines[rel] = sum(open_brackets(line) for line in told["printed"].split("\n"))
    print("first lines the outline shows with a bracket left open, by file:",
          ", ".join(f"{rel} {n}" for rel, n in sorted(cut_lines.items())) or "none")
    print("tasks whose region text is the outline text, because the ask names nothing the file declares:",
          ", ".join(same_as_outline) or "none")
    print("all as they must be" if not bad else f"{bad} WRONG")
    sys.exit(1 if bad else 0)


def sizes(args):
    set_dir = os.path.abspath(args.set)
    print("task  kind    file lines  " + "  ".join(f"{n:>8}" for n in NAMES) + "   region names")
    for task in box.set_tasks(set_dir):
        texts, told = texts_of(set_dir, task)
        kind = box.text_of(box.task_file(set_dir, task, "kind.txt")).strip()
        print(f"{task:<5} {kind:<7} {told['content'].count(chr(10)):>10}  "
              + "  ".join(f"{len(texts[n].encode()):>8}" for n in NAMES) + "   " + ", ".join(told["named"]))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="what", required=True)
    for name, go in (("make", make), ("check", check), ("sizes", sizes)):
        one = sub.add_parser(name)
        one.add_argument("set")
        one.set_defaults(go=go)
    args = parser.parse_args()
    args.go(args)


if __name__ == "__main__":
    main()

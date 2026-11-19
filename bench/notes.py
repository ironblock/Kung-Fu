#!/usr/bin/env python3
"""Turn a writer's list of notes or recipes into the text a subject is handed, or check that the notes hold.

    notes.py render FACTS.json --title "..." [--top N] [--out FILE]
    notes.py check FACTS.json --probes DIR --library LIB --runner RUNNER [--helpers FILE] [--json OUT]

FACTS.json is a list, in the writer's order. A note has `text`. A recipe has `goal`, `steps` (lines of
code) and `without` (a list of sentences). `--top N` keeps the first N of the list and nothing else, so a
shorter text is cut by this command and has no author of its own.

The text holds only what a reader is meant to see: no ids, no file names of the library, no word about
who wrote a note or whether a test was run on it. Every arm that gets such a text gets it in this one form.

`check` runs each note's probe against a copy of the library and says which notes still hold. A note
names its probe in `probe`, a file in DIR. LIB is the directory that holds `packages/babylon-lite`; the
library reads `packages/babylon-lite/shaders` as well as `src`, so a copy needs both.
RUNNER holds `node_modules` with vitest. A probe imports the library as `@babylonjs/lite`. Some probes
also import a helpers file, as `#helpers`, `../helpers.js` or `../../app/checks/helpers.ts`; pass that
file with `--helpers`, or those probes cannot run. The command copies the probes into a temporary
directory of its own, writes a vitest config there and runs vitest once, with its JSON report. It
changes nothing in DIR or LIB. Each note is in one of three states; `notes.py check --help` says how the
command decides. It prints one line for each note that does not hold, then a count, such as
"67 notes: 65 hold, 1 differs, 1 could not run." It exits with 0 only when every note holds. A run of a
probe shows what that copy of the library did on that probe, and nothing wider.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile


def render(items, title):
    out = [f"# {title}", ""]
    for n, item in enumerate(items, 1):
        if "goal" in item:
            out += [f"## {n}. {item['goal'].strip()}", "", "```ts", item["steps"].rstrip(), "```", ""]
            out += [f"- {line.strip()}" for line in item.get("without", [])]
            out.append("")
        else:
            out.append(f"{n}. {item['text'].strip()}")
    return "\n".join(out).rstrip() + "\n"


CHECK_HELP = """\
How a note's state is decided, from vitest's JSON report for the note's probe file:

  holds          The file is in the report, has at least one test, and every test passed.
  differs        The file loaded, and at least one test failed on an assertion: its first error is
                 an AssertionError, which is what a failed expect(...) throws. So the probe ran, and
                 the library did something other than what the probe asserts.
  could not run  Anything else:
                 - the probe file is not in DIR, or node or vitest is missing;
                 - vitest wrote no report, or the file is not in it, or the file has no test;
                 - the file failed to load, which vitest reports as an error of the file: an import
                   that does not resolve, a syntax error, an error in a hook (an import whose name
                   the file never uses is dropped when the file is compiled, and fails nothing);
                 - a test was skipped;
                 - every failed test died of an error that is not an AssertionError. A TypeError
                   such as "x is not a function" is the usual case: the library does not export x,
                   the import gives undefined, and the call throws before any assertion of the probe
                   fails. An error the library throws itself, and a timeout, are counted here too.

When some tests of one file fail on an assertion and others die of another error, the note differs,
and the line names the first test that failed on an assertion. A failed expect(() => f()).toThrow(...)
is an AssertionError even when f is missing, so such a test reads as differs; its line shows why.
Two notes that share one probe file get the same state. Paths of this machine are cut from what is
printed and from the JSON file."""


def _plural(n, one, many):
    return f"{n} {one if n == 1 else many}"


def _first_line(text):
    """The first line that is not empty. A line that ends in a colon only announces the next, so both are kept."""
    lines = [line.strip() for line in (text or "").splitlines() if line.strip()]
    if not lines:
        return ""
    if lines[0].endswith(":") and len(lines) > 1:
        return f"{lines[0]} {lines[1]}"
    return lines[0]


class Stripper:
    """Cut the paths of this machine from a line, so what is kept says the same thing on any machine."""

    def __init__(self, roots):
        pairs = {(form, name) for path, name in roots if path for form in (path, os.path.realpath(path))}
        self.roots = sorted(pairs, key=lambda r: -len(r[0]))

    def __call__(self, text):
        text = re.sub(r"\x1b\[[0-9;]*m", "", text)
        for path, name in self.roots:
            text = text.replace(path, name)
        # Any other absolute path keeps only its last part.
        return re.sub(r"(?<![\w.<>])(?:/[\w.@+~-]+){2,}", lambda m: "…/" + m.group(0).rsplit("/", 1)[1], text)


def _config(probes, library, helpers, cache):
    src = os.path.join(library, "packages", "babylon-lite", "src")
    alias = [
        {"find": "@babylonjs/lite", "replacement": os.path.join(src, "index.ts")},
        {"find": "babylon-lite/shader/wgsl.js", "replacement": os.path.join(src, "shader", "wgsl.ts")},
    ]
    lines = [
        "// Written by bench/notes.py check. It runs the probes in this directory against one copy of the library.",
        "const alias = " + json.dumps(alias) + ";",
    ]
    if helpers:
        lines.append("alias.push({ find: '#helpers', replacement: %s });" % json.dumps(helpers))
        lines.append("alias.push({ find: /^\\.\\.\\/helpers\\.js$/, replacement: %s });" % json.dumps(helpers))
        lines.append("alias.push({ find: /^(\\.\\.\\/)+app\\/checks\\/helpers\\.ts$/, replacement: %s });" % json.dumps(helpers))
    lines += [
        "export default {",
        "    root: %s," % json.dumps(probes),
        "    cacheDir: %s," % json.dumps(cache),
        "    resolve: { alias },",
        "    test: { environment: 'node', globals: true, include: ['*.test.ts'], watch: false },",
        "};",
    ]
    return "\n".join(lines) + "\n"


def _judge_file(entry):
    """The state of one probe file from its entry in the JSON report: (state, test, first line)."""
    if entry is None:
        return "could not run", "", "the file is not in vitest's report"
    tests = entry.get("assertionResults") or []
    if entry.get("message"):
        return "could not run", "", _first_line(entry["message"])
    if not tests:
        return "could not run", "", "the file has no test"
    asserted, died = None, None
    for test in tests:
        status = test.get("status")
        name = test.get("fullName") or test.get("title") or ""
        if status == "passed":
            continue
        if status != "failed":
            died = died or (name, f"the test was {status}")
            continue
        first = _first_line((test.get("failureMessages") or [""])[0])
        if re.match(r"(\w+\.)?AssertionError\b", first):
            asserted = asserted or (name, first)
        else:
            died = died or (name, first or "the test failed with no message")
    if asserted:
        return "differs", asserted[0], asserted[1]
    if died:
        return "could not run", died[0], died[1]
    return "holds", "", ""


def check(args):
    with open(args.facts, encoding="utf-8") as handle:
        notes = json.load(handle)
    probes_dir = os.path.abspath(args.probes)
    library = os.path.abspath(args.library)
    runner = os.path.abspath(args.runner)
    helpers = os.path.abspath(args.helpers) if args.helpers else None
    work = tempfile.mkdtemp(prefix="notes-check-")
    strip = Stripper([(work, "<work>"), (probes_dir, "<probes>"), (library, "<library>"),
                      (runner, "<runner>"), (helpers, "<helpers>")])
    file_state = {}
    try:
        here = os.path.join(work, "probes")
        os.makedirs(here)
        for name in sorted(os.listdir(probes_dir)):
            source = os.path.join(probes_dir, name)
            if os.path.isfile(source) and name.endswith(".ts") and not name.startswith("vitest.config"):
                shutil.copy(source, os.path.join(here, name))
        if helpers and os.path.isfile(helpers):
            shutil.copy(helpers, os.path.join(work, "helpers.ts"))
            helpers_copy = os.path.join(work, "helpers.ts")
        else:
            helpers_copy = None
        vitest = os.path.join(runner, "node_modules", "vitest", "vitest.mjs")
        node = shutil.which("node")
        problem = None
        if not os.path.isdir(os.path.join(library, "packages", "babylon-lite", "src")):
            problem = "the library has no packages/babylon-lite/src"
        elif not node:
            problem = "node is not on PATH"
        elif not os.path.isfile(vitest):
            problem = "the runner has no node_modules/vitest"
        elif helpers and not helpers_copy:
            problem = "the helpers file is not there"
        report = {}
        if not problem:
            # The probes import vitest; node finds it through this link.
            os.symlink(os.path.join(runner, "node_modules"), os.path.join(work, "node_modules"))
            config = os.path.join(work, "vitest.config.mjs")
            with open(config, "w", encoding="utf-8") as handle:
                handle.write(_config(here, library, helpers_copy, os.path.join(work, "cache")))
            out = os.path.join(work, "report.json")
            try:
                run = subprocess.run([node, vitest, "run", "--config", config, "--reporter=json", f"--outputFile={out}"],
                                     cwd=work, capture_output=True, text=True, timeout=args.timeout)
                if os.path.isfile(out):
                    with open(out, encoding="utf-8") as handle:
                        report = json.load(handle)
                else:
                    problem = "vitest wrote no report: " + _first_line(run.stderr[-2000:] or run.stdout[-2000:])
            except subprocess.TimeoutExpired:
                problem = f"vitest did not finish in {args.timeout} s"
        by_name = {os.path.basename(e["name"]): e for e in report.get("testResults", [])}
        results = []
        for n, note in enumerate(notes, 1):
            probe = note.get("probe", "")
            if not probe or not os.path.isfile(os.path.join(probes_dir, probe)):
                state, test, line = "could not run", "", "the probe file is not in DIR"
            elif problem:
                state, test, line = "could not run", "", problem
            else:
                if probe not in file_state:
                    file_state[probe] = _judge_file(by_name.get(probe))
                state, test, line = file_state[probe]
            result = {"note": n, "state": state, "probe": probe}
            if state != "holds":
                result["test"] = strip(test)
                result["failure"] = strip(line)
            results.append(result)
    finally:
        if args.keep:
            print(f"kept: {work}", file=sys.stderr)
        else:
            shutil.rmtree(work, ignore_errors=True)
    for r in results:
        if r["state"] != "holds":
            where = r["probe"] + (f" > {r['test']}" if r["test"] else "")
            print(f"note {r['note']}: {r['state']}: {where}: {r['failure']}")
    count = {s: sum(1 for r in results if r["state"] == s) for s in ("holds", "differs", "could not run")}
    parts = [_plural(count["holds"], "holds", "hold")]
    if count["differs"]:
        parts.append(_plural(count["differs"], "differs", "differ"))
    if count["could not run"]:
        parts.append(f"{count['could not run']} could not run")
    print(f"{_plural(len(results), 'note', 'notes')}: {', '.join(parts)}.")
    if args.json:
        with open(args.json, "w", encoding="utf-8") as handle:
            json.dump({"notes": results, "count": count}, handle, indent=1)
            handle.write("\n")
    return 0 if count["holds"] == len(results) else 1


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    one = sub.add_parser("render")
    one.add_argument("facts")
    one.add_argument("--title", required=True)
    one.add_argument("--top", type=int)
    one.add_argument("--out")
    two = sub.add_parser("check", help="run each note's probe against a copy of the library",
                         description="Run each note's probe against a copy of the library, and say which notes hold.",
                         epilog=CHECK_HELP, formatter_class=argparse.RawDescriptionHelpFormatter)
    two.add_argument("facts", help="the notes: a JSON list whose items name their probe file in `probe`")
    two.add_argument("--probes", required=True, help="the directory that holds the probe files")
    two.add_argument("--library", required=True, help="the directory that holds packages/babylon-lite (its src and shaders)")
    two.add_argument("--runner", required=True, help="a directory that holds node_modules with vitest")
    two.add_argument("--helpers", help="the helpers file that some probes import")
    two.add_argument("--json", help="write each note's number, state, probe file, and for a note that does not "
                                    "hold its failing test and the first line of the failure")
    two.add_argument("--timeout", type=int, default=900, help="seconds vitest may take (default 900)")
    two.add_argument("--keep", action="store_true", help="keep the temporary directory, and print where it is")
    args = parser.parse_args()
    if args.command == "check":
        sys.exit(check(args))
    with open(args.facts, encoding="utf-8") as handle:
        items = json.load(handle)
    if args.top:
        items = items[:args.top]
    text = render(items, args.title)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as handle:
            handle.write(text)
        print(f"{args.out}: {len(items)} items, {len(text.encode())} bytes")
    else:
        sys.stdout.write(text)


if __name__ == "__main__":
    main()

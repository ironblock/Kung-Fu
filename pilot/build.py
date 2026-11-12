#!/usr/bin/env python3
"""Build the clean code and the expected matches.

Usage: build.py <ast-grep binary>

`marked/` holds the code with a marker on each line where an expected match starts.
The markers are the ground truth, placed by hand. This script:
  1. writes `clean/`, the same code with the markers removed (line numbers unchanged);
  2. runs each reference answer on `clean/` and takes the exact span of each match;
  3. stops unless the reference matches start on exactly the marked lines;
  4. writes `oracle.json`: for each task, each expected match as a smallest and a
     largest acceptable span. An answer's match is right when it covers the smallest
     span and stays inside the largest.
"""
import collections, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import grade  # noqa: E402  (for the same reading of a command)

# Tasks where a wrapping node is as good an answer as the node itself, and the
# rule that finds the wrapper.
WRAPPERS = {
    "T12": "{id: w, language: ts, rule: {kind: export_statement, has: {kind: interface_declaration}}}",
}


def spans(binary, argv, clean):
    out = subprocess.run([binary] + argv + ["--json=stream", "src"], cwd=clean,
                         capture_output=True, text=True, stdin=subprocess.DEVNULL)
    found = []
    for line in out.stdout.splitlines():
        found += grade.spans_of(json.loads(line))
    return sorted(found)


def build(binary, marked, answers, out, wrappers=None):
    """Write `out/clean` and `out/oracle.json` from marked code and reference answers.

    `marked` is a directory that holds `src`. `answers` is the lines of the reference
    answers. `wrappers` is as WRAPPERS, and is WRAPPERS when none is given. Return how
    many matches each task expects.
    """
    wrappers = WRAPPERS if wrappers is None else wrappers
    clean = os.path.join(out, "clean")
    marks = collections.defaultdict(list)
    for root, _, files in os.walk(os.path.join(marked, "src")):
        for name in sorted(files):
            path = os.path.join(root, name)
            rel = os.path.relpath(path, marked)
            lines = []
            for n, line in enumerate(open(path).read().split("\n"), 1):
                m = re.search(r"\s*(//|#) ((?:@T\d\d ?)+)$", line)
                if m:
                    for task in re.findall(r"@(T\d\d)", m.group(2)):
                        marks[task].append((rel, n))
                    line = line[:m.start()]
                lines.append(line)
            target = os.path.join(clean, rel)
            os.makedirs(os.path.dirname(target), exist_ok=True)
            open(target, "w").write("\n".join(lines))

    oracle = {}
    for line in answers:
        task, command = line.split(":", 1)
        argv = grade.words(command.strip())
        assert argv[0] == "ast-grep" and argv[-1] == "src", command
        core = spans(binary, argv[1:-1], clean)
        starts = sorted((f, sl) for f, sl, *_ in core)
        assert starts == sorted(marks[task]), f"{task}: the reference starts at {starts}, the marks are at {sorted(marks[task])}"
        around = spans(binary, ["scan", "--inline-rules", wrappers[task]], clean) if task in wrappers else []
        items = []
        for c in core:
            outer = [w for w in around if w[0] == c[0] and (w[1], w[2]) <= (c[1], c[2]) and (w[3], w[4]) >= (c[3], c[4])]
            items.append({"file": c[0], "least": c[1:], "most": (outer[0][1:] if outer else c[1:])})
        oracle[task] = items
    assert sorted(oracle) == sorted(marks), "a task has marks and no reference, or the other way round"
    json.dump(oracle, open(os.path.join(out, "oracle.json"), "w"), indent=1)
    return {task: len(items) for task, items in oracle.items()}


if __name__ == "__main__":
    print(build(os.path.abspath(sys.argv[1]), os.path.join(HERE, "marked"),
                [line for line in open(os.path.join(HERE, "reference", "answers.txt")) if line.strip()], HERE))

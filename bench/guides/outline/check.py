#!/usr/bin/env python3
"""Check every fact in facts.md by running it.

Usage: check.py <ast-grep binary>

facts.md is a guide a subject is given: facts about `ast-grep outline`. This runs
a command for each fact on `src/facts.js` and compares the items that come back,
each as `type:name`, with what the guide says. A string in place of a list is a
part of what ast-grep must say when it refuses. It stops at the first fact that is
no longer so, for instance with another version of ast-grep.
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
EVERY = ["function:tally", "function:tallyAll", "function:settle", "class:Board", "class:Shelf",
         "constant:LIMIT", "variable:spare", "function:helper"]
IMPORT = ['module:"./tint.js"']

FACTS = [
    # 1. Top-level items only. `Board` has a method `tally`, and `tallyAll` holds a function `inner`.
    (["--items", "structure", "--type", "method", "src"], []),
    (["--items", "structure", "--match", "inner", "src"], []),
    (["--items", "structure", "--match", "^tally$", "src"], ["function:tally"]),
    # 2. A directory gives the exported items only, and says nothing of the rest.
    (["src"], ["function:tally", "class:Board", "constant:LIMIT"]),
    (["--match", "settle", "src"], []),
    (["--items", "structure", "src"], EVERY),
    (["--items", "imports", "src"], IMPORT),
    (["--items", "all", "src"], IMPORT + EVERY),
    (["--items", "exports,imports", "src"], "invalid value 'exports,imports'"),
    # 3. Types.
    (["--items", "structure", "--type", "function,class", "src"],
     ["function:tally", "function:tallyAll", "function:settle", "class:Board", "class:Shelf", "function:helper"]),
    (["--items", "structure", "--type", "function", "--type", "class", "src"], "cannot be used multiple times"),
    (["--items", "structure", "--type", "constant", "src"], ["constant:LIMIT"]),
    (["--items", "structure", "--type", "variable", "src"], ["variable:spare"]),
    (["--items", "all", "--type", "module", "src"], IMPORT),
    # 4. `--match` looks at the name and at the first line, anywhere in either.
    (["--items", "structure", "--match", "tally", "src"], ["function:tally", "function:tallyAll", "function:settle"]),
    (["--items", "structure", "--match", "Tally", "src"], []),
    # 5. The one whole command of the guide.
    (["--items", "structure", "--type", "function", "--match", "^tally$", "src"], ["function:tally"]),
]


def run(binary, args):
    ran = subprocess.run([binary, "outline", "--json=stream"] + args, cwd=HERE, capture_output=True, text=True)
    items = [f"{item['symbolType']}:{item['name']}" for line in ran.stdout.splitlines() if line.strip()
             for item in json.loads(line)["items"]]
    return ran.returncode, items, ran.stderr


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: check.py <ast-grep binary>")
    binary = os.path.abspath(sys.argv[1])
    for args, expected in FACTS:
        status, found, said = run(binary, args)
        shown = "outline " + " ".join(repr(a) for a in args)
        if isinstance(expected, str):
            assert status != 0 and expected in said, f"not refused as the guide says: {shown}\n{said}"
        else:
            assert status == 0 and found == expected, f"the guide says {expected}, and it listed {found}: {shown}\n{said}"
    print(f"all {len(FACTS)} commands of the guide do what it says")


if __name__ == "__main__":
    main()

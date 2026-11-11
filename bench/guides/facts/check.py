#!/usr/bin/env python3
"""Check every fact in facts.md by running it.

Usage: check.py <ast-grep binary>

facts.md is the guide a subject is given. Each fact in it stands beside a command.
This runs each command on `src/facts.js` and compares what comes back with what
the guide says: how many matches, or the words of a refusal. It stops at the first
fact that is no longer so, for instance with another version of ast-grep.
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))


def run(binary, args):
    ran = subprocess.run([binary] + args + ["--json=stream", "src"], cwd=HERE, capture_output=True, text=True)
    return ran.returncode, [json.loads(line)["text"] for line in ran.stdout.splitlines() if line.strip()], ran.stderr


def rule(text):
    return ["scan", "--inline-rules", "{id: r, language: js, rule: " + text + "}"]


FACTS = [
    # 1. A rule must name a kind of node.
    (rule("{nthChild: 2, inside: {kind: arguments}}"), "Rule must specify a set of AST kinds to match"),
    (rule("{regex: last, nthChild: 2, inside: {kind: arguments}}"), "Rule must specify a set of AST kinds to match"),
    (rule("{pattern: $X, nthChild: 2, inside: {kind: arguments}}"), "Rule must specify a set of AST kinds to match"),
    (rule("{kind: number, nthChild: 2, inside: {kind: arguments}}"), ["2", "2", "1"]),
    (rule("{any: [{kind: number}, {kind: identifier}], nthChild: 2, inside: {kind: arguments}}"),
     ["2", "2", "last", "last", "1"]),
    # 2. `$$$` stops at the first place that fits.
    (["run", "-l", "js", "-p", "wrap($$$A, last)"], ["wrap(last)", "wrap(1, last)"]),
    (["run", "-l", "js", "-p", "tally(1, $$$A)"], ["tally(1, 2)"]),
    (rule('{pattern: "wrap($$$A)", has: {kind: arguments, has: {kind: identifier, regex: "^last$",'
          ' nthChild: {position: 1, reverse: true}}}}'), ["wrap(last)", "wrap(1, last)", "wrap(last, last)"]),
    # 3. A pattern matches the tree, not the text.
    (["run", "-l", "js", "-p", "var $A = $B"], ["var one = 1;", "var two = 2", "var a = 1, b = 2;"]),
    (["run", "-l", "js", "-p", "var $A = $B;"], ["var one = 1;"]),
    (rule("{kind: variable_declaration, not: {has: {kind: variable_declarator, nthChild: 2}}}"),
     ["var one = 1;", "var two = 2"]),
]


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: check.py <ast-grep binary>")
    binary = os.path.abspath(sys.argv[1])
    for args, expected in FACTS:
        status, found, said = run(binary, args)
        shown = " ".join(args[:1] + [repr(a) for a in args[1:]])
        if isinstance(expected, str):
            assert status not in (0, 1) and expected in said, f"not refused as the guide says: {shown}\n{said}"
        else:
            assert status in (0, 1) and found == expected, f"the guide says {expected}, and it found {found}: {shown}\n{said}"
    print(f"all {len(FACTS)} commands of the guide do what it says")


if __name__ == "__main__":
    main()

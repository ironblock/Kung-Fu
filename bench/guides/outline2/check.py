#!/usr/bin/env python3
"""Check the second guide about `ast-grep outline`: its facts in prose, and the same facts as rows.

Usage: check.py <ast-grep binary>

`facts.md` and `ley.toml` say the same things about `ast-grep outline`, and a subject is given one or the
other. Each row of `ley.toml` holds a command and how many items it shows on `src/facts.js`. This runs
each command and compares the items that come back, each as `type:name`, with the list written here: so
a row is checked for which items it shows, and not only for how many. `ley check` checks the counts by
itself, with the program of the sister project. This also checks that `rows.txt`, the text a subject is
given, is the ledger as `ley show` prints it, and that `facts.md` is no longer than 1,000 characters.

Each sentence of `facts.md` stands on the rows named beside it in FACTS. A sentence with no row has no
place in the guide: the first guide had two lines that said more than their checks ran.
"""
import json, os, shlex, subprocess, sys, tomllib

HERE = os.path.dirname(os.path.abspath(__file__))
STRUCTURE = ["function:tally", "function:tallyAll", "function:settle", "class:Board", "class:Shelf",
             "constant:LIMIT", "constant:floor", "variable:spare", "variable:slack", "function:helper",
             "function:later", "constant:loud", "variable:soft", "constant:made", "module:exports",
             'module:"./paint.js"']
IMPORTS = ['module:"./tint.js"', 'module:"./paint.js"']

# What each row's command lists, in the order of the ledger.
SHOWN = [
    STRUCTURE,                                                   # every item but the imports, exported or not
    [],                                                          # a method is not an item
    [],                                                          # nor a function inside a function
    [],                                                          # nor a `var`
    ["function:tally", "function:settle", "class:Board", "constant:LIMIT", "variable:spare", "constant:loud",
     "variable:soft", "module:exports", 'module:"./paint.js"'],  # a directory: the exported items only
    [],                                                          # and nothing of one that is not exported
    IMPORTS,
    IMPORTS + STRUCTURE,
    ["function:tally", "function:tallyAll", "function:settle", "class:Board", "class:Shelf", "function:helper",
     "function:later"],
    ["function:tally", "function:tallyAll", "function:settle", "function:helper", "function:later"],
    ["constant:LIMIT", "constant:floor", "constant:loud", "constant:made"],
    ["variable:spare", "variable:slack", "variable:soft"],
    IMPORTS + ["module:exports", 'module:"./paint.js"'],
    ["function:tally", "function:tallyAll", "function:settle"],
    [],                                                          # no line that is read begins with `const`
    ["function:helper"],
    ["function:later"],
    ['module:"./paint.js"'],
    ["function:tally"],
]

# The sentences of facts.md, and the rows each stands on, counted from 1.
FACTS = [
    ("`ast-grep outline src` lists top-level items.", [1, 5]),
    ("A method, a function inside a function, and a `var` are not items.", [2, 3, 4]),
    ("Given a directory, it lists only exported items and is silent about the rest.", [5, 6]),
    ("`--items structure` lists every item but the imports, exported or not.", [1]),
    ("`--items imports` lists the imports, `--items all` both.", [7, 8]),
    ("`--type function,class` keeps both types.", [9]),
    ("An arrow function in a `const` or `let` that is not exported is a `function`.", [10]),
    ("Exported, or with another value, a `const` is a `constant` and a `let` a `variable`.", [11, 12]),
    ("An import or an `export {...}` list is a `module`.", [13]),
    ("`--match REGEX` keeps an item when the regex is in its name or on the line of its name.", [14]),
    ("A `const` or `let` that is not exported is read from its name on: `helper = () => 1`.", [15, 16, 17]),
    ("An import's name is its quoted path.", [18]),
    ("Every `function` named exactly `tally`: `ast-grep outline --items structure --type function --match '^tally$' src`", [19]),
]

HEAD = ("# Facts about `ast-grep outline` 0.51.1, as rows\n\n"
        "Each row was checked by running its command on a small file, in a directory named `src`. "
        "The counts are that file's.\n\n")


def as_shown(rows):
    """The ledger as `ley show` prints its rows, name by name in the order the names first come."""
    names = []
    for row in rows:
        if row["name"] not in names:
            names.append(row["name"])
    out = []
    for name in names:
        for row in rows:
            if row["name"] == name:
                count = row.get("count", 1)
                out.append(f"If you run\n    {row['run']}\nit will show you {row['shows']}:"
                           f" {count} result{'' if count == 1 else 's'}.\n")
    return HEAD + "\n".join(out)


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: check.py <ast-grep binary>")
    binary = os.path.abspath(sys.argv[1])
    rows = tomllib.load(open(os.path.join(HERE, "ley.toml"), "rb"))["row"]
    assert len(rows) == len(SHOWN), f"{len(rows)} rows in the ledger, and {len(SHOWN)} lists here"
    for n, (row, expected) in enumerate(zip(rows, SHOWN), 1):
        argv = shlex.split(row["run"])
        assert argv[:2] == ["ast-grep", "outline"], row["run"]
        ran = subprocess.run([binary, "outline", "--json=stream"] + argv[2:], cwd=HERE, capture_output=True, text=True)
        found = [f"{item['symbolType']}:{item['name']}" for line in ran.stdout.splitlines() if line.strip()
                 for item in json.loads(line)["items"]]
        assert ran.returncode == 0 and found == expected, f"row {n} lists {found}, not {expected}: {row['run']}\n{ran.stderr}"
        assert row.get("count", 1) == len(expected), f"row {n} says {row.get('count', 1)}, and its list has {len(expected)}"
    guide = open(os.path.join(HERE, "facts.md"), encoding="utf-8").read()
    assert len(guide) <= 1000, f"facts.md is {len(guide)} characters"
    used = set()
    for sentence, stands_on in FACTS:
        assert sentence in guide, f"facts.md does not hold: {sentence}"
        assert stands_on and all(1 <= r <= len(rows) for r in stands_on), sentence
        used.update(stands_on)
    assert used == set(range(1, len(rows) + 1)), f"rows that no sentence stands on: {sorted(set(range(1, len(rows) + 1)) - used)}"
    # Nothing in the guide but its title, its first line, and those sentences.
    rest = guide
    for sentence, _ in FACTS:
        rest = rest.replace(sentence, "")
    rest = rest.replace("# Facts about `ast-grep outline` 0.51.1", "").replace("Each line was checked by running it.", "")
    assert not rest.strip(" \n12345."), f"facts.md says more than its sentences: {rest.strip()!r}"
    shown = open(os.path.join(HERE, "rows.txt"), encoding="utf-8").read()
    assert shown == as_shown(rows), "rows.txt is not the ledger as `ley show` prints it. Make it again: check.py <binary> --write"
    print(f"all {len(rows)} rows list what the guide says, and each of its {len(FACTS)} sentences stands on a row."
          f" facts.md is {len(guide)} characters, rows.txt {len(shown)}.")


if __name__ == "__main__":
    if "--write" in sys.argv:
        sys.argv.remove("--write")
        rows = tomllib.load(open(os.path.join(HERE, "ley.toml"), "rb"))["row"]
        open(os.path.join(HERE, "rows.txt"), "w", encoding="utf-8").write(as_shown(rows))
    main()

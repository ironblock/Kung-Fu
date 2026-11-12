#!/usr/bin/env python3
"""A probe of what a subject remembers of ast-grep's command line. It is not a study.

Usage: probe.py make <work directory>
       probe.py keep <work directory> --records DIR --model-starts PREFIX --model-as WORDS
       probe.py tally

`make` writes, for each subject, a directory under the work directory with one
file, `question.md`, and in this directory the request to send and a copy of the
question. `keep` copies each finished subject's answer and report here, with what
its record says. `tally` prints what the answers say, name by name. Read every
answer as well: a count does not say what a subject wrote beside its yes.

Two groups, so that the names in one cannot prompt the other.

  recall   list the subcommands and the long flags of `run` and of `scan`
  names    16 names in an order of the subject's own: yes, no or not known
"""
import argparse, glob, json, os, random, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(os.path.dirname(HERE)))
RUN = os.path.basename(HERE)
SUBJECTS = 5
SEED = 20261112

# Checked against the help text of 0.40.0 and of 0.51.1: `old` is in both, `new` only
# in 0.51.1, and `made up` in neither.
NAMES = {
    "old": ["ast-grep lsp", "ast-grep run --debug-query", "ast-grep run --strictness", "ast-grep scan --inline-rules"],
    "new": ["ast-grep outline", "ast-grep run --kind", "ast-grep run --files-with-matches",
            "ast-grep scan --max-results", "ast-grep scan --min-severity", "ast-grep run --custom-languages"],
    "made up": ["ast-grep explain", "ast-grep graph", "ast-grep run --max-depth", "ast-grep run --only-matching",
                "ast-grep scan --min-confidence", "ast-grep scan --baseline"],
}
NEW_IN_RECALL = ["outline", "--kind", "--files-with-matches", "--max-results", "--min-severity", "--custom-languages"]

REQUEST = '''Work only in the directory {dir}

It contains question.md. Read it. Then write your answer to answer.txt in that same directory, in the form question.md describes.

Conditions:
- You cannot run ast-grep. It is not installed for you. Do not try to install it, do not search the machine for it, and do not use the network.
- Do not read or write any file outside that directory.
- Answer from what you remember. No file in that directory holds the answer.
- Write the file once. Do not revise it after writing.

When you are done, report back in this exact structure and nothing else:
A. One sentence, in your own words: what the question asks of you.
B. One word for how sure you are of your answer: sure, unsure, or guess.
'''

RECALL = '''This asks what you remember of the command line of ast-grep, the code search tool. There is no trick. Write only what you remember. Where you do not remember, write `not known`: a gap is a fine answer. Do not fill a gap with what seems likely.

Write four parts to answer.txt. Begin each part with its heading on a line of its own.

VERSION
The newest version of ast-grep that you know of, as a number. One line.

SUBCOMMANDS
Every subcommand that `ast-grep --help` lists. One name to a line.

RUN
Every long flag of `ast-grep run`, such as `--pattern`. One flag to a line.

SCAN
Every long flag of `ast-grep scan`, such as `--rule`. One flag to a line.
'''

NAMES_TOP = '''This asks what you remember of the command line of ast-grep, the code search tool. Below are 16 names. Some are part of ast-grep's command line, and some are not.

For each name write one line to answer.txt, in the order given, in this form:

<the name> | <yes, no or not known> | <if yes: what it does, in a few words>

A name counts only as it is written: that subcommand, or that flag on that subcommand. A word that ast-grep uses somewhere else, such as a key in a rule or in a config file, does not count.

Write `yes` only if you remember the name as part of ast-grep. Write `no` if you believe ast-grep has no such thing. Write `not known` if you cannot say: that is a fine answer. Do not answer from what seems likely.

'''


def subjects():
    for group in ("recall", "names"):
        for n in range(1, SUBJECTS + 1):
            yield group, f"s{n}"


def question(group, leaf):
    if group == "recall":
        return RECALL
    names = [name for kind in NAMES.values() for name in kind]
    random.Random(SEED + int(leaf[1:])).shuffle(names)
    return NAMES_TOP + "".join(f"{i}. `{name}`\n" for i, name in enumerate(names, 1))


def make(work):
    for group, leaf in subjects():
        kept, there = os.path.join(HERE, group, leaf), os.path.join(os.path.abspath(work), RUN, group, leaf)
        if os.path.exists(os.path.join(kept, "request.md")) or os.path.exists(there):
            sys.exit(f"probe.py: {group} {leaf} is already set up")
        os.makedirs(kept), os.makedirs(there)
        for where in (kept, there):
            open(os.path.join(where, "question.md"), "w", encoding="utf-8").write(question(group, leaf))
        open(os.path.join(kept, "request.md"), "w", encoding="utf-8").write(REQUEST.format(dir=there))
        print(os.path.join(kept, "request.md"))


def keep(work, records, starts, model_as):
    import keep as bench_keep
    wanted = {open(os.path.join(HERE, g, l, "request.md"), encoding="utf-8").read().strip(): (g, l) for g, l in subjects()}
    found = {}
    for path in sorted(glob.glob(os.path.join(records, "agent-*.jsonl")), key=os.path.getmtime):
        there = None
        messages, report, models, first_in, request, _, subject = bench_keep.claude_code(path)
        if (request or "").strip() in wanted and report is not None:
            found[wanted[request.strip()]] = path
    for (group, leaf), path in sorted(found.items()):
        kept, there = os.path.join(HERE, group, leaf), os.path.join(os.path.abspath(work), RUN, group, leaf)
        if os.path.exists(os.path.join(kept, "record.json")):
            continue
        messages, report, models, first_in, request, outside, subject = bench_keep.claude_code(path, there)
        if not models or any(not m.startswith(starts) for m in models):
            sys.exit(f"probe.py: {group} {leaf} was not run by a model that starts with `{starts}`. Nothing more is kept.")
        if (subject or {}).get("type") != "bench-subject-closed":
            sys.exit(f"probe.py: {group} {leaf} was not a `bench-subject-closed`. Nothing more is kept.")
        left = sorted(os.listdir(there))
        if "answer.txt" not in left:
            sys.exit(f"probe.py: {group} {leaf} left no answer.txt")
        shutil.copyfile(os.path.join(there, "answer.txt"), os.path.join(kept, "answer.txt"))
        open(os.path.join(kept, "report.md"), "w", encoding="utf-8").write(report.strip() + "\n")
        json.dump({"model": model_as, "subject": subject, "read before the request": first_in,
                   "output_tokens": sum(m["output_tokens"] for m in messages),
                   "messages": [{"output_tokens": m["output_tokens"], "tools": m["tools"]} for m in messages],
                   "outside": outside, "files left": left},
                  open(os.path.join(kept, "record.json"), "w", encoding="utf-8"), indent=1)
        print(f"kept {group} {leaf}: {sum(m['output_tokens'] for m in messages):,} output tokens, files left: {left}")
    print(f"{len(found)} of {len(wanted)} have a finished subject")


def tally():
    kind_of = {name: kind for kind, names in NAMES.items() for name in names}
    said = {name: [] for name in kind_of}
    tokens = 0
    for group, leaf in subjects():
        kept = os.path.join(HERE, group, leaf)
        try:
            answer = open(os.path.join(kept, "answer.txt"), encoding="utf-8").read()
            tokens += json.load(open(os.path.join(kept, "record.json")))["output_tokens"]
        except OSError:
            print(f"{group} {leaf}: not kept"); continue
        if group == "recall":
            subs = re.search(r"SUBCOMMANDS(.*?)\nRUN\b", answer, re.S)
            version = re.search(r"VERSION\s*\n\s*(.+)", answer)
            print(f"recall {leaf}: version `{version.group(1).strip() if version else '?'}`;"
                  f" subcommands: {' '.join((subs.group(1) if subs else '').split())};"
                  f" new names written: {[n for n in NEW_IN_RECALL if re.search(r'(?<![\w-])' + re.escape(n) + r'(?![\w-])', answer)] or 'none'}")
        else:
            for line in answer.splitlines():
                parts = [p.strip() for p in line.split("|")]
                name = parts[0].strip("` ").lstrip("0123456789. ").strip("` ") if parts else ""
                if name in said and len(parts) > 1:
                    said[name].append(parts[1].lower())
    for kind in NAMES:
        for name in NAMES[kind]:
            words = said[name]
            print(f"names, {kind:8} {name:36} yes {sum(w.startswith('yes') for w in words)},"
                  f" no {sum(w.startswith('no') and not w.startswith('not') for w in words)},"
                  f" not known {sum(w.startswith('not') for w in words)}, of {len(words)}")
    print(f"{tokens:,} output tokens in all")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("what", choices=["make", "keep", "tally"])
    parser.add_argument("work", nargs="?")
    parser.add_argument("--records"); parser.add_argument("--model-starts"); parser.add_argument("--model-as")
    args = parser.parse_args()
    if args.what == "make":
        make(args.work)
    elif args.what == "keep":
        keep(args.work, args.records, args.model_starts, args.model_as)
    else:
        tally()

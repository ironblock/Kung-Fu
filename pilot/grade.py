#!/usr/bin/env python3
"""Grade one pass against the expected matches.

Usage: grade.py <ast-grep binary> <pass directory>

A pass directory holds what was sent and what came back:

  request.md    the request, as the subject received it
  answers.txt   the file the subject wrote: one line per task, `T01: ast-grep run ...`

A pass with no request beside its answers is not graded. A score that nobody can
trace back to what was asked is not a score.

A command is graded on what it matches, never on how it is written. For
`ast-grep outline`, what it matches is the top-level items it lists, in whatever
view. It passes when
its matches are exactly the expected pieces of code: each match must cover the
expected piece and nothing beyond it, every expected piece must be matched once,
and nothing else may be matched. A match that starts on the right line but is the
wrong piece of code (a name instead of the whole declaration) does not pass.

Commands run with no shell, in the clean copy of the code. A command that a shell
would read differently from how it is written here (a `$A` inside double quotes, a
pipe) is refused, so that a passing answer also works when pasted into a shell. A
`$` inside double quotes that begins no name, as at the end of a regex, is read as
a shell reads it: it stands for itself. So does a `$` that ends a word written
with no quotes.

For every task this prints the answer. For an answer that did not pass it also
prints every line ast-grep said, and the lines that were missed or should not have
matched. The total comes last, and there is no way to print it alone. A total says
how many answers failed. Only the answers say why.
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SPECIAL = "|&;<>()$`*?[]{}~#!"


def words(command):
    """Split a command the way a shell would, refusing anything a shell would interpret."""
    out, word, in_word, i = [], "", False, 0
    while i < len(command):
        c = command[i]
        i += 1
        if c in " \t":
            if in_word:
                out.append(word)
                word, in_word = "", False
        elif c == "'":
            j = command.find("'", i)
            if j < 0:
                raise ValueError("a single quote is never closed")
            word, in_word, i = word + command[i:j], True, j + 1
        elif c == '"':
            in_word = True
            while True:
                if i >= len(command):
                    raise ValueError("a double quote is never closed")
                d = command[i]
                i += 1
                if d == '"':
                    break
                if d == "\\" and i < len(command):
                    nxt = command[i]
                    i += 1
                    word += nxt if nxt in '\\"$`' else "\\" + nxt
                elif d == "$" and (i >= len(command) or not (command[i].isalnum() or command[i] in "_{(?!$@*#-")):
                    # A `$` that begins no name and no bracket stands for itself, as at the end of a regex.
                    word += d
                elif d in "$`!":
                    raise ValueError(f"a shell expands `{d}` inside double quotes: use single quotes")
                else:
                    word += d
        elif c == "\\":
            if i >= len(command):
                raise ValueError("a backslash has nothing after it")
            word, in_word, i = word + command[i], True, i + 1
        elif c == "$" and (i >= len(command) or command[i] in " \t"):
            # A `$` that ends a word stands for itself, as at the end of a regex written with no quotes.
            word, in_word = word + c, True
        elif c in SPECIAL or c in "\r\n":
            raise ValueError(f"a shell interprets `{c}`: quote it with single quotes")
        else:
            word, in_word = word + c, True
    if in_word:
        out.append(word)
    return out


REWRITES = ("--update-all", "--interactive", "--stdin", "--rewrite", "--rule", "--config", "--outline-rules")


def spans_of(printed, below=""):
    """The spans that one line of `--json=stream` names.

    `run` and `scan` print one object for a match. `outline` prints one object for a
    file, with its top-level items in it: each item is a span, and its members are
    not looked at.
    """
    if "items" in printed:
        file, ranges = printed["path"], [item["range"] for item in printed["items"]]
    else:
        file, ranges = printed["file"], [printed["range"]]
    return [[os.path.normpath(os.path.join(below, file)), r["start"]["line"] + 1, r["start"]["column"],
             r["end"]["line"] + 1, r["end"]["column"]] for r in ranges]


def not_allowed(args, json_too=True):
    """The first word that rewrites code, reads a file of rules or changes what is printed. Or None."""
    for word in args:
        name = word.split("=")[0]
        short = word.startswith("-") and not word.startswith("--")
        if name in REWRITES or (json_too and name == "--json") \
                or (short and word[1:2] in ("r", "c")) \
                or (short and any(ch in word[1:] for ch in "Ui") and word[1:2] not in ("p", "l", "k")):
            return word
    return None


def matches(binary, args, cwd, below=""):
    """Run `ast-grep <args>` in `cwd`.

    Return (the spans matched, the lines ast-grep said) or (a verdict, the lines that
    explain it). `below` is where `cwd` lies under the directory that holds `src`, so
    that a file is named the same way wherever the command ran.
    """
    try:
        ran = subprocess.run([binary, args[0], "--json=stream"] + args[1:], cwd=cwd,
                             capture_output=True, text=True, timeout=60, stdin=subprocess.DEVNULL)
    except subprocess.TimeoutExpired:
        return "error", ["timed out"]
    except OSError as e:
        return "error", [f"ast-grep could not start: {e}"]
    # Every line, not the first. Two different faults can share a first line.
    said = [line.rstrip() for line in ran.stderr.splitlines() if line.strip()]
    failed = ran.returncode not in (0, 1) or any(
        line.strip().lower().startswith("error") and "error(s) found in code" not in line for line in said)
    if failed:
        return "error", ["ast-grep did not run it, and said:"] + ["  " + line for line in said]
    got = []
    for line in ran.stdout.splitlines():
        if not line.strip():
            continue
        try:
            got += spans_of(json.loads(line), below)
        except (ValueError, KeyError, TypeError):
            return "error", ["printed something other than matches:", "  " + line.rstrip()]
    return got, said


def run(binary, command, clean=None):
    """Return (the spans matched, the lines ast-grep said) or (a verdict, the lines that explain it).

    The command runs in `clean`, a directory that holds `src`. With none given, in this pilot's own.
    """
    try:
        argv = words(command)
    except ValueError as e:
        return "invalid", [str(e)]
    if len(argv) < 2 or argv[0] != "ast-grep" or argv[1] not in ("run", "scan", "outline"):
        return "invalid", ["not `ast-grep run`, `ast-grep scan` or `ast-grep outline`"]
    # `src/` and `./src` are `src`, and a shell searches the same files for each.
    if not any(not word.startswith("-") and os.path.normpath(word) == "src" for word in argv[2:]):
        return "invalid", ["does not search `src`"]
    # An answer's own `--json` is left out, and the grader asks for its own: the matches are the same.
    argv = argv[:2] + [word for word in argv[2:] if word.split("=")[0] != "--json"]
    word = not_allowed(argv[2:])
    if word:
        return "invalid", [f"`{word}` is not allowed here"]
    return matches(binary, argv[1:], clean or os.path.join(HERE, "clean"))


def judge(got, expected):
    """Pair each match with one expected piece. Return (expected pieces missed, matches not expected, wrong_piece)."""
    free = list(expected)
    extra = []
    wrong_piece = 0
    for file, *span in got:
        start, end = tuple(span[:2]), tuple(span[2:])
        hit = next((e for e in free if e["file"] == file
                    and tuple(e["most"][:2]) <= start <= tuple(e["least"][:2])
                    and tuple(e["least"][2:]) <= end <= tuple(e["most"][2:])), None)
        if hit:
            free.remove(hit)
        else:
            extra.append(f"{file}:{span[0]}")
            # Starts on an expected line, but is not the expected piece of code.
            wrong_piece += any(e["file"] == file and e["least"][0] == span[0] for e in expected)
    return [f"{e['file']}:{e['least'][0]}" for e in free], extra, wrong_piece


def grade(binary, answers_path):
    """For each task: (verdict, the lines that explain it, the answer as written)."""
    oracle = json.load(open(os.path.join(HERE, "oracle.json")))
    answers = {}
    for line in open(answers_path, encoding="utf-8", errors="replace"):
        task, colon, command = line.strip().partition(":")
        task = task.strip()
        if colon and len(task) == 3 and task[0] == "T" and task[1:].isdigit() and task not in answers:
            answers[task] = command.strip().strip("`").strip()
    results = {}
    for task, expected in oracle.items():
        if task not in answers:
            results[task] = ("none", ["no answer for this task"], "")
            continue
        got, said = run(binary, answers[task])
        if isinstance(got, str):
            results[task] = (got, said, answers[task])
            continue
        missed, extra, wrong_piece = judge(got, expected)
        if not missed and not extra:
            results[task] = ("pass", [], answers[task])
            continue
        lines = []
        if missed:
            lines.append(f"missed {len(missed)} of {len(expected)} expected: {', '.join(missed)}")
        if extra:
            lines.append(f"matched {len(extra)} not expected: {', '.join(extra)}")
        if wrong_piece:
            lines.append(f"{wrong_piece} of those start on an expected line and are not the expected piece of code")
        if said:
            lines += ["ast-grep also said:"] + ["  " + line for line in said]
        results[task] = ("wrong", lines, answers[task])
    return results


def main():
    if len(sys.argv) != 3 or sys.argv[1].startswith("-"):
        sys.exit("usage: grade.py <ast-grep binary> <pass directory>")
    binary, directory = os.path.abspath(sys.argv[1]), sys.argv[2]
    request = os.path.join(directory, "request.md")
    answers = os.path.join(directory, "answers.txt")
    if not os.path.isfile(answers):
        sys.exit(f"grade.py: {answers} is not there. A pass directory holds request.md and answers.txt.")
    if not os.path.isfile(request) or not open(request, encoding="utf-8", errors="replace").read().strip():
        sys.exit(f"grade.py: {request} is not there, or is empty.\n"
                 "Keep the request beside the answers, as the subject received it. "
                 "A pass with no request is not graded.")
    results = grade(binary, answers)
    for task, (verdict, lines, command) in results.items():
        print(f"{task} {verdict}")
        if command:
            print(f"    {command}")
        for line in lines:
            print(f"    {line}")
    print()
    print(f"{sum(v == 'pass' for v, _, _ in results.values())} of {len(results)} pass")


if __name__ == "__main__":
    main()

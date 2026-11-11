#!/usr/bin/env python3
"""Grade one answers file against the expected matches.

Usage: grade.py <ast-grep binary> <answers.txt> [--quiet]

An answers file has one line per task: `T01: ast-grep run ...`.
A command is graded on what it matches, never on how it is written. It passes when
its matches are exactly the expected pieces of code: each match must cover the
expected piece and nothing beyond it, every expected piece must be matched once,
and nothing else may be matched. A match that starts on the right line but is the
wrong piece of code (a name instead of the whole declaration) does not pass.

Commands run with no shell, in the clean copy of the code. A command that a shell
would read differently from how it is written here (a `$` inside double quotes, a
pipe) is refused, so that a passing answer also works when pasted into a shell.
"""
import argparse, json, os, subprocess

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
                elif d in "$`!":
                    raise ValueError(f"a shell expands `{d}` inside double quotes: use single quotes")
                else:
                    word += d
        elif c == "\\":
            if i >= len(command):
                raise ValueError("a backslash has nothing after it")
            word, in_word, i = word + command[i], True, i + 1
        elif c in SPECIAL or c in "\r\n":
            raise ValueError(f"a shell interprets `{c}`: quote it with single quotes")
        else:
            word, in_word = word + c, True
    if in_word:
        out.append(word)
    return out


def run(binary, command):
    """Return (list of spans, note) or (verdict string, reason)."""
    try:
        argv = words(command)
    except ValueError as e:
        return "invalid", str(e)
    if len(argv) < 2 or argv[0] != "ast-grep" or argv[1] not in ("run", "scan"):
        return "invalid", "not `ast-grep run` or `ast-grep scan`"
    if "src" not in argv[2:]:
        return "invalid", "does not search `src`"
    for word in argv[2:]:
        name = word.split("=")[0]
        short = word.startswith("-") and not word.startswith("--")
        if name in ("--update-all", "--interactive", "--stdin", "--rewrite", "--rule", "--config", "--json") \
                or (short and word[1:2] in ("r", "c")) \
                or (short and any(ch in word[1:] for ch in "Ui") and word[1:2] not in ("p", "l", "k")):
            return "invalid", f"`{word}` is not allowed here"
    try:
        ran = subprocess.run([binary, argv[1], "--json=stream"] + argv[2:], cwd=os.path.join(HERE, "clean"),
                             capture_output=True, text=True, timeout=60, stdin=subprocess.DEVNULL)
    except subprocess.TimeoutExpired:
        return "error", "timed out"
    except OSError as e:
        return "error", f"ast-grep could not start: {e}"
    said = next((l.strip() for l in ran.stderr.splitlines() if l.strip()), "")
    failed = ran.returncode not in (0, 1) or any(
        l.strip().lower().startswith("error") and "error(s) found in code" not in l
        for l in ran.stderr.splitlines())
    if failed:
        return "error", said[:160]
    got = []
    for line in ran.stdout.splitlines():
        if not line.strip():
            continue
        try:
            m = json.loads(line)
            r = m["range"]
            got.append([os.path.normpath(m["file"]), r["start"]["line"] + 1, r["start"]["column"],
                        r["end"]["line"] + 1, r["end"]["column"]])
        except (ValueError, KeyError, TypeError):
            return "error", "printed something other than matches"
    return got, said[:160]


def judge(got, expected):
    """Pair each match with one expected piece. Return (missed, extra, wrong_piece)."""
    free = list(expected)
    extra = wrong_piece = 0
    for file, *span in got:
        start, end = tuple(span[:2]), tuple(span[2:])
        hit = next((e for e in free if e["file"] == file
                    and tuple(e["most"][:2]) <= start <= tuple(e["least"][:2])
                    and tuple(e["least"][2:]) <= end <= tuple(e["most"][2:])), None)
        if hit:
            free.remove(hit)
        else:
            extra += 1
            # Starts on an expected line, but is not the expected piece of code.
            wrong_piece += any(e["file"] == file and e["least"][0] == span[0] for e in expected)
    return len(free), extra, wrong_piece


def grade(binary, answers_path):
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
            results[task] = ("none", "no answer", "")
            continue
        got, said = run(binary, answers[task])
        if isinstance(got, str):
            results[task] = (got, said, answers[task])
            continue
        missed, extra, wrong_piece = judge(got, expected)
        if not missed and not extra:
            results[task] = ("pass", "", answers[task])
        else:
            detail = f"missed {missed} of {len(expected)}, {extra} extra"
            if wrong_piece:
                detail += f" ({wrong_piece} on a right line but not the right piece of code)"
            results[task] = ("wrong", detail + (f"; {said}" if said else ""), answers[task])
    return results


def main():
    parser = argparse.ArgumentParser(description="Grade one answers file against the expected matches.")
    parser.add_argument("binary", help="the ast-grep program to run")
    parser.add_argument("answers", help="a file with one `T01: ast-grep ...` line per task")
    parser.add_argument("--quiet", action="store_true", help="print only the total")
    args = parser.parse_args()
    results = grade(os.path.abspath(args.binary), args.answers)
    for task, (verdict, detail, command) in results.items():
        if not args.quiet:
            print(f"{task} {verdict:7} {detail}")
            if verdict != "pass" and command:
                print(f"            {command}")
    print(f"{sum(v == 'pass' for v, _, _ in results.values())} of {len(results)} pass")


if __name__ == "__main__":
    main()

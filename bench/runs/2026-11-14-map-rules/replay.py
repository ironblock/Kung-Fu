#!/usr/bin/env python3
"""Run a breaker's own commands again, and save the state of the source at each `ley check` it made.

    replay.py RECORD BOX OUT LEY [--dry]

RECORD  the harness's record of the breaker: every command and every edit it made, in order
BOX     the breaker's directory as it was left: `src`, `src.orig`, `ley.toml`, `bin`
OUT     an empty directory; a copy of BOX is made in it, and the commands are run there
LEY     the real `ley`

A breaker wrote down each break in words. Its record holds the commands. This runs them again in a copy of
its directory, with `ley` replaced by a program that first saves how `src` differs from `src.orig`, then runs
the real `ley` and saves what it printed. So each break is recovered as the breaker made it, with no one
writing it again by hand.

It writes OUT/checks/NNN.patch and OUT/checks/NNN.out for each `ley check`, in order.
With --dry it runs nothing and prints each full path in a command that is not inside BOX.
"""
import json, os, re, shutil, subprocess, sys

SHIM = '''#!/usr/bin/env python3
import os, subprocess, sys
REAL, BOX, OUT = {real!r}, {box!r}, {out!r}
ran = subprocess.run([REAL] + sys.argv[1:], stdin=sys.stdin, capture_output=True)
if sys.argv[1:2] == ["check"]:
    n = len([f for f in os.listdir(OUT) if f.endswith(".patch")])
    diff = subprocess.run(["diff", "-ruN", "src.orig", "src"], cwd=BOX, capture_output=True)
    open(os.path.join(OUT, f"{{n:03d}}.patch"), "wb").write(diff.stdout)
    open(os.path.join(OUT, f"{{n:03d}}.out"), "wb").write(
        (" ".join(sys.argv[1:]) + "\\n" + "in " + os.getcwd() + "\\n").encode() + ran.stdout + ran.stderr)
sys.stdout.buffer.write(ran.stdout)
sys.stderr.buffer.write(ran.stderr)
sys.exit(ran.returncode)
'''


def steps(record):
    for raw in open(record, encoding="utf-8"):
        try:
            entry = json.loads(raw)
        except ValueError:
            continue
        content = (entry.get("message") or {}).get("content")
        if not isinstance(content, list):
            continue
        for block in content:
            if isinstance(block, dict) and block.get("type") == "tool_use" and block.get("name") in ("Bash", "Edit", "Write"):
                yield block["name"], block.get("input") or {}


def main():
    dry = "--dry" in sys.argv
    record, box, out, ley = [os.path.abspath(a) for a in sys.argv[1:5]]
    work = os.path.join(out, os.path.basename(box))
    checks = os.path.join(out, "checks")
    if dry:
        outside = set()
        for name, given in steps(record):
            for text in (given.get("command"), given.get("file_path")):
                for path in re.findall(r"(?<![\w$.~/-])/(?:[\w.+@-]+/)*[\w.+@-]+", text or ""):
                    if not path.startswith(box) and os.path.lexists(path) and path not in ("/dev/null", "/bin/bash", "/tmp"):
                        outside.add(path)
        print(os.path.basename(box), "full paths outside the breaker's directory:", sorted(outside) or "none")
        return
    assert not os.path.exists(work), work
    os.makedirs(checks)
    shutil.copytree(box, work, symlinks=True)
    assert subprocess.run(["diff", "-rq", "src", "src.orig"], cwd=work, capture_output=True).stdout == b"", "src is not as it began"
    for tool in os.listdir(os.path.join(work, "bin")):
        path = os.path.join(work, "bin", tool)
        text = open(path, encoding="utf-8").read()
        if tool == "ley":
            text = SHIM.format(real=ley, box=work, out=checks)
        else:  # the other tool's wrapper keeps its log beside the copy
            text = re.sub(r'LOG, NAME = ("[^"]+"), "[^"]+\.calls\.jsonl"',
                          lambda m: f'LOG, NAME = {m.group(1)}, {os.path.join(out, "calls.jsonl")!r}'.replace("LOG, NAME = ", "LOG, NAME = ", 1), text)
            text = re.sub(r'(REAL, LOG, NAME = "[^"]+", )"[^"]+"', lambda m: m.group(1) + json.dumps(os.path.join(out, "calls.jsonl")), text)
        open(path, "w", encoding="utf-8").write(text)
        os.chmod(path, 0o755)
    ran = 0
    for name, given in steps(record):
        if name == "Bash":
            command = (given.get("command") or "").replace(box, work)
            done = subprocess.run(["bash", "-c", command], cwd=work, capture_output=True, text=True, timeout=600)
            ran += 1
        else:
            path = (given.get("file_path") or "").replace(box, work)
            if not path.startswith(out):
                print("skipped, a file outside:", path)
                continue
            if name == "Write":
                os.makedirs(os.path.dirname(path), exist_ok=True)
                open(path, "w", encoding="utf-8").write(given.get("content") or "")
            else:
                text = open(path, encoding="utf-8").read()
                old, new = given.get("old_string") or "", given.get("new_string") or ""
                if old not in text:
                    print("an edit found nothing to replace in", os.path.relpath(path, work))
                    continue
                text = text.replace(old, new) if given.get("replace_all") else text.replace(old, new, 1)
                open(path, "w", encoding="utf-8").write(text)
    left = subprocess.run(["diff", "-rq", "src", "src.orig"], cwd=work, capture_output=True, text=True).stdout
    patches = sorted(f for f in os.listdir(checks) if f.endswith(".patch"))
    changed = [f for f in patches if os.path.getsize(os.path.join(checks, f))]
    print(f"{os.path.basename(box)}: {ran} commands run again; {len(patches)} calls of `ley check`, "
          f"{len(changed)} with the source changed; at the end src " + ("is as it began" if not left else "DIFFERS"))


main()

#!/usr/bin/env python3
"""Run the library's own unit tests on each change that `replay.py` recovered, and set them beside the rows.

    makers.py REPLAY LIB OUT [NAME ...]

REPLAY  the directory `replay.py` wrote into: REPLAY/<name>/checks/NNN.patch and NNN.out
LIB     a git checkout of Babylon Lite at 2dddc888f6695e433ab29ae5918bee221375d86f, with a `node_modules`
        that holds vitest. It is changed and put back, change by change.
OUT     where `base.json` (every unit test at the release, made once) and `makers.json` go

For each distinct change: did a row of the ledger fail at that state, and does a unit test whose imports
reach a changed file fail that passed at the release.
"""
import glob, json, os, re, subprocess, sys

SRC = "packages/babylon-lite"


def cases(path):
    if not os.path.exists(path):
        return {}
    return {(f["name"].split("/tests/lite/unit/")[-1], a["fullName"]): a["status"]
            for f in json.load(open(path)).get("testResults", []) for a in f.get("assertionResults", [])}


def run(lib, report, *args):
    if os.path.exists(report):
        os.remove(report)
    env = dict(os.environ, VITE_CONFIG_NATIVE_IGNORE_WARNING="true")
    subprocess.run(["npx", "vitest", *args, "--project", "unit", "--reporter=json", f"--outputFile={report}"],
                   cwd=lib, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=3600)
    return cases(report)


def clean(lib):
    subprocess.run(["git", "checkout", "-q", "--", SRC], cwd=lib, check=True)
    subprocess.run(["git", "clean", "-qfd", "--", SRC + "/src"], cwd=lib, check=True)


def rows_said(out):
    """(the line where `ley check` counts its rows, whether any row did other than hold)."""
    lines = [l for l in open(out, encoding="utf-8", errors="replace").read().splitlines() if re.match(r"\d+ rows?:", l)]
    if not lines:
        return "no count printed", None
    parts = [p.strip().rstrip(".") for p in lines[-1].split(":", 1)[1].split(",")]
    other = [p for p in parts if not (p.endswith(" hold") or p.endswith(" holds") or "no command" in p)]
    return lines[-1], bool(other)


def main():
    replay, lib, out = [os.path.abspath(a) for a in sys.argv[1:4]]
    only = sys.argv[4:]
    os.makedirs(out, exist_ok=True)
    base_path = os.path.join(out, "base.json")
    base = cases(base_path) or run(lib, base_path, "run")
    good = {k for k, v in base.items() if v == "passed"}
    whole = json.load(open(base_path))
    print(f"at the release: {whole['numPassedTests']} of {whole['numTotalTests']} cases pass, in {len(whole['testResults'])} files")
    results_path = os.path.join(out, "makers.json")
    results = json.load(open(results_path)) if os.path.exists(results_path) else {}
    for name in sorted(os.path.basename(d) for d in glob.glob(os.path.join(replay, "*")) if os.path.isdir(d)):
        if only and name not in only:
            continue
        seen = {}
        for patch in sorted(glob.glob(os.path.join(replay, name, "checks", "*.patch"))):
            text = open(patch, encoding="utf-8", errors="replace").read()
            if not text.strip():
                continue
            # The same change made twice is one change: the times in a patch's two header lines are left out.
            body = re.sub(r"(?m)^(---|\+\+\+) (\S+).*$", r"\1 \2", text)
            number = os.path.basename(patch)[:-len(".patch")]
            line, caught = rows_said(patch[:-len(".patch")] + ".out")
            if body in seen:
                results[f"{name}/{seen[body]}"].setdefault("made again at", []).append(number)
                continue
            seen[body] = number
            key = f"{name}/{number}"
            if key in results and "tests" in results[key]:
                continue
            files = sorted(set(re.findall(r"(?m)^\+\+\+ src/(\S+)", body)))
            clean(lib)
            applied = subprocess.run(["patch", "-s", "-p0", "-d", os.path.join(lib, SRC)], input=text, text=True,
                                     capture_output=True)
            if applied.returncode:
                results[key] = {"files": files, "rows": line, "rows caught": caught, "tests": None,
                                "note": "the patch did not apply: " + (applied.stdout + applied.stderr)[:200]}
            else:
                got = run(lib, os.path.join(out, "one.json"), "related", *[f"{SRC}/src/{f}" for f in files], "--run")
                failing = sorted(k for k, v in got.items() if v == "failed" and k in good)
                results[key] = {"files": files, "rows": line, "rows caught": caught,
                                "tests": {"files": len({k[0] for k in got}), "cases": len(got), "newly failing": len(failing),
                                          "first": list(failing[0]) if failing else None},
                                "tests caught": bool(failing),
                                "changed": [l for l in body.splitlines() if l[:1] in "+-" and l[:3] not in ("---", "+++")][:12]}
            clean(lib)
            json.dump(results, open(results_path, "w"), indent=1)
            r = results[key]
            print(key, ",".join(files)[:60], "| rows:", "caught" if caught else "missed", "| makers' tests:",
                  "n/a" if r["tests"] is None else ("caught" if r["tests caught"] else "missed"),
                  "" if r["tests"] is None else f"({r['tests']['newly failing']} of {r['tests']['cases']} cases)", flush=True)
    table = {}
    for key, r in results.items():
        if r.get("tests") is None:
            continue
        cell = ("rows" if r["rows caught"] else "") + ("+" if r["rows caught"] and r["tests caught"] else "") + \
               ("tests" if r["tests caught"] else "") or "neither"
        table[cell] = table.get(cell, 0) + 1
    print("distinct changes:", sum(table.values()), table)


main()

#!/usr/bin/env python3
"""Runs every check and proof the way WRITER.md's "Before you finish" asks, and writes tasks/RUNS.md.

For each code task: the check against reference, other, plain and every hollow*, each copied to the
file the ask names, with the check copied to app/checks/<id>.test.ts. For each question task: the proof
with expected.json, then once more for each field changed. Also one type check of every answer file
and of the checks. app/src and app/checks are left as they were found (empty, and helpers.ts only).
"""
import json
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APP = os.path.join(ROOT, "app")
TASKS = os.path.join(ROOT, "tasks")
OUT = os.path.join(TASKS, "tools", "out")
CODE = ["AP1", "AP2", "AP3", "AP4", "AP5", "AP6"]
QUESTIONS = ["AP7", "AP8"]

log: list[str] = []
all_as_they_must = True


def sh(cmd: str, cwd: str) -> tuple[int, str]:
    proc = subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True, text=True)
    return proc.returncode, proc.stdout + proc.stderr


def vitest(test_path: str, json_name: str) -> tuple[str, dict]:
    os.makedirs(OUT, exist_ok=True)
    out_file = os.path.join(OUT, json_name)
    if os.path.exists(out_file):
        os.remove(out_file)
    cmd = f"npx vitest run {test_path} --reporter=default --reporter=json --outputFile.json={os.path.relpath(out_file, APP)}"
    _, printed = sh(cmd, APP)
    with open(out_file) as f:
        report = json.load(f)
    return cmd, report, printed


def summarize(report: dict, printed: str) -> tuple[str, list[str], bool]:
    """Returns ("pass" | "fail", lines, every failure is an assertion)."""
    lines: list[str] = []
    only_assertions = True
    for file_result in report["testResults"]:
        if file_result.get("message"):
            only_assertions = False
            lines.append("file error: " + file_result["message"].splitlines()[0])
        for case in file_result["assertionResults"]:
            mark = "ok  " if case["status"] == "passed" else "FAIL"
            lines.append(f"{mark} {case['title']}")
            if case["status"] != "passed":
                first = (case.get("failureMessages") or ["(no message)"])[0].splitlines()[0]
                lines.append(f"     {first}")
                if not first.startswith("AssertionError"):
                    only_assertions = False
    summary = [l for l in printed.splitlines() if l.strip().startswith("Tests ")]
    lines.append(summary[-1].strip() if summary else "(no summary line)")
    status = "pass" if report["success"] else "fail"
    if report["numTotalTests"] == 0:
        status = "fail"
        only_assertions = False
    return status, lines, only_assertions


def record(title: str, commands: list[str], lines: list[str], verdict: str) -> None:
    log.append(f"### {title}\n")
    log.append("```")
    for c in commands:
        log.append(f"$ {c}")
    log.extend(lines)
    log.append("```")
    log.append(f"{verdict}\n")


def clean_app() -> None:
    for name in os.listdir(os.path.join(APP, "src")):
        path = os.path.join(APP, "src", name)
        shutil.rmtree(path) if os.path.isdir(path) else os.remove(path)
    for name in os.listdir(os.path.join(APP, "checks")):
        if name != "helpers.ts":
            path = os.path.join(APP, "checks", name)
            shutil.rmtree(path) if os.path.isdir(path) else os.remove(path)
    for name in ("tsconfig.tc.json",):
        path = os.path.join(APP, name)
        if os.path.exists(path):
            os.remove(path)


def variants(task: str) -> list[str]:
    names = os.listdir(os.path.join(TASKS, task))
    hollows = sorted(n for n in names if n.startswith("hollow") and n.endswith(".ts"))
    return ["reference.ts", "other.ts", "plain.ts"] + hollows


def type_check() -> None:
    global all_as_they_must
    clean_app()
    commands: list[str] = []
    for task in CODE:
        file = open(os.path.join(TASKS, task, "file.txt")).read().strip()
        for v in variants(task):
            dest = os.path.join(APP, "src", "__typecheck", task, v)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            shutil.copy(os.path.join(TASKS, task, v), dest)
        shutil.copy(os.path.join(TASKS, task, "reference.ts"), os.path.join(APP, file))
        shutil.copy(os.path.join(TASKS, task, "check.test.ts"), os.path.join(APP, "checks", f"{task}.test.ts"))
    for task in QUESTIONS:
        shutil.copy(os.path.join(TASKS, task, "proof.test.ts"), os.path.join(APP, "checks", f"{task}.proof.test.ts"))
    with open(os.path.join(APP, "tsconfig.tc.json"), "w") as f:
        json.dump({"extends": "./tsconfig.json", "compilerOptions": {"types": ["@webgpu/types", "node"]}, "include": ["src", "checks"]}, f)
    commands.append("cp tasks/<id>/<variant>.ts app/src/__typecheck/<id>/<variant>.ts   (every answer file of AP1-AP6)")
    commands.append("cp tasks/<id>/reference.ts app/<file.txt>; cp tasks/<id>/check.test.ts app/checks/<id>.test.ts; cp tasks/AP7|AP8/proof.test.ts app/checks/<id>.proof.test.ts")
    commands.append("write app/tsconfig.tc.json: extends tsconfig.json, adds the node types, includes src and checks")
    cmd = "(in app) npx tsc -p tsconfig.tc.json --noEmit, keeping the lines that start with src/ or checks/"
    commands.append(cmd)
    _, printed = sh("npx tsc -p tsconfig.tc.json --noEmit", APP)
    ours = [l for l in printed.splitlines() if l.startswith("src/") or l.startswith("checks/")]
    library = [l for l in printed.splitlines() if l.startswith("../babylon-lite/")]
    lines = ours if ours else ["(nothing: no type error in any answer file, check or proof)"]
    lines.append(f"(the same run printed {len(library)} errors inside ../babylon-lite itself, from missing WebXR types and from shader and worker imports only a bundler resolves; none in our files)")
    ok = not ours
    all_as_they_must = all_as_they_must and ok
    record("Type check of every answer file, check and proof", commands, lines, "As it must be: no type error in our files." if ok else "NOT as it must be.")
    clean_app()


def code_task(task: str) -> None:
    global all_as_they_must
    file = open(os.path.join(TASKS, task, "file.txt")).read().strip()
    log.append(f"## {task} (code task, `{file}`)\n")
    for v in variants(task):
        clean_app()
        os.makedirs(os.path.dirname(os.path.join(APP, file)), exist_ok=True)
        shutil.copy(os.path.join(TASKS, task, v), os.path.join(APP, file))
        shutil.copy(os.path.join(TASKS, task, "check.test.ts"), os.path.join(APP, "checks", f"{task}.test.ts"))
        cmd, report, printed = vitest(f"checks/{task}.test.ts", f"{task}-{v}.json")
        status, lines, only_assertions = summarize(report, printed)
        must_pass = v in ("reference.ts", "other.ts")
        if must_pass:
            ok = status == "pass"
            verdict = "As it must be: passes." if ok else "NOT as it must be: it must pass."
        else:
            ok = status == "fail" and only_assertions
            verdict = "As it must be: fails, and every failure is at an assertion." if ok else "NOT as it must be: it must fail at an assertion."
        all_as_they_must = all_as_they_must and ok
        record(
            f"{task} with {v}",
            [f"cp tasks/{task}/{v} app/{file}", f"cp tasks/{task}/check.test.ts app/checks/{task}.test.ts", f"(in app) {cmd}"],
            lines,
            verdict,
        )
    clean_app()


def question_task(task: str) -> None:
    global all_as_they_must
    log.append(f"## {task} (question task)\n")
    expected_path = os.path.join(TASKS, task, "expected.json")
    expected = json.load(open(expected_path))
    runs: list[tuple[str, dict]] = [("expected.json as written", expected)]
    for key, value in expected.items():
        changed = dict(expected)
        if isinstance(value, bool):
            changed[key] = not value
        else:
            changed[key] = value + 1 if value != 0 else 1
        runs.append((f"expected.json with `{key}` changed from {json.dumps(value)} to {json.dumps(changed[key])}", changed))
    for title, answer in runs:
        clean_app()
        shutil.copy(os.path.join(TASKS, task, "proof.test.ts"), os.path.join(APP, "checks", f"{task}.proof.test.ts"))
        with open(os.path.join(APP, "checks", f"{task}.expected.json"), "w") as f:
            json.dump(answer, f, indent=4)
        cmd, report, printed = vitest(f"checks/{task}.proof.test.ts", f"{task}-{len(log)}.json")
        status, lines, only_assertions = summarize(report, printed)
        if answer == expected:
            ok = status == "pass"
            verdict = "As it must be: passes." if ok else "NOT as it must be: it must pass."
        else:
            ok = status == "fail" and only_assertions
            verdict = "As it must be: fails at an assertion." if ok else "NOT as it must be: it must fail."
        all_as_they_must = all_as_they_must and ok
        record(
            f"{task} proof, {title}",
            [f"cp tasks/{task}/proof.test.ts app/checks/{task}.proof.test.ts", f"write the answer above to app/checks/{task}.expected.json", f"(in app) {cmd}"],
            lines,
            verdict,
        )
    clean_app()
    with open(expected_path) as f:
        assert json.load(f) == expected, "expected.json must be left as written"


def main() -> None:
    log.append("# Runs\n")
    log.append("Made by `python3 tasks/tools/run_all.py`, which runs each command below in turn and keeps what it printed: for vitest, the result of every case, the first line of each failure, and the summary line. Every run starts from an `app/src` that is empty and an `app/checks` that holds only `helpers.ts`, and the script puts them back that way at the end.\n")
    type_check()
    for task in CODE:
        code_task(task)
    for task in QUESTIONS:
        question_task(task)
    clean_app()
    left_src = os.listdir(os.path.join(APP, "src"))
    left_checks = os.listdir(os.path.join(APP, "checks"))
    log.append("## After the runs\n")
    log.append("```")
    log.append("$ ls app/src")
    log.extend(left_src or ["(empty)"])
    log.append("$ ls app/checks")
    log.extend(left_checks)
    log.append("```\n")
    log.append(f"Every run came out as it must: {'yes' if all_as_they_must else 'NO'}.\n")
    with open(os.path.join(TASKS, "RUNS.md"), "w") as f:
        f.write("\n".join(log))
    shutil.rmtree(OUT, ignore_errors=True)
    print("all as they must:", all_as_they_must)
    sys.exit(0 if all_as_they_must else 1)


if __name__ == "__main__":
    main()

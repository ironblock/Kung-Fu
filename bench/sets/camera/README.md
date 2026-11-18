# The camera set

Tasks about the camera code of Babylon Lite 1.39.0, commit `2dddc888f6695e433ab29ae5918bee221375d86f`. `bench/box.py` reads this directory. A run names it in its `run.json`.

## Where each part came from

Each part was copied on 2026-11-15 from `bench/runs/2026-11-15-reader`, which is left as it was. That run's own script still makes its numbers.

- `tasks/K1`, `tasks/P1`, `tasks/I1`, `tasks/B1` to `tasks/B6`: from that run's `tasks/`, each file as it was.
- `checks/helpers.ts` and `checks/vitest.config.ts`: from that run's `checks/`.
- `checks/runner-package.json`: that run's `runner-package.json`. It says which packages the runner holds.
- `checks/window-stub.ts`: new. It gives the grader a small `window`, for a run whose config says `"window": "stub"`.
- `app/`: that run's `scaffold/app`. It is the app each box starts from.

## The layout of a task

A task that asks for code has `ask.md`, `check.test.ts`, `reference.ts`, `plain.ts`, `file.txt` and `where.md`. `file.txt` names the file the ask names, from the app's root. A task may also have `other.ts`, a second right answer written another way.

A task that asks a question has `ask.md`, `proof.test.ts`, `expected.json`, `answer-file.txt` and `where.md`. The answer is the JSON file `answer-file.txt` names. It passes when each key has the value `expected.json` gives.

`python3 bench/box.py check-tasks bench/sets/camera` grades each reference answer, which must pass, and each plain answer, which must fail.

## Changes after a run

- **2026-11-18, `tasks/G1/check.test.ts`: one test added.** The four tests there write `camera.radius` and `camera.yaw` and read them back. An answer that puts its own accessors on the camera, with its own storage, passed them while the camera itself never moved. The new test keeps the camera's own accessors from before the call and reads the real values through them. Six kept tries had passed this way, five in `bench/runs/2026-11-17-effort-ladder` and one in `bench/runs/2026-11-16-small-screen`. G1 was graded again in both runs on the same day, and those six now fail. No other grade changed. The reference answer and the second right answer still pass, and the plain answer still fails.

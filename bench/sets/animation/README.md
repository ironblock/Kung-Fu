# The animation set

Tasks about the animation code of Babylon Lite 1.39.0, commit `2dddc888f6695e433ab29ae5918bee221375d86f`, `src/animation`. `bench/box.py` reads this directory. A run names it in its `run.json`.

## Where each part came from

- `tasks/`: written on 2026-11-18 by three Opus agents, each alone, with the library, its unit tests and the bare declarations of `src/animation`, and none of them with any note or the brief the note writers had. `AG1` to `AG8` are on the groups, the tick, masks, frame interpolation and evaluation; `AM1` to `AM8` on the manager, its tasks, weights, fades and the glTF mixer; `AP1` to `AP8` on property animations, easing, the types and the pointer mixer. Their brief, their run logs and their tools are in `bench/runs/2026-11-18-animation`.
- `app/` and `checks/`: copied from `bench/sets/camera`, unchanged.

## The layout of a task

As in `bench/sets/camera`, and one thing more: each code task holds one or more hollow answers, `hollow.ts` and `hollow-<name>.ts`. Each is an answer that does not do on the real library what the ask asks, in a way a check might miss, and `box.py check-tasks` requires each to fail.

15 tasks ask for code and nine ask a question. On 2026-11-18 `python3 bench/box.py check-tasks bench/sets/animation` graded 105 answers and ended with `window: stub; all as they must be`.

Later that day adversaries passed a wrong answer through each of the 15 code checks, and each check was mended so that it fails them. Their answers are kept as hollow answers, and `CHANGES-1.md` to `CHANGES-3.md` give every change to a check or an ask. `check-tasks` then graded 143 answers and ended with `window: stub; all as they must be`. Two question asks, AG6 and AG7, are 154 and 153 words by `wc -w`, a few over the writers' bound of 150; they are left as written.

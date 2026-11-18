# Notes on tasks no writer of them saw: the animation code

Written by Claude Opus 5.5 on 2026-11-18, before any task or note of this run was written and before any try. The maintainer chose to go on with Babylon Lite, and to have held-out tasks come from new parts of it. No try is sent until the maintainer says go.

## What it is for

Every result so far is on the camera code, where Claude models wrote both the tasks and the notes, from briefs that named the same kinds of hidden behaviour. So part of the notes' gain there may be built in. This run asks two things on a part of the library that no task or note has touched yet:

1. **Do the notes help on tasks their writers never saw, from writers who were never told what the tasks test?** This is the held-out score of `AGENTS.md`, "Keep the held-out scores before the first mend", and there will be only this one for these tasks and these notes.
2. **Does one writer's list do as well as a merge of three?** The camera notes took six writers, a merge and three rounds of editing. If one writer does as well, notes cost a fraction of that.

## The part

`src/animation` of Babylon Lite 1.39.0, commit `2dddc888f6695e433ab29ae5918bee221375d86f`: 14 files, about 122 KB of source, and makers' unit tests that run without a browser. Its functions take a time step directly (`tickAnimation`, `updateAnimationManager`), so a check can step it with no GPU and no clock.

Its declarations, cut by `box.py declarations --dirs animation --name animation --no-comments` with `tsc` 6.0.3: 18,263 bytes, sha256 `c49900276505a6cd2fb32145962328ab366d1022a54b1aa95d2fd8098b5fd934`.

## How the tasks and the notes are kept apart

- **Task writers:** three Opus agents, each with the library, its unit tests and the bare declarations. Their brief is the one the camera tasks' writers had (`bench/runs/2026-11-15-screen/WRITER.md`), turned to the animation code, with the audit's lessons on checks added (below). Each writes eight tasks on its own share of the files: 24 in all, at least five code tasks a writer.
- **Note writers:** three Opus agents, each with the library, its unit tests and the bare declarations. Their brief is the camera notes' (`bench/runs/2026-11-15-camera-notes/WRITER.md`), turned to the animation code, **with its list of the kinds of behaviour to look for taken out.** They are told who the reader is and that they do not know what it will be asked.
- **Neither side sees the other.** No task writer sees a note, the note brief, or another writer's tasks. No note writer sees a task or the task brief.
- **What cannot be kept apart.** Both sides are Claude models reading the same code. They will often find the same things, and that overlap is part of what is measured. The owning session sees both sides. Before the first score it changes no note, and it changes a task only for a fault in the task itself: its check, its ask, its proof.

## How each task is made sound before any try

What `bench/sets/camera/audit` found, made into rules for the writers and for the checks of the set:

- **Each code task has a hollow answer** that `check-tasks` must fail: an answer that does not do on the real library what the ask asks, in the most plausible way the writer can find. Kinds the audit found: keeping its own copy of a field and reporting it; its own loop or easing where the ask names the library's; a value right only for the check's own inputs; a unit the check's setup cannot tell apart.
- **Checks read the library's real state,** through what the library itself reports, not only through what the answer returns or what a field reads back.
- **Inputs go past the defaults:** ranges wider than the library's defaults, and more than one frame step.
- **A fresh reader** reads each ask with the bare declarations beside it and nothing else, and says what the task turns on and what the ask gives away. An ask that gives the behaviour away is written again.
- **A ceiling:** a stronger model is given each task with the declarations and the library's own source for `src/animation`, once. A task it fails is read before any try, for a fault in the ask.
- **Marked beforehand:** an agent who has seen no try marks, for each task, whether the one-writer list and the merged list state what it turns on. The rule is then asked on each group apart. Where no note states the thing, the notes should gain little; that group is the control.

## The arms

All on the 27B as the effort ladder's `low` had it, with message form 2, the default (no try here is set beside a try in form 1):

| Arm | Text | Tries |
|---|---|---|
| `names-low` | the bare declarations | 24 tasks x 3 = 72 |
| `one-low` | the declarations and one writer's notes, drawn by lot before any list is read | 72 |
| `merged-low` | the declarations and the three writers' notes, merged | 72 |

The bare arm is sent first, and every task is scored: none is dropped for being passed bare. At the effort ladder's pace the 216 tries take about an hour and a half and about 2.5 million tokens in all.

## How it is read

- **Task by task first.** Each task's passes in each arm.
- **Then the rule:** `box.passes_rule`, a quarter as the size that matters, a try cut off counted as a failure. Pairs: `one-low` against `names-low`, `merged-low` against `names-low`, `merged-low` against `one-low`; and the first two again on each group of tasks marked beforehand.
- **Then every failure is sorted:** the text's, the subject's, the test's, not known, or too long.

Tried on made-up subjects like the camera ones (`bench/sets/camera/audit` and the design work behind `bench/runs/2026-11-18-mended-notes`): with 20 to 40 tasks, a true gain of 0.35 is shown about 9 times in 10, a gain of a quarter about half the time, and a gain of 0.15 almost never. So `merged-low` against `one-low` will read "no difference as large as a quarter" unless the two differ by much.

## What each outcome changes

| What comes | What it means |
|---|---|
| Both notes arms beat the bare arm by 0.3 or more, shown | The gain carries to tasks that no note writer saw. The strongest result of the project so far. |
| Shown, but by clearly less than the camera's 0.43 | Part of the camera gain was built in by the shared briefs. The camera gain is reported as a development-set gain from then on. |
| No gain shown | On tasks chosen apart from the notes, the notes do not help this model by a quarter. The project's claim narrows to the camera tasks. |
| The gain is on the tasks a note states and not on the others | Notes teach what they say, and coverage is the lever. |
| `merged-low` and `one-low` differ by less than a quarter | One writer is enough, within a quarter: notes cost about a third as much. |
| `merged-low` shown above `one-low` | Merging is worth its cost. |

## My guesses

Written before anything is built.
- `names-low` passes 25 to 40 of 72.
- Both notes arms beat it, shown, by 0.2 to 0.35: less than on the camera tasks.
- `merged-low` against `one-low`: no difference as large as a quarter.
- About half the tasks are stated by the merged list, and fewer by the one-writer list.

## What it does not cover

Another model, another setting, a subject that can run code, or any part of the library but `src/animation`.

## Drawn by lot, before any list was written

`python3 -c "import random; print(random.Random(20261118).choice(['an-1','an-2','an-3']))"` printed `an-3`. The list of the note writer in workspace `an-3` is the one-writer arm's text. The draw was made on 2026-11-18, before any note writer had begun.

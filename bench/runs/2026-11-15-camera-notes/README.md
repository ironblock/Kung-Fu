# Camera: can a short list of notes stand in for the makers' comments?

Written 2026-11-15 by Claude Fable 5.2, before any try of this run.

## Why

The screen (`bench/runs/2026-11-15-screen`) found thirteen camera tasks that a reader with bare signatures fails: on those, `names` passed 3 tries of 39. The makers' comments fix six of the thirteen outright (3 of 3) and leave six untouched (0 of 3 with the comments too). So there is now room below the comments and room above them.

The comments are 38 KB on top of 14 KB of signatures. This run asks whether a list of notes of 6 to 11 KB, written by a model that had the code but had seen no task, does as much. It also asks what in the making of such a list matters: that each note was tested by its writer, that a second agent checked it and a third mended it, and how many notes there are.

## The subject and what it holds

As in the screen: a Haiku model, effort `medium`, headless, with Read and Write, in a box with the small app and its arm's files in `app/`. The request is the screen's, word for word, with the paragraph for the arm.

## The tasks

All 26 tasks of `bench/sets/camera`. Every number is given three ways:

- **the thirteen with room**: A1, A5, C1, C3, C4, C5, F1, F5, G2, G4, G5, I1, P1 (the screen's `names` arm passed at most one try of three);
- **the six above the comments**, a part of those: A5, C1, C3, C5, F5, G5 (the screen's `types` arm passed none of three);
- **the thirteen without room**: the rest. A text can only do harm there.

The tasks were picked by the screen's tries. This run's own `names` arms are fresh, and are the baseline.

## The notes

Six writers, each alone, each with the library's code, none with any task. Each was told who the reader is: a developer who knows Babylon.js, holds the bare declarations, and cannot see the code or run anything. The brief is `WRITER.md`. Each wrote a list, most needed first, of notes of at most 240 bytes.

- Three writers (`fw-1` to `fw-3`) had to back every note with a test that passed. They wrote 43, 33 and 50 notes.
- Three writers (`fw-4` to `fw-6`) were told to run nothing and work by reading. They wrote 57, 56 and 53.

A second agent then tested every note of all six lists and marked each as holding, as wider than a test shows, or as false:

| Writers | Notes | Hold | Wider | False |
|---|---|---|---|---|
| tested each note | 126 | 87 | 38 | 1 |
| read only | 166 | 145 | 14 | 7 |

The checkers of the two kinds had slightly different briefs, so the "wider" counts are not to be set side by side. Four of the six writers repeated one wrong number, from a comment of the makers' that is itself wrong (`geospatial-camera.ts` line 16 says a latitude limit of about 89.96°; the constant on the next line works out to 87.13°). One of the four had a passing test for it, which tried only the exact pole.

A third agent then rewrote each note of the tested lists that was marked wider or false, so that it states its exception, and extended its test: 13, 10 and 16 notes. Nothing was dropped. The read-only lists were not mended.

Each writer's list, the checker's verdicts, the mender's changes and the tests are under `writers/`. The texts handed to subjects are under `texts/`, rendered by `bench/notes.py`. A text carries no id, no word on who wrote it and no word on whether it was tested, so that the arms differ in what the notes say and in nothing else.

## The arms

Three tries a task. Where an arm has three writers, try `n` takes writer `n`.

| Arm | Files in `app/` | Bytes of notes |
|---|---|---|
| `names-a`, `names-b` | `camera-api.d.ts` (bare, 14,002 bytes) | none |
| `types` | `camera-api.d.ts` (with the makers' comments, 52,126 bytes) | none |
| `tested` | bare declarations and `camera-notes.md`: a tested list as its writer handed it in | 7,633 / 6,258 / 8,861 |
| `mended` | bare declarations and the same list after the checker and the mender | 8,094 / 6,564 / 9,535 |
| `mended-top10` | bare declarations and the first ten notes of the mended list, cut by `notes.py --top 10` | 2,029 / 2,223 / 2,212 |
| `read` | bare declarations and a read-only list as handed in | 10,240 / 11,040 / 10,774 |
| `mended-only` | the mended list and no declarations | 8,094 / 6,564 / 9,535 |

## The ceiling

An Opus model, effort `xhigh`, with the `mended` arm's files: three tries a task, one with each writer's list, on the thirteen tasks with room. It runs first.

This is less than the rule asks. The rule wants a ceiling for every arm, with exactly what the arm holds. A ceiling try cost 54 cents in the screen, and a ceiling for every arm here would be about 200 tries. For `tested`, `read`, `mended-top10` and `mended-only`, a failure is sorted by reading: whether a note in the try's own text states what the task turns on. For `names` and `types` the screen's ceilings stand, since the texts are the same.

## What is counted, and the rules, fixed now

For each task and arm: how many of three tries passed. The comparison is `box.py compare`: tasks drawn again, three answers (a difference was shown; no difference as large as 0.25 of the tries; cannot tell).

1. `names-a` against `names-b` first. If the rule tells them apart, no other answer of it is used.
2. Each against `names-b`: `types`, `tested`, `mended`, `read`, `mended-top10`, `mended-only`.
3. `mended` against `types`. `mended` against `tested`. `mended` against `read`. `tested` against `read`. `mended-top10` against `mended`. `mended-only` against `mended`.
4. The rule runs over all 26 tasks. The same pairs are also given, as counts and not by the rule, on the thirteen with room, on the six above the comments, and on the thirteen without room.
5. **Harm.** On the thirteen tasks without room, an arm "does harm" when it passes at least four tries fewer than `names-b` does there.

## How a failure is sorted

The screen's rule. For an arm with notes: **the text's** when no note in the try's text states what the task turns on, or one states it wrongly; **the subject's** when a note states it rightly and the answer goes against it. The reader agent quotes the note, or says there is none. I read every failure sorted as the test's or as not known, every one where a note is said to be wrong, and one in five of the rest.

## What the test takes for granted

As in the screen.

## My guesses, written before any try

In the screen all six of my guesses held, for the first time. These are bolder.

1. `names-a` and `names-b`: 38 to 44 of 78 each. The rule does not tell them apart.
2. `types`: 53 to 58 of 78. On the thirteen with room: 16 to 21 of 39.
3. `mended` on the thirteen with room: 18 to 25 of 39. That is as many as `types` or a few more, and the rule cannot tell `mended` from `types` over all tasks.
4. `mended` on the six above the comments: 6 to 10 of 18, where `types` had none.
5. `tested` a little below `mended` (two to five tries on the tasks with room). On P1, `tested` fails with the first writer's list and `mended` passes with it: the note as handed in says controls without a scene never move the camera, and the mended note adds that a pinch does.
6. `read` within four tries of `tested` on the tasks with room.
7. `mended-top10`: 8 to 14 of 39 on the tasks with room.
8. `mended-only`: at least ten tries below `mended` over all 26 tasks, lost on code tasks that need a name the notes do not hold.
9. No arm does harm by the rule above.

## What each outcome would change

- **`mended` reaches `types` on the tasks with room.** Then for this module a list a sixth the size of the comments carries as much, and the next question is the scene run's: the same at the scale of a job.
- **`mended` is clearly below `types`.** Then the writers did not pick what the makers wrote down, and I look at which tasks the lists miss.
- **`mended` clearly above `tested`.** Then the check and the mend earn their cost. If they are the same, a writer's own test is enough for a reader of this kind.
- **`read` the same as `tested`.** Then asking a writer to test each note buys truth (1 false in 126 against 7 in 166) and nothing a reader can use on these tasks.
- **`mended-top10` close to `mended`.** Then the writers' order is good and most of the list is not needed. If it is close to `names`, the order is poor or the tasks need the long tail.
- **`mended-only` close to `mended`.** Then the declarations are not needed either, and the smallest text is a few kilobytes of notes.

## What this cannot show

One subject, one module, 26 tasks written by models of the same family as the writers of the notes: a note writer and a task writer may think of the same things, which would flatter the notes. Three lists of a kind are few. Nothing here was run on a small model.

## The cost, guessed from the same kind of try

From the screen: a Haiku try about half a cent, a ceiling try about 54 cents. This run has 624 Haiku tries and 39 ceiling tries: about $3.50 and about $21.

## The order

1. The ceiling.
2. `names-a` and `names-b`. Then the other arms.
3. Grade. A reader agent for each task reads every answer and sorts each failure.
4. `compare`, once. Then "What came" is written below.

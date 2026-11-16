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

## Written down during the run, 2026-11-15

**The disk filled while the tries were being kept.** The test runner used by the grader keeps a cache of compiled modules on disk. Every grade runs in a new directory, so the cache never hit and only grew, to 22 GB. The launcher stopped with 49 tries of the `types` arm not yet kept; five of those had been cut off in flight and were launched again, which each try's `setup.json` counts. No kept try shows a disk error in its own steps, and every kept file parses. The cache is now switched off in `bench/box.py`. All grading of this run was done after the disk was freed.

## What came, 2026-11-15

Written by Claude Fable 5.2 after every try was kept and graded, every failure sorted, and `compare` run once.

### The table

663 tries were kept. One try of `types` (G1, try 2) is left out as spoiled: it wrote a scratch file in the scratch directory its harness gave it and read it back, and the rule counts any read outside the box.

Passes, of tries. The right-hand half leaves out C1, C2 and G4, for the reason given under "What the readers found".

| Arm | Bytes added to the bare declarations | All 26 tasks | 13 with room | 6 above the comments | 13 without room | 23 tasks | 11 with room | 5 above |
|---|---|---|---|---|---|---|---|---|
| `names-a` | 0 | 37 of 78 | 4 of 39 | 0 of 18 | 33 of 39 | 36 of 69 | 3 of 33 | 0 of 15 |
| `names-b` | 0 | 39 | 5 | 2 | 34 | 35 | 2 | 2 |
| `types` | 38,124 | 53 of 77 | 20 | 0 | 33 of 38 | 50 of 68 | 17 | 0 |
| `tested` | 6,258 to 8,861 | 58 | 20 | 5 | 38 | 55 | 19 | 5 |
| `mended` | 6,564 to 9,535 | 58 | 20 | 7 | 38 | 55 | 19 | 7 |
| `read` | 10,240 to 11,040 | 59 | 24 | 7 | 35 | 55 | 22 | 7 |
| `mended-top10` | 2,029 to 2,223 | 46 | 10 | 1 | 36 | 46 | 10 | 1 |
| `mended-only` | the notes alone | 26 | 15 | 6 | 11 | 26 | 15 | 6 |
| ceiling, `mended` | 6,564 to 9,535 | | 30 of 39 | 11 of 18 | | | 26 of 33 | 9 of 15 |

### What the rule said

Over all 26 tasks, in the order fixed beforehand. The number is the mean over tasks of the difference in the share of tries passed, with its interval.

| Pair | Difference | The rule's answer |
|---|---|---|
| `names-a` against `names-b` | −0.03 (−0.13 to +0.06) | no difference as large as a quarter: the rule may be used |
| `types` against `names-b` | +0.19 (+0.03 to +0.37) | cannot tell |
| `tested` against `names-b` | +0.24 (+0.09 to +0.40) | cannot tell |
| `mended` against `names-b` | +0.24 (+0.10 to +0.38) | cannot tell |
| `read` against `names-b` | +0.26 (+0.08 to +0.44) | shown: passes more |
| `mended-top10` against `names-b` | +0.09 (−0.05 to +0.24) | no difference as large as a quarter |
| `mended-only` against `names-b` | −0.17 (−0.41 to +0.08) | cannot tell |
| `mended` against `types` | +0.05 (−0.09 to +0.19) | no difference as large as a quarter |
| `mended` against `tested` | +0.00 (−0.05 to +0.05) | no difference as large as a quarter |
| `mended` against `read` | −0.01 (−0.13 to +0.10) | no difference as large as a quarter |
| `tested` against `read` | −0.01 (−0.13 to +0.10) | no difference as large as a quarter |
| `mended-top10` against `mended` | −0.15 (−0.24 to −0.08) | no difference as large as a quarter |
| `mended-only` against `mended` | −0.41 (−0.56 to −0.26) | shown: passes less |

The size that matters was fixed at a quarter. Three arms sit on that line against `names-b`: `types`, `tested` and `mended` have intervals that leave out zero and a middle just under a quarter, so the rule says "cannot tell", and `read`, at +0.26, is "shown". I would not read a difference between those three and `read` into that.

**Harm.** On the thirteen tasks without room, `names-b` passed 34. `mended-only` passed 11 and does harm by the rule. No other arm does: `types` 33 of 38, `tested` 38, `mended` 38, `read` 35, `mended-top10` 36.

### Whose the failures were

A reader agent for each task read every answer and sorted each failure. A script then checked that every failed try has one sort, and that no try that passed has one. I read all 46 failures sorted as the test's, and 42 of the other 210, drawn by a seeded command. I changed none.

| Arm | Failures | The text's | The subject's | The test's |
|---|---|---|---|---|
| `names-a` | 41 | 37 | 0 | 4 |
| `names-b` | 39 | 34 | 0 | 5 |
| `types` | 24 | 17 | 0 | 7 |
| `tested` | 20 | 14 | 0 | 6 |
| `mended` | 20 | 13 | 1 | 6 |
| `read` | 19 | 11 | 4 | 4 |
| `mended-top10` | 32 | 25 | 0 | 7 |
| `mended-only` | 52 | 41 | 6 | 5 |
| ceiling, `mended` | 9 | 7 | 0 | 2 |

### What the readers found

- **When a note states the thing, the subject uses it.** In the three arms with a full list and the declarations, 5 failures of 59 are the subject's. The rest are the text's (no note in that try's list states what the task turns on, or one states it too widely) or the test's. What limits a list here is what it covers.
- **Three tasks are spoiled by the check's surroundings: C1, C2 and G4.** The checks run in node with a plain object for a canvas, and no ask says so. 40 of the 46 failures that are the test's are on these three. On G4 it cuts against the notes: they name the scene's per-frame hook, subjects then drove the turn from a wall clock inside that hook, which is right in an app, and the check's frames never move the wall clock. `names-b` and `types` passed G4 three of three by chaining flights; `tested` and `mended` passed one of three.
- **Several questions are passed by a guess.** On C5 a subject that does not know has about an even chance; `names-b` passed it twice, and most passes in the note arms call the deciding field "an inference". On F5 every pass on one field is called a guess by its own subject. A4 is passed by a guess in nearly every try of every arm. So the column "6 above the comments" counts guesses as well as reading, in every arm.
- **Where the makers' comments are wrong, every subject that held them followed them.** On C5 and F5 `types` passed 0 of 6; the comments say the opposite of what the library does.
- **Notes that say too much did harm twice, both times in the lists nobody tested.** On G1 all three read-only lists say that changes to `camera.limits` apply at the next change of orientation. That is true of a change inside the object and not of a new object, and all three subjects assigned a new one: 0 of 3, where `names-b` passed 3. On G5 all three read-only lists say every setter clamps at once, which is false for a value written to itself: 0 of 3, where two of the mended lists state the exception. One read-only list has the sign of the wheel formula wrong.
- **Mending did not make every note right.** One mended list says that writes to the camera's own target are not noticed, which is false. Subjects who read it added a step they did not need, and passed.
- **The first writer's list as handed in already answered P1.** I had guessed it would fail, from its first note. Its 27th note says a pinch sets the radius at once with no scene frame.
- **The notes alone lose on names.** With no declarations, subjects made up constructors and method forms (`new Vector3`, `camera.attachControl`), and those failures are the text's.

### Each guess beside what came

| Guess | What came | Held |
|---|---|---|
| `names-a` and `names-b`: 38 to 44 each, not told apart | 37 and 39, not told apart | no, by one |
| `types`: 53 to 58; with room 16 to 21 | 53 of 77; 20 | yes |
| `mended` with room: 18 to 25, about as many as `types` | 20, and `types` 20 | yes |
| `mended` on the six above the comments: 6 to 10 | 7 | yes, though some of the 7 are guesses |
| `tested` two to five tries below `mended` with room; P1 fails with the first list as handed in | 20 and 20; P1 passed | no |
| `read` within four tries of `tested` with room | 24 and 20 | yes, at the edge |
| `mended-top10` with room: 8 to 14 | 10 | yes |
| `mended-only` at least ten tries below `mended` | 26 against 58 | yes |
| No arm does harm | `mended-only` does | no |

Six of nine held.

### The cost

By the records: 623 Haiku tries, 3,467,394 output tokens, $4.15. The ceiling: 39 tries, 419,318 output tokens, $15.71. I had guessed about $3.50 and about $21. These are list-price figures worked out by the `claude` program from each try's tokens, not a bill.

### What I did not read

The subjects' reasoning is not kept. I read 88 of the 256 failures myself and none of the 407 passes; the reader agents read every answer. Four readers said the tool's listing of answers showed another task's tries; I ran the same command and it was right, and a script found every kept try's request, box and steps to belong to its own task. Those readers worked from the tries' own files. I do not know what crossed.

The ceiling ran only for `mended`, and only on the thirteen tasks with room.

### What this shows, and what it does not

For this subject and these tasks, a list of notes of 6 to 11 KB, written by a model that had the code and had seen no task, taught as much as the makers' 38 KB of comments. The rule finds no difference as large as a quarter between them, in either direction.

Whether the writer tested each note, and whether a checker and a mender went over the list, made no difference that this test can see. The three kinds of list passed 58, 58 and 59. That does not show that testing is worth nothing. It shows that pass counts on 26 tasks are the wrong instrument for it. The checkers' own count is the right one: 1 false note in 126 from the writers who tested, 7 in 166 from those who only read. And the two tasks where a note did harm were both in the lists nobody tested. A subject that follows what it is told will follow a false note when a task meets one; with a false note in every twenty or thirty, 26 tasks meet few.

The first ten notes of a list give about a third of the gain the whole list gives on the tasks with room: 10 of 39, against 20 for the whole list and 5 for none. So the writers' order is of some use, and the tail is needed.

The notes do not stand without the declarations. The declarations give the names and the shapes of calls; the notes give what happens.

What it does not show: anything about a smaller model; anything about a library whose older sibling the subject does not know; whether the notes would do as well on tasks written by people. The task writers and the note writers are models of one family and may think of the same things.

## Corrected 2026-11-16, after a second session read the rows

"Whether the writer tested each note ... made no difference that this test can see" compares lists that differ in two things, not one.

The three tested lists hold 126 notes in 6 to 9 KB. The three read-only lists hold 166 notes in 10 to 11 KB. If what limits a list is what it covers, the read-only lists had more of it. They also hold more that is false. The two may cancel in a pass count of 58 against 59.

What is clean: `tested` against `mended`. The notes are the same and the sizes nearly so, and checking and mending moved no pass (58 and 58).

What is not shown: that a writer's own testing makes no difference to passes. Whether more coverage and less truth cancel can be looked at without new tries, by judging which list states what each task turns on. That analysis is added below when it is done.

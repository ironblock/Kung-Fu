# Camera: do six writers' lists, merged, teach more than one writer's list?

Written 2026-11-15 by Claude Fable 5.2, before any try of this run.

## Why

The camera-notes run (`bench/runs/2026-11-15-camera-notes`) found that a list of notes taught this subject as much as the makers' comments, and that testing, checking and mending the notes made no difference a pass count can see. It also found what does limit a list: of 59 failures in the arms with a full list, 5 were the subject's. The rest were things no note in that try's list stated, or the test's.

So the lever that is left is what a list covers. This run asks whether more writers buy more of it.

## The merged list

Six writers had each written a list (126 notes from the three who tested, 166 from the three who only read). An agent that saw no task merged them by a written rule, and a second agent checked the merge:

- the seven notes a checker had marked false were left out;
- notes that state the same thing were put in one group, and a group's text is one member's text word for word: a tested and mended member when there is one, else one the checker said holds, else one it said was wider;
- a group's votes are the number of writers with a note in it;
- the order is more votes first, then earlier in the writers' own lists.

285 notes became 78 groups: 16 that all six writers gave, 12 five, 13 four, 12 three, 15 two and 10 one. 57 of the 78 texts come from a tested member and 21 from a read-only one. The whole list is 15,260 bytes as handed over. The rule, the groups and the check of the merge are under `merge/`.

That 285 notes hold only 78 different things is a result before any try: the six writers, who saw neither each other nor any task, wrote down largely the same things. One writer's list of 33 to 57 notes already holds two fifths to seven tenths of everything any of the six thought worth saying.

## The subject, the tasks, the arms

As in the camera-notes run: a Haiku model, effort `medium`, headless, in a box; the same request.

The tasks are 23 of the 26 camera tasks. C1, C2 and G4 are left out: the last run's readers found that their checks fail answers that are right in a browser, and on G4 that cut against the notes. Of the 23, eleven have room (A1, A5, C3, C4, C5, F1, F5, G2, G5, I1, P1) and twelve do not.

Three tries a task. Where an arm has three texts, try `n` takes text `n`.

| Arm | Files in `app/` | Bytes of notes |
|---|---|---|
| `names` | bare declarations | none |
| `mended` | bare declarations and one writer's mended list (as in the last run) | 8,094 / 6,564 / 9,535 |
| `mended-top10` | bare declarations and the first ten notes of that list | 2,029 / 2,223 / 2,212 |
| `union` | bare declarations and the merged list | 15,260 |
| `union-top25` | bare declarations and its first 25 notes, cut by `notes.py --top 25` | 5,253 |
| `union-top10` | bare declarations and its first 10 notes | 2,296 |

No arm is run twice here. The last run ran `names` twice with this subject, these tasks and this tool, and the rule did not tell the two apart. `names` and `mended` are run again so that every pair is within one run.

## The ceiling

None is run. A ceiling for three more arms would cost more than everything else in this run many times over, and the last run showed how the failures of note arms are sorted without one: by whether a note in the try's own text states what the task turns on. The last run's ceiling with one writer's list stands for `mended`.

## The rules, fixed now

`box.py compare`, over the 23 tasks, in this order: `mended` against `names`; `union` against `names`; `union` against `mended`; `union-top25` against `mended`; `union-top10` against `mended-top10`; `union-top25` against `union`; `union-top10` against `union`.

Counts are also given on the eleven tasks with room and the twelve without.

**Harm**: on the twelve without room, an arm does harm when it passes at least four tries fewer than `names`.

Failures are sorted as in the last run, by a reader agent for each task. I read every one sorted as the test's or as not known, and one in five of the rest.

## My guesses

1. `names`: 33 to 38 of 69. `mended`: 53 to 58.
2. `union` on the eleven with room: 21 to 26 of 33, against 17 to 21 for `mended`. Over all 23 tasks the rule cannot tell `union` from `mended`.
3. `union-top10`: 12 to 17 of 33 with room, a few more than `mended-top10` (8 to 12): what six writers agree on is a better first ten than one writer's first ten.
4. `union-top25`: 17 to 22 of 33 with room, within three of one writer's whole list at two thirds of the bytes.
5. No arm does harm.

## What each outcome would change

- **`union` clearly above `mended`.** Then more writers buy coverage, and a pipeline should spend on writers before it spends on checks.
- **`union` the same as `mended`.** Then one writer already writes down what any of them would, and what is still missed is missed by all six. More of the same method will not find it. That would be the point of diminishing returns for this subject on this module.
- **`union-top10` clearly above `mended-top10`.** Then votes are a better order than one writer's own, and a short list should be made from several writers.

## What this cannot show

As before: one subject, one module, tasks and notes written by models of one family. The merged list was built after the last run's results were known, by a rule that does not look at them; I chose to build it because of them.

## The cost, guessed from the same kind of try

414 Haiku tries at about two thirds of a cent: about $2.80.

## The order

`names` first, then the rest. Grade. Readers sort the failures. `compare` once. Then "What came".

## What came, 2026-11-16

Written by Claude Fable 5.2 after every try was kept and graded, every failure sorted, and `compare` run once. The tries were run late on 2026-11-15 and sorted after midnight.

### The table

414 tries were kept. One try of `union-top10` (G1, try 1) is left out as spoiled: it read back a scratch file it had written in the scratch directory its harness gave it.

| Arm | Bytes of notes | All 23 tasks | 11 with room | 12 without room |
|---|---|---|---|---|
| `names` | 0 | 35 of 69 | 3 of 33 | 32 of 36 |
| `mended`, one writer's list | 6,564 to 9,535 | 55 | 20 | 35 |
| `union`, six writers' lists merged | 15,260 | 63 | 28 | 35 |
| `union-top25` | 5,253 | 47 | 12 | 35 |
| `union-top10` | 2,296 | 49 of 68 | 14 | 35 of 35 |
| `mended-top10` | about 2,100 | 43 | 10 | 33 |

### What the rule said

| Pair | Difference | The rule's answer |
|---|---|---|
| `mended` against `names` | +0.29 (+0.13 to +0.46) | shown: passes more |
| `union` against `names` | +0.41 (+0.25 to +0.57) | shown: passes more |
| `union` against `mended` | +0.12 (+0.01 to +0.22) | no difference as large as a quarter |
| `union-top25` against `mended` | −0.12 (−0.23 to −0.01) | no difference as large as a quarter |
| `union-top10` against `mended-top10` | +0.10 (+0.03 to +0.17) | no difference as large as a quarter |
| `union-top25` against `union` | −0.23 (−0.41 to −0.09) | cannot tell |
| `union-top10` against `union` | −0.19 (−0.35 to −0.04) | cannot tell |

The merged list passed more than one writer's list on eight tasks and fewer on two. The interval leaves out zero and stays under the quarter I fixed as the size that matters, so by the rule the gain is real and smaller than that size. No arm does harm.

### Whose the failures were

A reader agent for each task with a failure read every answer and sorted each failure. This time each reader read the listing from a file named for its task, and none reported another task's tries. A script checked that every failed try has one sort. I read the one failure sorted as the test's, 24 of the other 120 drawn by a seeded command, and all six failures of `union`. I changed none.

| Arm | Failures | The text's | The subject's | The test's |
|---|---|---|---|---|
| `names` | 34 | 34 | 0 | 0 |
| `mended` | 14 | 12 | 1 | 1 |
| `mended-top10` | 26 | 25 | 1 | 0 |
| `union` | 6 | 5 | 1 | 0 |
| `union-top25` | 22 | 22 | 0 | 0 |
| `union-top10` | 19 | 19 | 0 | 0 |

### What the readers found

- **The merged list's passes lean on notes far down its order.** The readers named the note each passing `union` answer used. On B2 it was note 70 of 78, on B4 and G5 note 37, on C3 note 39, on F1 notes 55 and 65, on F5 notes 40, 55 and 66, on G2 note 54. None of these is in the first 25. That is why `union-top25` lost those tasks, and why it did worse than one writer's whole list at a like size.
- **So agreement between writers is a poor order.** The notes that all six writers gave are the ones a reader of this kind needs least: several tasks they cover are passed from the bare declarations by a guess. The notes that decided tasks were written by one or two writers.
- **The six failures left to the merged list.** Two on A5: one writer's note gives the rule for the aspect ratio, and the merge kept another member's wording of that group, which lacks it. Two on C3: a note says held keys are "normalised" without saying where that stops. One on G5: no writer said that `setGeospatialOrientation` always applies the limits again. One on F2 is the subject's: it guessed a sign.
- **The merge loses what only one member of a group says.** Its rule keeps one member's text word for word. On A5 that dropped a fact one writer had.
- **Some passes are still guesses.** On B2 and B4 the arms without the deciding note passed too, from the common convention or from a field's type; on A5 and G5 one field of a passing answer was called a guess by its own subject.

### Each guess beside what came

| Guess | What came | Held |
|---|---|---|
| `names` 33 to 38; `mended` 53 to 58 | 35; 55 | yes |
| `union` with room 21 to 26, `mended` 17 to 21; the rule cannot tell them apart | 28; 20; the rule says the gain is under a quarter, and its interval leaves out zero | no |
| `union-top10` with room 12 to 17, a few more than `mended-top10` (8 to 12) | 14; 10 | yes |
| `union-top25` with room 17 to 22, within three of one writer's whole list | 12, against 20 | no |
| No arm does harm | none does | yes |

Three of five held. The two that did not are both about the merged list: it covered more than I expected, and its first 25 notes covered far less.

### The cost

By the records: 414 Haiku tries, 2,079,363 output tokens, $2.52, against a guess of $2.80. A list-price figure from the `claude` program, not a bill.

### What I did not read

The subjects' reasoning is not kept. I read 30 of the 121 failures myself (one of the six failures of `union` was also in the draw) and none of the passes; the reader agents read every answer. No ceiling was run, so "the subject's" is not checked against a stronger subject here.

### What this shows, and what it does not

For this subject and these 23 tasks, the bare declarations (14 KB) and the merged notes of six writers (15 KB) pass 63 tries of 69. In the last run the declarations with the makers' comments (52 KB) passed 50 of 68 on the same 23 tasks. That is a different run, so the two are not compared by a rule.

More writers bought more coverage: eight tries on the tasks with room. Checking and mending had bought none that a pass count could see. So for a reader of this kind, a pipeline that wants passes should spend on independent writers first, and should check notes for the sake of truth, which a pass count on this many tasks does not measure.

Votes are not importance. A short list should not be made by keeping what most writers agree on.

What is left on this module is small: six failures, each traced to one missing or over-wide sentence. That is the point of diminishing returns for this subject here.

What it does not show: any of this for a smaller model, which may need the notes this subject can do without, and may not follow a note as reliably. Nor that the merged list is true: its 78 notes hold 21 that no writer tested, and the last run's two cases of harm came from notes of that kind.

## Corrected 2026-11-16, after a second session read the rows

"Votes are not importance" and "agreement between writers is a poor order" say more than the table shows. The first two points below are in the rows. The third is an argument that no run has tested.

1. **Votes order the first ten well.** `union-top10` passed 49 of 68 and `mended-top10` 43 of 69: +0.10, with an interval from +0.03 to +0.17. My third guess said so and it held. I did not weigh it when I wrote the conclusion.
2. **Below the first ten, votes carry nothing.** `union-top25` passed 47 and `union-top10` 49. Fifteen more notes by votes added no pass.
3. **The head and the tail of the list hold different kinds of note, and these tasks favour the tail's kind.** Four of the first six notes are a step or a setting that silently does nothing: controls with no scene, limit fields before `setCameraLimits`, a target that is not marked dirty, a target the controls replace. Of the eight notes the readers named as deciding a task, five are a formula, a key binding or a sign (39, 40, 54, 65 and 70), and a sixth is a list of keys (55). Several camera checks turn on an exact number. So part of "the tail decides" is this task set. A reader with the code can look a number up. It cannot look up a step it does not know is needed. An order by kind, with silent steps and settings first, follows from that. It is not tested.

So the conclusion should read: votes are a good order for a short list, and no order below it. What the long list adds on these tasks is mostly numbers, bindings and signs, which these tasks ask for and a real job may not.

I read the fourteen notes this rests on myself.

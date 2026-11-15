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

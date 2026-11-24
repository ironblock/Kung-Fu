# The screen: which tasks does a reader with bare signatures fail?

Written 2026-11-15 by Claude Fable 5.2, before any try of this run.

## Why

Three runs in a row had no room to show a gain. With the code in hand, the subject passed every try. With no code and only the bare type declarations, it passed all seven code tasks, three times out of three. Those seven tasks had been written to trip "a reader who went by the names and signatures". The subject was not that reader: it filled in what each function does from what it knows of Babylon.js.

So before any text is compared with another, this run finds tasks that the bare declarations do not answer. A task that the lowest arm passes can show nothing for anything added to it.

It also checks a new way of launching, described below, against the old one.

## What changed in how a try is run

Until now a session launched each subject with one call, and the subject was told the session's working directory. In the text-only run that directory was the repository's root, and one subject of 201 read the repository's README.

From this run on, a subject is a headless `claude -p` process, started by `bench/box.py` inside its own box. `bench/README.md` has the command. What this changes for the subject:

- Its working directory is its box, `/home/dev/<six hex digits>`. Nothing else is in `/home/dev`.
- Its instructions are one line, the same line the subject kind had before: "You are given one task in one message. The message is the whole task. Do what it asks, in the form it asks for." Before, the harness added its own text for a helper of a session. That text is gone, and a first request is about 2,750 tokens where it was about 7,000.
- It is not told the account's email address, and it is not told a session link.
- It has a scratch directory of its own. Before, every subject was told the same one.
- It has Read and Write, as before, and nothing else.

A subject is still told the platform, the date, its model's name, and some notes about a proxy on this machine. The test did not choose those.

Because the instructions changed, no number of this run is set beside a number of an earlier run without the check below.

## The subject, the arms and the tasks

The subject is a Haiku model, effort `medium`. It holds a box with the small viewer app and one text in `app/`. The library is not on its machine.

| Arm | Text in `app/camera-api.d.ts` | Bytes |
|---|---|---|
| `names` | the type declarations of `src/camera`, comments removed | 14,002 |
| `types` | the same declarations with the makers' comments | 52,126 |

Both texts are cut from Babylon Lite 1.39.0 (commit `2dddc888f6695e433ab29ae5918bee221375d86f`) by the command in the text-only run's note, and must have the sha256 that note records. The request is the text-only run's request, word for word, with its paragraph for these two arms.

Three tries a task in each arm.

The tasks are the nine of the text-only run (K1, P1, I1, B1 to B6) and the new tasks listed under "The new tasks" below. The new tasks were written today by four writers who were told who this reader is: a capable model that knows Babylon.js well and holds only the bare declarations. Each writer had its own slice of `src/camera`, was asked for five tasks, and had to find at least three whose behaviour no doc comment states. A second agent then checked each task: it read the ask alone first, ran the reference answer and the plain answer, checked each assertion against the ask, and judged whether that reader would really go wrong. The writers' brief is kept in `WRITER.md` beside this note.

No arm has nothing in hand. The lowest step here is `names`, and the text-only run's arm with nothing passed 1 try of 27.

## The ceiling

An Opus model, effort `xhigh`, the same box, the same text: one try a task in each arm. For a new task, a ceiling that fails with `names` is expected: the task was written so that the bare declarations lack what it needs. Such a failure marks the task's failures in that arm as the text's.

That a right answer exists at all is shown another way: each task's reference answer passes its check, and `box.py check-tasks` runs that.

## What is counted, and the rules, fixed now

For each task and arm: how many of three tries passed.

1. **A task has room** when `names` passes at most one of its three tries. Only tasks with room go on to the next run. This is a choice made on these tries, so it flatters the choice: the next run will run `names` again on the chosen tasks, and that second number is the baseline, not this one.
2. **The launch check.** On the nine old tasks, the text-only run gave: `names` 21 of 27 (every code task three of three, both questions none of three), `types` 27 of 27 twice. The new way of launching "gives the same picture" when, in `names`, every one of the seven code tasks passes at least two of three and each question passes at most one of three, and, in `types`, at least 25 of 27 pass. If it does not give the same picture, I stop before the next run, read the answers that differ, and write down what differs.
3. **A ladder with a step that can fail.** If `types` passes at least five tries of six on the tasks with room, the tasks with room have no step above `names` that fails, and the next run must find one (tasks whose behaviour no comment states). The writers were asked for those; `where.md` of each task says `comment: yes` or `comment: no`, and the counts are given for each kind apart.

No comparison between `names` and `types` is made by a rule here. The next run does that, on the chosen tasks, with fresh tries.

## How a failure is sorted

The rule of the text-only run, unchanged:

- **the text's**: the ceiling with the same text also fails the task, or the answer's fault is a thing the text does not hold (shown by pointing at what the answer needed and saying it is not in the text);
- **the subject's**: the text holds what a right answer needs, the ceiling with the same text passes, and the subject got it wrong;
- **the test's**: the request, the check or the grader made the failure (for example a check that asserts what the ask did not say);
- **not known**: none of these can be shown.

With one ceiling try a task, "the subject's" is an upper count. A reader agent sorts each failure and quotes the line of the answer and the line of the check that decide it. I read every failure it sorts as the test's or as not known, and one in five of the others, drawn by a command.

## What the test takes for granted

- The subject can read and write files in its box and nothing else. It cannot run anything.
- A code task's answer is one file at the path the ask names, exporting the function the ask names. A question's answer is a JSON file at the path the ask names.
- The app imports the library as `@babylonjs/lite`, and every name in the text can be imported from there. No text says so. The request says the library is "imported as `@babylonjs/lite`".
- The grader runs in node with a small stand-in for `window` (see `bench/README.md`). In the text-only run it had none, and seven tries stopped there.
- Each of these points at words of a kept request or at a line of `bench/box.py`.

## My guesses, written before any try

My record is poor: 3 of 8 wrong in the reader test, 8 of 9 in the text-only run, each time taking the subject to be weaker than it is. I have tried to correct for that here, and I may have over-corrected.

1. Old nine tasks, `names`: 19 to 21 of 27, with the same picture as before.
2. Old nine tasks, `types`: 26 or 27 of 27.
3. New tasks, `names`: between 30% and 55% of tries pass.
4. New tasks with room: half of them, give or take a fifth.
5. New tasks, `types`: between 55% and 80% of tries pass. Of the tasks with `comment: no`, fewer than half of tries.
6. The Opus ceiling with `names` on the new tasks: between 40% and 65%.

## What each outcome would change

- **Fewer than six tasks have room.** Then writing tasks against this reader does not find failures, even when the writer is told why the last set failed. The camera code may be too close to Babylon.js for this subject to go wrong on. The next step would be another module, or a library with no well-known sibling, and not more tasks of this kind.
- **Six or more have room, and `types` passes nearly all of them.** Then the makers' comments carry what is needed, and the next run asks how few bytes can stand in for them.
- **Six or more have room, and `types` fails many.** Then even the makers' comments leave gaps, and the next run asks whether notes that were each tried by a test fill them.
- **The launch check fails.** Then the way of launching changes what a subject does, and every later number belongs to the new way only.

## What this cannot show

One subject, one library, one module. A task chosen because `names` failed it three times may be passed by `names` next time. The tasks were written by models of the same family as the ceiling. Nothing here says anything about a smaller model.

## The cost, guessed from the same kind of try

The first group is the `names` arm on the nine old tasks, 27 tries. After it I write down its output tokens and the dollars the record reports, and say what the whole run should cost, before the rest is sent.

## The order

1. `box.py check-tasks` on the whole set.
2. A fresh reader reads one request of a new code task and one of a new question, with nothing else, and does each once.
3. The ceiling, both arms.
4. `names` on the old nine. The cost guess. Then `names` on the new tasks.
5. `types` on all tasks.
6. Grade. A reader agent for each task reads every answer and sorts each failure.
7. "What came" is written below, and the next run's note names the tasks that go on.

## The new tasks

Filled in on 2026-11-15, when the writers and their checkers had finished, and before any try.

The four writers handed in twenty tasks. The checkers kept seventeen and dropped three: A2 (the behaviour is in a doc comment and near to guessable), F3 (the ask states the fault) and F4 (the ask gives the trap away, and the rest needs a hidden formula to three decimals). The checkers mended three asks that pointed at the trap (F1, F2, C1). The tasks are in `bench/sets/camera/tasks/`.

"Would this reader go wrong?" is the checker's guess, made before any try. It marked most "unsure". The screen answers it.

| Task | Kind | What it turns on | A doc comment says it | Checker's guess |
|---|---|---|---|---|
| A1 | code | A new object assigned to the arc-rotate camera's `target` is not noticed; only writes to the parts of its own target are. | no | unsure |
| A3 | code | `getViewMatrix` and `getViewProjectionMatrix` hand back the camera's own buffers, which are written over later. | no | unsure |
| A4 | question | The arc-rotate camera always uses world up, so a negative `beta` gives an upright view, the same as the other side. | no | unsure |
| A5 | question | `resolveCameraViewport` clamps the viewport into the canvas; `getEffectiveAspectRatio` uses the width and height before the clamp. | no | likely |
| C1 | code | A wheel notch zooms in proportion to the radius. | no | unsure |
| C2 | code | The pointer controls never read the Ctrl key. | no | unsure |
| C3 | question | Two held arrow keys are scaled down together, except in the Alt branch. | no | likely |
| C4 | code | `interpolateArcRotateCamera` turns `alpha` along the shortest arc and then snaps to the goal. | yes | unsure |
| C5 | question | A transition reads its goal on its first frame, and looks for interference only from the second. | no | likely |
| F1 | code | The free camera's turn glide is cut off below `speed * 0.001`, so a higher speed shortens the glide. | no | unsure |
| F2 | code | The free camera's yaw and pitch are worked out once, when it is made. | no | unsure |
| F5 | question | Mouse look turns only during a drag with a button held, and never reads `movementX`. | no | unsure |
| G1 | code | The geospatial camera clamps against the limits object it was made with; a new object assigned to `limits` changes nothing. | no | unsure |
| G2 | code | East, at the camera's starting centre, is world −Y. | no | unsure |
| G3 | code | `flyGeospatialCameraToAsync` never rejects; a flight that was cut short resolves like one that landed. | yes | unsure |
| G4 | code | A flight's yaw goal is cut to the shortest signed angle. | yes | unsure |
| G5 | question | A tightened `radiusMax` applies only on the next change of orientation. | no | likely |

With the nine old tasks that is 26 tasks: 18 code tasks and 8 questions. Fourteen of the seventeen new ones turn on something no doc comment states.

Each ask was read alone, before anything else of its task, by its checker, who wrote down what it asks and what is missing (`VERIFY.md` in each writer's directory on the machine; not kept here). The request form is the text-only run's, which two fresh readers read then. No further fresh reader is run.

### A rule for numbers, fixed now

Six of the new questions have numbers in their answers. The old questions had only `true`, `false` and one word. A number in an answer is right when it is within 0.015 of the expected number, or within one part in a thousand of it, whichever is wider. A number written as a string counts as that number. The asks say "to two decimals", and the expected answers are written to two decimals.

## What is run, in numbers

26 tasks. `names` and `types`: three tries a task each, 156 tries of a Haiku model. The ceilings: one try a task in each arm, 52 tries of an Opus model.

## Written down during the run, 2026-11-15

**The ceiling ran first.** 51 of its 52 tries were kept. One (`ceiling-types`, C1) ran past the 900 seconds a try is given and was not kept; it is launched once more with 1,800 seconds.

**The cost guess.** The first group was `names` on the nine old tasks: 27 tries, 103,637 output tokens, $0.13 by the records, 88 seconds on the clock with nine tries at once. The Haiku part of the run is 156 tries, so I expect about 600,000 output tokens and about $0.75 for it. The ceiling was the dear part: 51 tries of an Opus model at effort `xhigh` wrote 711,674 output tokens, $27.45 by the records. I had not guessed that beforehand, and should have: a ceiling try wrote about 14,000 tokens where a Haiku try wrote about 3,800.

## What came, 2026-11-15

Written by Claude Fable 5.2 after every try was kept and graded, and every failure sorted.

*(Added 2026-11-24 by Claude Opus 5.5: on 2026-11-18 an audit found that the checks of the set's 15 code tasks pass some wrong answers. It did not look at C1, C2 or G4. This run was not graded again by the mended checks, apart from its passes on G2 and F2. Its counts stand as the loose checks gave them. `bench/runs/2026-11-19-camera-regrade/README.md` says what the mends changed.)*

### The table

208 tries were kept. None was spoiled: no subject read a file outside its box. One ceiling try ran out of time once and was launched again.

| Task | `names` | `types` | ceiling, `names` | ceiling, `types` |
|---|---|---|---|---|
| The nine old tasks | 21 of 27 | 27 of 27 | 7 of 9 | 9 of 9 |
| A1 | 0 of 3 | 3 of 3 | 0 | 1 |
| A3 | 3 | 3 | 1 | 1 |
| A4 | 3 | 3 | 0 | 0 |
| A5 | 0 | 0 | 0 | 0 |
| C1 | 0 | 0 | 1 | 1 |
| C2 | 2 | 1 | 1 | 1 |
| C3 | 0 | 0 | 0 | 0 |
| C4 | 1 | 3 | 0 | 1 |
| C5 | 0 | 0 | 0 | 0 |
| F1 | 0 | 1 | 0 | 0 |
| F2 | 2 | 2 | 1 | 1 |
| F5 | 0 | 0 | 0 | 0 |
| G1 | 3 | 3 | 1 | 1 |
| G2 | 1 | 3 | 1 | 1 |
| G3 | 3 | 3 | 1 | 1 |
| G4 | 1 | 3 | 1 | 1 |
| G5 | 0 | 0 | 0 | 0 |
| The seventeen new tasks | 19 of 51 | 28 of 51 | 8 of 17 | 10 of 17 |
| All 26 | 40 of 78 | 55 of 78 | 15 of 26 | 19 of 26 |

### What the rules said

1. **Thirteen tasks have room**: A1, A5, C1, C3, C4, C5, F1, F5, G2, G4, G5, and the two old questions I1 and P1. On them `names` passed 3 tries of 39.
2. **The launch check passed.** On the nine old tasks `names` gave 21 of 27, with every code task three of three and both questions none of three, and `types` gave 27 of 27. The text-only run gave the same, task by task. The new way of launching did not change the picture on these tasks.
3. **The ladder has a step above `types` that fails.** On the thirteen tasks with room `types` passed 19 tries of 39: six tasks three of three, one task one of three, six tasks none. Of the fourteen new tasks whose behaviour no doc comment states, `types` passed 19 tries of 42.

### Whose the failures were

A reader agent for each task read every answer and sorted each failure. I read every failure sorted as the test's, and one in five of the others, drawn by a seeded command. I agreed with the reader on all but one task: on C1 it had sorted six failures as the subject's, and I re-sorted them as the test's, for the reason given below. Each `whose.txt` says so.

| Arm | Failures | The text's | The subject's | The test's | Not known |
|---|---|---|---|---|---|
| `names` | 38 | 29 | 5 | 4 | 0 |
| `types` | 23 | 17 | 1 | 5 | 0 |
| ceiling, `names` | 11 | 10 | 0 | 1 | 0 |
| ceiling, `types` | 7 | 7 | 0 | 0 | 0 |

### What the readers found that the table does not show

- **The checks run without a browser, and no ask says so.** Ten failures are the test's for this one reason. An answer that makes a `WheelEvent`, listens on `window`, uses `requestAnimationFrame` or reaches for `canvas.ownerDocument` would work in the app and fails in the check. C1 and C2 are hit hardest: every Haiku failure on them is of this kind. So C1 and C2 do not measure what a text teaches, and the next run gives its numbers with and without them. One of the ten is a ceiling try on F1. A ceiling try on C4 stopped the same way, and is sorted as the text's, because the bare text also lacks what that task turns on.
- **A4 is passed by a guess.** The Haiku subject assumed a fixed world up, said it was guessing, and was right six times of six. The ceiling remembered that Babylon.js flips the view at a negative `beta`, answered that way, and was wrong twice. Here knowing the older library better was a handicap.
- **The makers' comments mislead on two of the six tasks they do not fix.** On C5 the comments say the target "is copied, not retained" and that a direct write to the pose cancels the transition; the library reads its goal on the first frame and looks for interference from the second. On F5 a comment says "Mouse drag or pointer-lock"; under pointer lock nothing turns. The ceiling followed both comments and was wrong. A third wrong comment was found by the note writers (a latitude limit stated as about 89.96° where the constant gives 87.13°).
- **A subject that cannot know says so.** On the questions, most Haiku tries with bare signatures wrote `null` or wrote no file and said why. The ceiling did the same. That is graded as a failure, the same as a wrong guess, and the table cannot tell the two apart.
- **One reader agent returned its verdicts and wrote no file** (F1). I wrote its seven lines from what it returned, and each says so.

### Each guess beside what came

| Guess | What came | Held |
|---|---|---|
| Old tasks, `names`: 19 to 21 of 27, the same picture | 21, the same picture | yes |
| Old tasks, `types`: 26 or 27 | 27 | yes |
| New tasks, `names`: 30% to 55% of tries | 19 of 51, 37% | yes |
| New tasks with room: half, give or take a fifth | 11 of 17, 65% | yes |
| New tasks, `types`: 55% to 80%; of those with no comment, under half | 28 of 51, 55%; 19 of 42, 45% | yes, at the edge |
| Ceiling with `names` on the new tasks: 40% to 65% | 8 of 17, 47% | yes |

All six held, for the first time in this project. The fourth I had written loosely: "half, give or take a fifth" I read as 30% to 70%.

### The cost

By the records: the Haiku arms 156 tries, 799,766 output tokens, $1.17. I had guessed about 600,000 tokens and $0.75 after the first group; the `types` arm reads a text four times as long and wrote more. The ceiling: 52 tries, 768,622 output tokens, $29.27.

### What I did not read

The subjects' reasoning is not kept: the record holds reasoning blocks with no text in them. I read 19 of the 79 failures myself and none of the passes; the reader agents read every answer. I did not check the readers' statements that a thing is not in a text by searching the text myself, except where I quote it here.

### What this changes

- The camera set now has what three earlier runs lacked: tasks the lowest text fails, and tasks the best text so far fails. The next run (`bench/runs/2026-11-15-camera-notes`) was written down before these failures were read. Its three groups of tasks stand as written; because of what the readers found, its numbers will also be given without C1 and C2.
- A task whose check runs without a browser should say so in the ask, in a developer's words ("our unit tests run in node, with no DOM"), or its check should take a browser's answer. The scene set's checks have the same limit, and its run was written down before this was known.
- The makers' comments were the best text of the last run. They are not ground truth: three of them are wrong, and two of those sent the ceiling to a wrong answer.

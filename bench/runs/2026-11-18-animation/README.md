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

## Written, 2026-11-18

The six writers are done. Their briefs are `writers/WRITER.md` and `notes/WRITER.md`.

- **Tasks:** 24, in `bench/sets/animation`: 15 ask for code and nine ask a question. Each code task has one to three hollow answers. `box.py check-tasks` graded 105 answers and found all as they must be. Each writer's own log is under `writers/`.
- **Notes:** three lists, under `notes/`. `an-1` has 50 notes and 9,545 bytes, `an-2` 56 and 10,539, `an-3` 50 and 8,298, counting the texts only. Each note has a probe, and each writer reports that all its probes passed on its last run. `an-3` is the one-writer arm's list, by the lot above.
- **One thing out of bounds:** the writer of `an-3` reports that one of its commands briefly wrote a list of names outside its directory, and that it deleted it at once. Its transcript shows what that was: a list of the names declared in its own `names/` file, written to a temporary folder and deleted by its next command. The other workspaces could have been read: they were on the same disk. So I searched all six writers' transcripts, 381 tool calls, for any path into another writer's workspace, or any other path outside its own but that one. There is none.
- **Not yet done:** the merge of the three lists, a fresh reader for each ask, a second adversary for each check, the ceiling, and the marks of which tasks a note states.

## Merged, marked and attacked, 2026-11-18, before any try

Written by Claude Opus 5.5. Every agent's report is in `before-any-try/reports.json`.

**The merge.** An Opus agent who saw no task merged the three lists by a rule fixed beforehand: notes that state one thing go in one group, a group's text is one member's word for word, more votes first. 156 notes became 67 groups: 37 that all three writers gave, 15 two, 15 one. Two disagreements were settled by running the library. The list renders to 13,124 bytes, under the bound of 15,260, so nothing was dropped; its probes pass, 144 tests. A Sonnet agent checked the merge and found every note placed once, every text a member's, and the order right. It found four notes grouped loosely: a note that makes two claims sits with one of them. That changes votes and order a little, and no text.

The two texts, as the subject is handed them:

| Arm | File | Notes | Bytes | sha256 |
|---|---|---|---|---|
| `one-low` | `notes/one.md`, from `an-3` | 50 | 8,605 | `33a12a619a6cbdbc88551157be93d8b87d3acb144a2921636f649dbc0e5febee` |
| `merged-low` | `notes/merged/merged.md` | 67 | 13,124 | `1a96fc2b97a34f5d57a3c5dc5ca40b8ae15cf7874a683fd0cb5cabcd41d5e9f7` |

**The marks.** An Opus agent read each task's ask, `where.md` and check beside both lists, before any try, and marked whether a note states what the task turns on. Its marks are in `before-any-try/marks.json`.

| | States | Partly | Misstates | Silent |
|---|---|---|---|---|
| `one-low`'s list | 17 | 5 | 0 | 2 |
| `merged-low`'s list | 18 | 4 | 0 | 2 |

The two lists differ on one task, AG1. Both are silent on AG5 and AP5. On AM6 and AM7 both state the rule for property blending and not for the skeletal mixer.

**What the marks change.** The note writers saw no task and were not told what to look for, and still found what 17 or 18 of the 24 tasks turn on. So the tasks are held out by how they were made, and the notes cover them all the same: two kinds of Claude agents, reading the same code, found the same things. Two plans of this note lose most of their force:
- **The control is too small.** The rule was to be asked apart on the tasks a note states and on the rest. The rest are two silent tasks and four or five partly stated ones. The counts will be given for each group, and no rule is asked on a group of fewer than eight tasks.
- **`merged-low` against `one-low` tests length, not coverage.** The lists cover the same tasks, so that comparison asks whether 13 KB of notes with votes behind them do better than 8.6 KB from one writer. It still answers what a list costs to make.

**The adversaries.** Three Opus agents tried to pass each code check with a wrong answer the writer had not tried. Every one of the 15 checks passed one. 10 of the wrong answers are ones a model could plausibly write; one is the reference answer less one line. The writers' own hollow answers were not enough.

**The fresh readers.** Two Sonnet agents read each ask with only the declarations. Most of what they quote as "giving away" is what the developer wants, which an ask must say. They also list words two readers could take two ways. These are weighed in the mending below.

**What is done next, before any try.** Each check is mended by its adversary's finding, and each adversary's wrong answer is kept as a hollow answer the check must fail. An ask changes only where a fresh reader's two readings would both be fair and the check fails one of them. Then `check-tasks` again, then the ceiling. A second round of adversaries is not planned: each round of the camera audit found more, and what matters is whether a real answer that passed is wrong, which a probe of every passed answer after the tries shows.

## The checks mended, 2026-11-18, before any try

Three Opus agents mended the 15 code checks so that each fails the wrong answers the adversaries found. Those answers are kept as hollow answers; no right answer changed. Some asks gained a clause, where a mended check tests a case the ask had not asked for, or where a fresh reader showed two fair readings. `bench/sets/animation/CHANGES-1.md` to `CHANGES-3.md` give each change. `check-tasks` then graded 143 answers, all as they must be. The marks of which tasks a note states were made on the asks before these changes; the changes add cases and do not change what a task turns on.

## The ceiling, 2026-11-18

`bench/runs/2026-11-18-animation-ceiling`: a Sonnet model, with the declarations and the library's own source for `src/animation`, passed 23 of the 24 tasks once each. The one it failed, AM1, it failed by its own design and not by the ask. No ask is changed.

## What is sent

The commands are in `HANDOFF.md`. The arms are sent in this order: `names-low`, then `one-low`, then `merged-low`. Nothing is read between them.

## What came

Written by Claude Fable 5.2 on 2026-11-19. The session on the maintainer's machine sent and graded the tries at commit `929ab2b`, as `LAUNCH.md` says: the same server process, build, template and settings as `bench/runs/2026-11-18-mended-notes`.

### The tries

216 sent, 216 kept and graded. None was cut off, none was not run, and the server stopped no loop.

| Arm | Passed, of 72 | Tasks all passed | Tasks none passed | Tokens in, a try | Tokens out, a try |
|---|---|---|---|---|---|
| `names-low` | 14 | 3 | 17 | 4,782 | 2,923 |
| `one-low` | 44 | 13 | 7 | 6,862 | 3,321 |
| `merged-low` | 53 | 15 | 4 | 8,017 | 3,555 |

Each task's passes of 3, with the mark each list was given before any try:

```
       names  one  merged   one's list   merged list
AG1     0      0     1      partly       states
AG2     0      1     1      states       states
AG3     0      3     3      states       states
AG4     3      3     3      states       states
AG5     0      0     0      silent       silent
AG6     0      3     3      states       states
AG7     1      3     3      states       states
AG8     0      3     3      states       states
AM1     0      3     2      states       states
AM2     0      0     2      partly       partly
AM3     0      2     3      states       states
AM4     0      3     3      states       states
AM5     0      3     3      states       states
AM6     0      0     0      partly       partly
AM7     0      0     0      partly       partly
AM8     0      0     0      states       states
AP1     1      3     3      states       states
AP2     2      3     3      states       states
AP3     3      3     3      states       states
AP4     0      1     2      states       states
AP5     3      3     3      silent       silent
AP6     1      3     3      partly       partly
AP7     0      0     3      states       states
AP8     0      1     3      states       states
```

### What the rule says

`box.py compare`, a quarter as the size that matters:

| The pair | The answer |
|---|---|
| `one-low` against `names-low` | +0.42 (+0.25 to +0.58); 14 tasks up, none down: shown: the first passes more |
| `merged-low` against `names-low` | +0.54 (+0.38 to +0.69); 17 tasks up, none down: shown: the first passes more |
| `merged-low` against `one-low` | +0.12 (+0.03 to +0.25); 6 tasks up, 1 down: cannot tell |

By the marks made beforehand: on the 18 tasks the merged list was marked as stating, the arms passed 10, 38 and 45 of 54 tries. On the other 6 they passed 4, 6 and 8 of 18. Six tasks are too few to ask the rule, as this note said before the tries.

### The failures

105, every one sorted. `box.py tally --strict` passes.

| Arm | Failures | The text's | The subject's | The test's | Not known | Too long |
|---|---|---|---|---|---|---|
| `names-low` | 58 | 58 | 0 | 0 | 0 | 0 |
| `one-low` | 28 | 18 | 10 | 0 | 0 | 0 |
| `merged-low` | 19 | 11 | 8 | 0 | 0 | 0 |

**Without notes, every failure is the text's.** The declarations do not say what each task turns on, and the answers go by the names or by what the older library does.

**With notes, the text's failures are on six tasks,** and they are what a next mend would take up:
- **AG5, 6 tries.** No note says a mask given as a plain object is ignored until `createAnimationGroupMask` has run once. Both lists were marked silent.
- **AM6, 6 tries, and AM7, 4 tries.** The notes give the rule of the sum for property blending. No note gives it for the skeletal mixer, and the tries carry over the wrong rule or the older library's.
- **AM8, 6 tries.** Each try gets right what the note states, that a group taken off and put back keeps its place. Each fails the one case no note states: that the place survives `clearAnimationManager`. The mark "states" was too generous.
- **AG1, 3 tries of `one-low`.** Its list speaks of a seek past the end, and not of a time set exactly at the end.
- **AM2, 3 tries, and AM3, 1.** No note says a fade of no length throws, or how the manager calls a category's handler.

**The subject's, 18 tries.** The note states the case and the answer goes round it: AG2 (4), AG1 in `merged-low` (2), AP4 (3), AP7 in `one-low` (3), AP8 in `one-low` (2), AM7 in `merged-low` (2), AM1 and AM2 (1 each).

**None is the test's.** No answer was lost before its check: every reply gave its file in the form asked, and every file loaded. The camera runs in message form 1 lost answers to calls to a tool and to frame loops the check could not drive.

**AP7 says something about chance.** The note that states it is word for word the same in both lists, and no other note of either list bears on it. `one-low` read it one way in all three tries and failed; `merged-low` read it the other way in all three and passed. So three of the nine passes between those arms are on text that does not differ.

### The passes, probed

An Opus agent judged all 85 passes of the 15 code tasks. 51 take the reference answer's route or plain calls to the library, judged by reading. 34 take another route and were run against probes that read what the library reports, with inputs unlike the check's. By its report **none is hollow.** Two differ at an edge the ask does not fix: one shows its pose from the next frame, and three lag a frame on a play range that does not start at 0.

### Who read what

Four Sonnet agents sorted the failures, each one group of tasks across all three arms. A fifth sorted 30 of them blind and agreed on 29; on the last, `merged-low/AM8/3`, it was unsure. It also checked each of those 30 lines against its try. Six had a quote that is not word for word, or said of the reasoning something it does not show, and none of the six changes a sort. I mended those six and a seventh that copied one. The other 75 lines were not checked this way, so about a fifth of them may quote loosely.

### Each guess beside what came

| The guess | What came |
|---|---|
| `names-low` passes 25 to 40 of 72 | 14 |
| Both notes arms beat it, shown, by 0.2 to 0.35: less than on the camera tasks | Shown, by +0.42 and +0.54: no less than the camera's +0.43 |
| `merged-low` against `one-low`: no difference as large as a quarter | "cannot tell", at +0.12 |
| About half the tasks are stated by the merged list, and fewer by the one-writer list | 18 and 17 of 24, by marks that were too generous on one task at least |

I was wrong on the first two, in opposite ways.

### What this shows, and what it does not

- **The notes' gain holds on tasks that no writer of the notes saw.** This is the held-out score of `AGENTS.md`, and the first this project has. Both lists are shown to pass more than the bare declarations, by +0.42 and +0.54 of a task's tries, and no task passed less with notes. The camera gain, +0.43, came from notes and tasks written under briefs that named the same things. This one did not, and it is no smaller.
- **One writer's list carries most of it.** 44 of 72 against the merge's 53. The rule cannot tell them apart, and three of the nine passes between them are on a note that is the same in both. The merge costs three writers and a merger, and this run does not show what that buys.
- **The gain is where a note states the thing.** Passes on the tasks marked "states" went from 10 of 54 to 38 and 45. Where the notes are silent or speak of a near case, the tries mostly fail as the bare arm does. Nothing here shows a note helping with what it does not say.
- **These tasks were written to be failed without notes.** The task writers' brief asks for tasks that a reader of the declarations alone would get wrong, and the bare arm passed 14 of 72. So the gain is the gain on what the declarations hide. It is not the gain on whatever a developer might ask.
- **One round.** Each arm was sent once. A second round of one arm would say how much three tries a task move by chance; AP7 shows that it is not little.
- **One model at one setting,** in one message with no tools, on one part of one library, each try handed the right notes.
- **From here this is a development set for these two lists,** if a note is mended from any failure above.

### What I did not read

I read the counts, the agents' reports, the seven lines I mended, both lists' notes about quaternions, and the answers and the last lines of reasoning of the six AP7 tries of the two notes arms. I read no other answer or reasoning. The sentences under "The failures" are the sorting agents', apart from AP7's.

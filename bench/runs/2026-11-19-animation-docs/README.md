# The makers' own document against the notes, and one arm a second time

Written by Claude Fable 5.2 on 2026-11-19, before any try of this run and before anyone marked the document against the tasks. The maintainer said go for both arms on 2026-11-19. No try is sent until the two steps under "Before any try" are done and written here.

## What it is for

`bench/runs/2026-11-18-animation` set two note lists against the bare declarations. It left two things open.

1. **Nothing was set against what the makers wrote.** A reader of a library usually has the library's own documents. If those do as well as the notes, the notes add nothing a project does not already have. Babylon Lite 1.39.0 has a document on its animation code, `docs/lite/architecture/07-animation.md`: 44,002 bytes, 771 lines, sha256 `5da3ae10e66ac06958a65eca082d14e68230fd3dee9af81ea9844b09fec6067d`. No writer of a task or of a note had it: their copy of the library was without its `docs` directory (`writers/WRITER.md` and `notes/WRITER.md` of that run).
2. **No arm was sent twice.** So that run has no measure of how far one arm moves from round to round, and AP7's split (0 of 3 against 3 of 3 on one sentence) cannot be told from chance.

Nothing in any text has been mended since those tries, so the tasks are still held out for the notes. They are held out for the document by how it was made: its writers never saw them.

## The arms

Both on the 27B as that run had it: reasoning effort `low`, message form 2, the same settings, 24 tasks by 3 tries.

| Arm | Text | Tries |
| --- | --- | --- |
| `docs-low` | the bare declarations and the makers' document, whole | 72 |
| `merged-low-b` | the bare declarations and the merged notes: `merged-low` again, byte for byte | 72 |

The messages are about 64,000 and 33,100 bytes. The document is more than three times the merged notes (13,124 bytes).

## How it is read

The task is the unit, a cut-off try is a failure, and the rule is `box.py`'s, with a quarter as the size that matters. Three questions, in this order:

1. **The two rounds:** `merged-low-b` against `merged-low` of the 18th. `across.py` in this folder asks the rule across the two runs; it gives `box.py compare`'s answer on a pair of that run (+0.42, +0.25 to +0.58, for `one-low` against `names-low`). If the rule tells the two rounds apart, question 3 does not count. Also given: on how many tasks the count of passes differs, and AP7's count.
2. **Notes against the document, same day:** `merged-low-b` against `docs-low`, by `box.py compare`.
3. **The document against nothing, across days:** `docs-low` against `names-low` of the 18th, by `across.py`.

Every failure is sorted, and the passing code answers of `docs-low` are run on the probes the 18th's run kept, as that run did.

## What each outcome changes

| `merged-low-b` against `docs-low` | What it means |
| --- | --- |
| shown: the notes pass more | For this reader, in one message, the notes carry more than the makers' document at under a third of its size. |
| no difference as large as a quarter, or cannot tell | The notes are not shown to beat what the project already had. What is left to them is size, and whatever a run with tools shows. |
| shown: the document passes more | For a library with a document like this one, the notes pipeline is not worth its cost in this form. |

## My guesses

Made after the 18th's results, and after reading work outside this repository that bears on the question. I have not read the document beyond its first 30 lines.

- `docs-low` passes 30 to 42 of 72: above the bare arm's 14 and below the one-writer list's 44. An architecture document says how the code is built; I guess it states what about half the tasks turn on.
- `merged-low-b` passes 48 to 58, and the rule does not tell it from `merged-low` (53).
- AP7 in `merged-low-b`: I cannot guess. The sentence has two readings.
- The notes are shown above the document: more likely than not, not by much.

## Before any try

1. **Marks.** Agents who have seen no try mark, for each task, whether the document states what it turns on: states, partly or silent. The 18th's marks were looser than the tasks (AM8 and AP7 were marked "states" and the case the check tests is not named). So this time a mark of "states" needs every case the check tests named in the document, each with its sentence quoted, and two agents mark each task apart. Where they differ the lower mark stands.
2. **A ceiling.** A Sonnet model is sent each task once with each arm's text, through `small.py --via-claude`, in `bench/runs/2026-11-19-animation-docs-ceiling`. For the document this says what a stronger reader gets from it. For the merged notes it is the step the 18th's run did not do: its 8 failures sorted "the subject's" were not shown passable with what the arm had.
3. **A fresh reader** is given one `docs-low` message and nothing else, and says what it is asked and what it lacks.

## What it does not cover

- One model, one message, no tools. A reader with tools can look in the source, and may need neither text.
- One document of one library, written by its makers for people who work on the library.
- `docs-low` and `names-low` are a day apart. Question 1 is the only measure of what a day does.
- The session that had the tasks and the notes made also reads these tries.

## Done before any try, 2026-11-19

No try of the 27B had been sent when this was written.

### The marks

Six Opus agents, two apart for each group of eight tasks, listed the cases each task's check tests and marked every case for both texts: stated, two readings, or not stated, with the words quoted. They read no try, sort, grade or earlier mark. `before-any-try/marks.json` holds every case and quote.

By the case, over both markers' lists (199 case marks):

| Text | Stated | Two readings | Not stated |
| --- | --- | --- | --- |
| The makers' document | 50 | 99 | 50 |
| The merged notes | 127 | 53 | 19 |

By the task, the lower of the two marks standing: the document states 0 tasks whole, part of 21, and is silent on 3 (AG4, AG7, AG8). The notes state 3 whole (AG8, AP1, AP2), part of 20, and are silent on 1 (AM6). The two markers gave the same task mark on 21 of 24 tasks for each text.

- **The strict mark does not sort tasks.** Nearly every task is "partly" for both texts, so no rule can be asked on groups of tasks. The share of cases stated is what the marks give: about a quarter for the document, about two thirds for the notes.
- **The 18th's marks called 18 tasks "states" for these same notes.** Under this rule 3 are. The 18th's note already says its marks were too generous on one task at least; this is by how much.
- **Both markers say the document misleads on 8 tasks** (AG1, AG4, AG6, AM6, AM7, AP2, AP4, AP8): a sentence that the reference answer or the expected values contradict. One says so of AP5 too. Each sentence is quoted in the file. I have not checked them against the code.

### The ceilings

`bench/runs/2026-11-19-animation-docs-ceiling`: a Sonnet model, no tools, one try a task. **13 of 24 with the document, 20 of 24 with the merged notes.**

- With the document it failed AG1, AG4, AG6, AG8, AM1, AM4, AM6, AM7, AP2, AP7 and AP8. Seven of those eleven are tasks where both markers say the document misleads.
- With the notes it failed AG5, AM1, AM6 and AM7. On AM6 its reply held no file. The 27B passed none of AG5, AM6 and AM7 with these notes on the 18th. AM1 it also failed with the source in hand (the 18th's ceiling).
- It passed AM8 with the notes, which the 27B failed six times of six, and its report says the notes do not state the case and that it guessed.
- The 18th's run sorted 2 `merged-low` failures on AM7 "the subject's". The ceiling did not pass AM7 with those notes, so those two sorts are not supported.

I read the tally, the grades' first lines for AM6 and the AM8 report.

**Added later on 2026-11-19: the ceilings read.** The 15 failures are sorted; `bench/runs/2026-11-19-animation-docs-ceiling/README.md` says what came. Two things in it bear on this run:

- **The document is wrong about this release in many places.** An agent checked the sentences the markers quoted against the source: the code contradicts 13 of 17 quotes. Four of the ceiling's failures follow such a sentence.
  - **Corrected later on 2026-11-19:** "wrong in many places" is too strong. `bench/runs/2026-11-19-doc-lint` probed every checkable claim of the document under its most favourable reading: 263 of 280 hold, and most of these same sentences hold there. The sentences are true in the case they speak of and false in another they do not exclude.
- **The declarations offer names the package does not export.** Of the 68 functions and constants the bare declarations declare, 20 are not in the library's index, `getAnimationGroupOwner` and `tickAnimation` among them. Four of the ceiling's failures with the document died on the first of those. The merged notes carry a note that says which names are not exported (note 5), so the notes mend a fault of our own text that the document cannot know of. A real reader would have the package's own types, which hold only what it exports.

**How this is handled, fixed here before any try of this run was read.** I do not know whether a try had been sent when this was written; the hand-off was given at commit `3c8763f`. The texts stay as they are, since `merged-low-b` must be `merged-low` byte for byte. When the tries are read:

1. Every failure whose check dies on a name the package does not export is counted apart, by arm, for this run and for the three arms of the 18th.
2. `docs-low` is given twice: as graded, and with those tries left out of both arms of a pair.
3. No rule is asked on the second form. It is there so that a reader can see how much of a difference is this fault.

### The fresh reader

`before-any-try/fresh-reader.md`. It found nothing missing and no contradiction in the request. It says the message does not tell the reader which text wins where the document and the declarations differ, and that the document's table of Babylon.js equivalents could pull a reader toward Babylon.js. Both are left as they are: the arm is the document as its makers wrote it, handed over as a user would hand it over.

### A second guess, after the marks and the ceilings

The first guess above stands as the one to score. Having seen that the document states a quarter of the cases and that a Sonnet model passes 13 of 24 with it, I would now guess `docs-low` at 18 to 30 of 72.

## What is sent

`HANDOFF.md` is for the session on the maintainer's machine. It sends `docs-low`, then `merged-low-b`, and pushes the tries to the branch `runs/2026-11-19-animation-docs`.

## What came

Written by Claude Fable 5.2 on 2026-11-20, from tries sent on 2026-11-19. The session on the maintainer's machine sent and graded the 144 tries at commit `3c8763f`, as `LAUNCH.md` says. It reports that nothing differed from the 18th's run: the same server process, the same model files, template and settings. No try was cut off and the server stopped no loop.

### The scores

| Arm | Text | Passed of 72 | Failures: the text's | the subject's |
| --- | --- | --- | --- | --- |
| `names-low` (18th) | declarations only | 14 | 58 | 0 |
| `docs-low` | declarations and the makers' document | 29 | 41 | 2 |
| `one-low` (18th) | declarations and one writer's notes | 44 | 21 | 7 |
| `merged-low` (18th) | declarations and the merged notes | 53 | 13 | 6 |
| `merged-low-b` | the same message again | 51 | 18 | 3 |

By task, passes of 3:

| Task | `names-low` | `docs-low` | `merged-low` | `merged-low-b` |
| --- | --- | --- | --- | --- |
| AG1 | 0 | 0 | 1 | 1 |
| AG2 | 0 | 1 | 1 | 0 |
| AG3 | 0 | 3 | 3 | 3 |
| AG4 | 3 | 3 | 3 | 3 |
| AG5 | 0 | 3 | 0 | 0 |
| AG6 | 0 | 0 | 3 | 3 |
| AG7 | 1 | 3 | 3 | 3 |
| AG8 | 0 | 0 | 3 | 3 |
| AM1 | 0 | 0 | 2 | 3 |
| AM2 | 0 | 0 | 2 | 1 |
| AM3 | 0 | 0 | 3 | 3 |
| AM4 | 0 | 0 | 3 | 3 |
| AM5 | 0 | 2 | 3 | 3 |
| AM6 | 0 | 0 | 0 | 0 |
| AM7 | 0 | 0 | 0 | 0 |
| AM8 | 0 | 0 | 0 | 0 |
| AP1 | 1 | 3 | 3 | 3 |
| AP2 | 2 | 2 | 3 | 3 |
| AP3 | 3 | 3 | 3 | 3 |
| AP4 | 0 | 0 | 2 | 3 |
| AP5 | 3 | 3 | 3 | 3 |
| AP6 | 1 | 3 | 3 | 3 |
| AP7 | 0 | 0 | 3 | 1 |
| AP8 | 0 | 0 | 3 | 3 |

### The three questions

1. **The two rounds.** `merged-low-b` against `merged-low`: -0.03 (-0.11 to +0.04), no difference as large as a quarter. The rule does not tell the two rounds apart, so question 3 counts. The count of passes differs on 5 of the 24 tasks: AG2 1 then 0, AM1 2 then 3, AM2 2 then 1, AP4 2 then 3, AP7 3 then 1.
2. **Notes against the document, same day.** `merged-low-b` against `docs-low`: +0.31 (+0.10 to +0.51), shown: the notes pass more. The notes pass more on 12 tasks and less on 2 (AG5 and AG2).
3. **The document against nothing, across days.** `docs-low` against `names-low`: +0.21 (+0.08 to +0.35), cannot tell. The document passes more on 7 tasks and less on none, and the mean is under the quarter fixed beforehand.

Not fixed beforehand, and given for the reader: `docs-low` against `one-low` is -0.21 (-0.39 to -0.03), cannot tell; `merged-low-b` against `one-low` is +0.10 (+0.01 to +0.19), no difference as large as a quarter.

For this reader, in one message, the merged notes carry more than the makers' document, at 13,124 bytes against 44,002. A try with the document was sent about 14,100 tokens and a try with the notes about 8,000; a try with the declarations alone about 4,800.

### AP7 was partly chance

Every failure on AP7, in every arm of both runs, is one field: `falseOptionMakesRotationQuaternionPlain`, answered `true` where `false` is expected. I read the 12 answers of four arms. With the merged notes the 27B answered it right 3 times of 3 on the 18th and 1 time of 3 today, from the same message. So the 18th's split on this task, 0 of 3 for one list against 3 of 3 for the other, was sharper than the notes earn. The sorter read all six replies with the merged notes: the answers turn on note 18 alone, two of today's took its "slerps only if" as a default that an explicit `false` overrides, and it found nothing in the reasoning that says why one try reads it one way and the next the other.

### Where the document fails

Four Sonnet agents sorted the 64 failures, one group of tasks each across both arms. A fifth sorted 32 of them blind and gave the same sort on all 32. It also found 13 lines that misquoted or misdescribed their try. A sixth agent corrected those, checked every quote in all 64 lines by script against the try, and corrected 10 more; no sort changed. So 23 of 64 lines had to be mended: what a line says a reply wrote should be checked against the reply before it is leaned on.

The sixth agent also gave each failure a kind, in `kinds.json`. One reader did this and no second checked it, and it says the line between "silent" and "two readings" is its own judgement.

| Kind | `docs-low` | `merged-low-b` |
| --- | --- | --- |
| The text says nothing of what the try failed on | 27 | 10 |
| The text's words read two ways | 6 | 8 |
| A sentence true for one case, applied to the tested case | 7 | 0 |
| A name the declarations list and the package does not export | 1 | 0 |
| The subject's | 2 | 3 |

- **Mostly the document is silent.** It is an account of how the code is built, and most tasks turn on what a call does in one case. Before any try the markers found it states a quarter of the cases the checks test.
- **Seven failures follow a sentence of the document into a case where it is false.** AG6, three tries: its `goToFrame` line, "evaluates the pose immediately for manual property clips (or engine-backed clips when an engine is provided)", has no exception for a glTF clip that was played. AP8, three tries: "Non-looping property groups apply the exact final pose once, then stop" is false for a group that plays backward. The lint of the document found the same shape: sentences true in the case they speak of and false in one they do not exclude.
- **The document carries one thing the notes lack.** On AG5 it passes 3 of 3 and the notes 0 of 3, in both rounds. It says "the first call to `createAnimationGroupMask` is what activates the" masking path. No note says so, and the answers with the notes assign a plain object as the mask, which the library ignores. The probe agent found the three answers with the document are the reference answer line for line.
- **The fault in the declarations hardly touched this reader.** One try, `docs-low/AG2/3`, died on `getAnimationGroupOwner`. No try of the 18th used a name the package does not export. So `docs-low` is 29 of 72 as graded and 29 of 71 with that try left out, and no comparison moves. The Sonnet ceiling lost four tries of eleven to this fault; the 27B reached for those names once in the 360 tries of the two runs.
- **AM6, AM7 and AM8 fail in every arm of both runs:** 0 of 36 tries. With the notes they fail on fewer fields than with the document. Neither text states how clips mix on a skeleton, or what clearing a manager does to the order.

### The passes, probed

An Opus agent judged all 64 passes of the 16 code tasks: 26 in `docs-low` and 38 in `merged-low-b`. It ran 29 against probes that read what the library reports and judged 35 by reading. Three fail a probe, each on an input no check uses:

- `docs-low/AP5/3` keeps its own clock and wraps it by taking one period away. After a frame longer than a period the lamp is dark where a flash is due.
- `merged-low-b/AM3/1` and `AM3/2` copy the manager's update loop through internal fields, with no copy of the task list. A task that removes itself during the skip makes one skip the next clip and the other throw.

Both asks cover those inputs in their words ("a fixed rhythm", "everything on the manager"), and neither names them. With the three counted as failures the arms are 28 and 49 of 72. This probe is stricter than the 18th's, which tried neither input, so the 18th's "none is hollow" is not set beside it.

### The ceiling beside the 27B

| Text | A Sonnet model, one try a task | The 27B, three tries a task |
| --- | --- | --- |
| The makers' document | 13 of 24 | 29 of 72 |
| The merged notes | 20 of 24 | 51 of 72 |

The order is the same for both readers. The stronger reader gets more from each text, and the notes' lead over the document is about the same for both: seven tasks of 24 for one, and 22 tries of 72 for the other.

### My guesses, scored

| Guess | What came |
| --- | --- |
| `docs-low` passes 30 to 42 | 29. Missed, by one. |
| The second guess, after the marks and ceilings: 18 to 30 | 29. Held. |
| `merged-low-b` passes 48 to 58, and the rule does not tell it from `merged-low` | 51, and it does not. Held. |
| AP7 in `merged-low-b`: cannot guess | 1 of 3. |
| The notes are shown above the document, "more likely than not, not by much" | Shown, by +0.31. More than I guessed. |

### What this does and does not show

- **It shows one thing by the rule fixed beforehand:** for this model, with no tools, in one message, on these 24 tasks, the merged notes pass more than the makers' document.
- **It does not show the document is a poor document.** It was written for people who work on the library, and the tasks ask what an app's writer needs. A guide written for users might do as well as the notes. This library has none for this code that I know of.
- **It does not show the notes are enough.** They fail AG5 where the document passes, and in neither round do they pass a try of AG5, AM6, AM7 or AM8. The notes and the document together were not tried.
- **It does not show what a reader with tools would do.** That reader can look in the source and may need neither.
- **The notes were held out when both rounds were sent.** No note has been mended from these tasks. The next mend ends that.

### What I read and did not read

I read `LAUNCH.md`, the tally, the rule's answers, the AP7 answers of four arms, five of the 64 sort lines, the three sentences of the document quoted above in the document itself, and every agent's report. I did not read the replies or their reasoning. What is said above about what a reply or its reasoning did is the sorters' and the probe agent's, as corrected.

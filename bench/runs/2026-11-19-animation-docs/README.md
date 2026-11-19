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

**How this is handled, fixed here before any try of this run was read.** I do not know whether a try had been sent when this was written; the hand-off was given at commit `32ea579`. The texts stay as they are, since `merged-low-b` must be `merged-low` byte for byte. When the tries are read:

1. Every failure whose check dies on a name the package does not export is counted apart, by arm, for this run and for the three arms of the 18th.
2. `docs-low` is given twice: as graded, and with those tries left out of both arms of a pair.
3. No rule is asked on the second form. It is there so that a reader can see how much of a difference is this fault.

### The fresh reader

`before-any-try/fresh-reader.md`. It found nothing missing and no contradiction in the request. It says the message does not tell the reader which text wins where the document and the declarations differ, and that the document's table of Babylon.js equivalents could pull a reader toward Babylon.js. Both are left as they are: the arm is the document as its makers wrote it, handed over as a user would hand it over.

### A second guess, after the marks and the ceilings

The first guess above stands as the one to score. Having seen that the document states a quarter of the cases and that a Sonnet model passes 13 of 24 with it, I would now guess `docs-low` at 18 to 30 of 72.

## What is sent

`HANDOFF.md` is for the session on the maintainer's machine. It sends `docs-low`, then `merged-low-b`, and pushes the tries to the branch `runs/2026-11-19-animation-docs`.

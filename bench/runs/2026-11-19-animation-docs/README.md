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

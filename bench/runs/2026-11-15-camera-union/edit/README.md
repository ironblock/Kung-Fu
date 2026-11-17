# The merged list, edited and checked three times

Written by Claude Fable 5.2 on 2026-11-17. No subject has been handed this list. Nothing here is a result about a subject.

## Why it was made

The merged list of this run, `../merge/facts.json`, was handed to two small models in `bench/runs/2026-11-16-small-screen`. They took each note at its word. A note that said more than was true cost them a task, and so did two notes that could be read as disagreeing. So the list was edited to take those faults out, and then checked by agents who had not edited it.

## How

Every agent was an Opus model. None was shown a task, a subject's answer or a result. Each worked from the library's code, the type declarations a subject is given, and the six writers' lists.

1. An editor went through the 78 notes. It merged notes about the same thing, narrowed notes that said too much, and wrote one test for each note. The tests are in `probes/`, numbered by the note's place in `facts.json`.
2. A checker who had not seen the editing tried to break each note with a test of its own, read the list as a subject would, and compared it with the 78. Its findings are in `CHECK.json` and its tests in `check/`.
3. A fixer tested each finding for itself and mended the note where the finding was right.
4. Steps 2 and 3 were done twice more with fresh agents. Each round had two checkers: one wrote tests to break notes (`check2/`, `check3/`), and one read the list with only the declarations beside it. Their findings are in `CHECK2.json` and `CHECK3.json`.

`EDIT.md` is the editor's and the fixers' own account, note by note. `edited.md` is the list as a subject would be handed it, rendered by `bench/notes.py` with the merged list's title. Its sha256 is `84e1a31f97f7c0d3d600ba9c91a619902a94a4147ff6259edd995b6bc5ab5180`.

## What came

Bytes are the notes' texts added up, without their numbers.

| The list | Notes | Bytes | What fresh checkers then found | Of those, a test showed the note false at an edge |
|---|---|---|---|---|
| Merged, as the small models had it | 78 | 14,816 | not checked this way | |
| Edited | 58 | 14,052 | 34: 10 too wide, 7 pairs, 11 words of unsaid reach, 6 lost | 10 |
| After the first mend | 58 | 14,459 | 42: 9 too wide, 12 pairs, 16 words of unsaid reach, 5 lost | 9 |
| After the second mend | 71 | 18,276 | 35: 12 too wide, 9 pairs, 14 words of unsaid reach, 0 lost | 12 |
| After the third mend, `facts.json` here | 77 | 20,095 | not checked | |

The first check's 34 are every entry of `CHECK.json`. Its checker was asked for at most 25 findings and gave 17, each of which names one or more of the 34. The fixer mended all 17.

Each fixer says that every finding it was given was right by its own test, and that it mended every one. The second fixer says about 36 of its 42 mends change what a reader would do, and the third says 30 of its 35. I ran the 77 tests in `probes/` against the library after the last mend: all passed, 218 cases. They import the library as `@babylonjs/lite`, and nine of them also reach into its source by a relative path, so they run only beside a copy of the library laid out as the editor's was. `probes/helpers.ts` is the helper they share.

## What this shows, and what it does not

- **The checkers did not run dry.** Three rounds of fresh checkers found 34, 42 and 35 faults. The count of notes that a test showed false at an edge was 10, 9 and 12. Nothing here says a fourth round would find fewer.
- **Each mend made the list longer.** A note that states its exception is longer, and the fixers split 18 notes that could not hold theirs in 320 bytes. The list is now 36% larger than the one the small models were handed.
- **A passing test did not bound a note's words.** Every note had a passing test before each check. The checkers still found, each round, about a dozen notes that are false in a case their words cover.
- **It does not show that any of these faults would cost a subject a task.** A checker looks for any case where a note fails. A task meets few cases. Only tries can say whether the mended list does better, the same or worse than the merged one, and none has been run.
- **It does not show which list is better.** The edited list is more exact and longer. Whether a small model does better with it is the question for the next run.

## What I did not read, and what was not kept

I read the first check's findings and the first lines of about 40 of the later ones. I did not read the other findings, the tests or the 77 notes one by one. The counts in the table are recounted from the files here. The fixers' statements are theirs.

The agents changed `facts.json` in place, so the lists as they stood after the edit and after the first two mends were not kept. `EDIT.md` tells what changed in each step.

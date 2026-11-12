# 2026-11-12-third-a-control: the third study, round one, the control tasks

This was written before the run. The study is `../../studies/third.md`. The other half of the round is `../2026-11-12-third-a`: the two sets of tasks are kept apart, so a round is two runs.

- **What, for now.** The arm with none only: the four control tasks, T07 to T10 of the set `first`, in variants 0, 1, 2 and 3. Each try is one Haiku subject of the kind `bench-subject-closed`, with `task.md` and nothing else. It has no code and can run nothing.
- **Why this arm goes first.** The study fixes its size after one round of the arm with none, and before any other try. So these tries are scored as soon as they are kept. That is written in the study, and it is the one thing read before every try is kept.
- **These tries are the arm with none of round one.** They are not run again, and they are not left out, whatever they show.
- **What they are read for.** A control task that does not nearly always pass does not sit on the side of the split it was written for, and is told to the maintainer before the size is fixed. The output tokens of a try say what the study will cost.
- **The other arms** are set up and run after the maintainer fixes the size. This note is added to then.
- **What is kept, and what the test takes for granted:** as in `../2026-11-12-third-ceiling`.

## What came: the arm with none

Written after these 16 tries were kept, from `score.py` and from all 16 answers, each read with what the tool said.

**With nothing, 15 of 16 answers passed.** T07, T09 and T10 passed in all four variants, and T08 in three.

- **The one failure is the subject's, and it is one of form.** On T08 in variant 2 the rule is in single quotes and holds a single quote of its own, in its regex. In a shell that quote ends the quoting. Run by bash, the rule arrives broken and ast-grep refuses it. The fresh reader of this task had named this risk. The other three subjects on T08 wrote the quote as `\x27` or as `.`.
- **Every control task nearly always passes with nothing.** So each sits where it was written to sit. In the second study the same arm passed 47 of 48.
- **Fifteen answers were called unsure and one sure.** The one called sure passed, and so did fourteen of the fifteen called unsure.
- **What a try costs.** 40,384 output tokens for the 16 tries: 2,524 for a try on average.
- **Each subject was what it should be.** Every record names the kind `bench-subject-closed`. For 13 of the 16 the harness also wrote the list of tools, and each list is `Read`, `Write` and the hand-back. No record holds a sign that a subject left its directory. Each read 3,717 tokens before its request.

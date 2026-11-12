# 2026-11-12-third-a: the third study, round one, the `outline` tasks

This was written before the run. The study is `../../studies/third.md`. The other half of the round is `../2026-11-12-third-a-control`: the two sets of tasks are kept apart, so a round is two runs.

- **What, for now.** The arm with none only: five tasks of the set `outline`, in variants 0, 1, 2 and 3. T05 is not among them: the ceilings took it out, as `../2026-11-12-third-ceiling` tells. Each try is one Haiku subject of the kind `bench-subject-closed`, with `task.md` and nothing else. It has no code and can run nothing.
- **Why this arm goes first.** The study fixes its size after one round of the arm with none, and before any other try. So these tries are scored as soon as they are kept. That is written in the study, and it is the one thing read before every try is kept.
- **These tries are the arm with none of round one.** They are not run again, and they are not left out, whatever they show.
- **What they are read for.** An `outline` task that passes more than one time in four with nothing does not sit on the side of the split it was written for, and is told to the maintainer before the size is fixed. The output tokens of a try say what the study will cost.
- **The other arms** are set up and run after the maintainer fixes the size. This note is added to then.
- **What is kept, and what the test takes for granted:** as in `../2026-11-12-third-ceiling`.

## What came: the arm with none

Written after these 20 tries were kept, from `score.py` and from all 20 answers, each read with what the tool said.

**With nothing, no answer passed: 0 of 20.** Every command was refused by ast-grep for a flag that `outline` does not have.

| the flag the subject reached for | tries |
|---|---|
| `--inline-rules`, with a rule as for `scan` | 12 |
| `--pattern`, as for `run` | 7 |
| `--kind` | 1 |

- **Each subject wrote what it knows of `run` and `scan` after the word `outline`.** 11 of the 20 reports say that the subject did not know of an `outline` subcommand, or was not sure that there is one. One: "I am not confident `outline` is a real ast-grep 0.51.1 subcommand (I know of run, scan, and related commands)."
- **No `outline` task passes one time in four with nothing.** So each of the five sits where it was written to sit, and none is told to the maintainer as out of place.
- **The subjects knew that they were guessing.** Seventeen called their answer a guess and three unsure. None called it sure.
- **All 20 failures are sorted as the test's.** The arm withholds what the task needs, by design. The score of this arm is read with that.
- **What a try costs.** 45,624 output tokens for the 20 tries: 2,281 for a try on average, and 3,694 for the longest. The study guessed 4,300.
- **Each subject was what it should be.** Every record names the kind `bench-subject-closed`. For 16 of the 20 the harness also wrote the list of tools, and each list is `Read`, `Write` and the hand-back. No record holds a sign that a subject left its directory. Each read 3,715 tokens before its request.

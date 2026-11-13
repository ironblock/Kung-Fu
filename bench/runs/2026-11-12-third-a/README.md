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

- **Each subject wrote what it knows of `run` and `scan` after the word `outline`.** 14 of the 20 reports doubt the `outline` subcommand: nine say that the subject does not know of one or is not sure that there is one, and five that it could not verify that there is one. This line first said 11 of the 20, and a reader who checked the study counted again. One: "I am not confident `outline` is a real ast-grep 0.51.1 subcommand (I know of run, scan, and related commands)."
- **No `outline` task passes one time in four with nothing.** So each of the five sits where it was written to sit, and none is told to the maintainer as out of place.
- **The subjects knew that they were guessing.** Seventeen called their answer a guess and three unsure. None called it sure.
- **All 20 failures are sorted as the test's.** The arm withholds what the task needs, by design. The score of this arm is read with that.
- **What a try costs.** 45,624 output tokens for the 20 tries: 2,281 for a try on average, and 3,694 for the longest. The study guessed 4,300.
- **Each subject was what it should be.** Every record names the kind `bench-subject-closed`. For 16 of the 20 the harness also wrote the list of tools, and each list is `Read`, `Write` and the hand-back. No record holds a sign that a subject left its directory. Each read 3,715 tokens before its request.

## The arms with a guide

Written on 2026-11-12, before any of these tries ran. The maintainer fixed the study at three rounds that day.

- **What.** Six arms on the five `outline` tasks, in variants 0 to 3: 120 tries. Each try is one Haiku subject of the kind `bench-subject-closed`, with `task.md` and the files of its arm.

| arm | the files | characters |
|---|---|---|
| other-skill | `SKILL.md` and `rule_reference.md`, the official ast-grep skill: the placebo | 22,196 |
| names | `flags.txt` | 337 |
| short-help | `short-help.txt` | 2,010 |
| facts | `facts.md` | 925 |
| outline-skill | `SKILL.md`, the official outline skill | 3,436 |
| help | `help.txt` | 7,939 |

The files and their sums are told in `../2026-11-12-third-ceiling` and in the study.

- **The order.** Groups of 15. For each variant in turn: the five tasks in the first three arms of the table, and then the five tasks in the last three.
- **What is read before every round is kept.** After the first group, the output tokens of its tries, to say what the rest will cost. After the round, whether each arm passed any try: an arm that passed none is not run again. Nothing else is scored until every round is kept.
- **After the first group with a guide**, counted on 2026-11-12 and nothing else read: its 15 tries wrote 28,987 output tokens, 1,932 for a try. The study guessed 3,000. These were the three shortest texts but one, so the longer ones may cost more.
- **What else every subject reads**, checked on 2026-11-12 after 125 of these tries were kept, when one subject wrote in its report that a file it read came with words about tools for documents, and that it left them alone. The words are not in `help.txt`: a search of it finds none. They come from the harness. Every one of the 759 records of a helper that this session holds, the subjects of all three studies among them, carries them. In 755 of the records they are one attachment with the same text, to the character: about 8,600 characters of instructions for four services connected to the session. That text does not name ast-grep, and the one place it uses the word "outline" is about the plan of a document. So it is the same in every arm and tells no arm what the task needs, and it is part of the tokens "each read before its request" above. What it does mean: the arm with no guide has never had an empty context, in this study or the two before it, and the scores are scores under this harness. Whether a subject does better or worse without that text is not known.

## After the round: which arms run again

Read on 2026-11-12, when all 140 tries of this run and all 48 of `../2026-11-12-third-a-control` were kept. One thing was read for each arm, as the study says: whether it passed any try. A helper showed that and nothing else of the score.

| arm | passed any try | so |
|---|---|---|
| none | no | at the floor: not run again |
| other-skill | no | at the floor: not run again |
| names | yes | runs in rounds two and three |
| short-help | yes | runs in rounds two and three |
| facts | yes | runs in rounds two and three |
| outline-skill | yes | runs in rounds two and three |
| help | yes | runs in rounds two and three |

- **What this is and is not.** It is the study's rule about what to run. It is not a result: how often any arm passed is not read, and no answer has been read against what the tool says.
- **A comparison against "none" or "other-skill"** is read on this round alone: 20 pairs, where a quarter is 5.
- **What the round cost.** The 120 tries with a guide wrote 228,810 output tokens, 1,907 for a try, and the longest wrote 3,761. By arm, for a try: other-skill 2,817, help 2,265, facts 1,766, names 1,613, outline-skill 1,564, short-help 1,415. With the arm with none, this run wrote 274,434. The control run wrote 127,731. The round: 402,165.

## What came: every arm

Written on 2026-11-12, after every round of the study was kept. All 140 answers of this run were read with what the tool said, the passing ones too. The study, `../../studies/third.md`, tells what the three rounds say together. This is the round by itself, and one round is data.

Tries that passed, of 4 for each task.

| arm | T01 | T02 | T03 | T04 | T06 | of 20 |
|---|---|---|---|---|---|---|
| none | 0 | 0 | 0 | 0 | 0 | 0 |
| other-skill | 0 | 0 | 0 | 0 | 0 | 0 |
| names | 0 | 3 | 0 | 0 | 0 | 3 |
| facts | 4 | 4 | 4 | 4 | 4 | 20 |
| short-help | 4 | 4 | 4 | 0 | 0 | 12 |
| outline-skill | 4 | 4 | 2 | 4 | 0 | 14 |
| help | 4 | 4 | 4 | 2 | 1 | 15 |

- **The arm "other-skill" wrote one flag 20 times.** Every one of its commands has `--inline-rules`, which its guide teaches for `scan` and which `outline` does not have. ast-grep refused all 20.
- **The comparisons against the two arms at the floor are read on this round**, and the study has them: the outline skill against none is +14 of 20, the facts against none +20 of 20, and the other skill against none 0 of 20.
- **Of the 76 failures, 60 are sorted as the test's, 4 as the subject's and 12 as not known**, each in `whose.txt`. The test's: 20 with nothing, 20 with the other skill, 16 with the names and 4 with the short help. The subject's: 2 with the outline skill and 2 with the help. Not known: 1 with the names, 4 with the short help, 4 with the outline skill and 3 with the help. They were first all sorted as the test's. The study tells why they were moved, and moved again after twelve tries of the stronger model on 2026-11-13.
- **Each subject was what it should be.** Every record names the kind `bench-subject-closed`, and each subject read between 3,715 and 3,734 tokens before its request.

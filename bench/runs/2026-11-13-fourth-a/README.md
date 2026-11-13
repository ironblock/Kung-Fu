# 2026-11-13-fourth-a: what a guide saves a subject that has the tool

This was written before the run. The study is `../../studies/fourth.md`. The ceilings are `../2026-11-13-fourth-ceiling`, and `../2026-11-13-third-shell-ceiling` for the arm with none.

- **What.** The Haiku model, as a subject of the kind `bench-subject`, on T01, T02, T03, T04 and T06 of the set `outline`, in variants 0 to 3, in three arms: 60 tries. Every subject gets `task.md`, the code under `src`, and `bin/ast-grep`. It has a shell and its files.

| arm | what the subject is given besides | characters |
|---|---|---|
| none | nothing | 0 |
| facts | `facts.md` | 1,099 |
| rows | `rows.txt` | 3,286 |

- **Why.** With the tool, the code and the tool's own help, the Haiku model passed 20 tries of 20 with no guide. So what is left to ask of a guide, for a subject with a shell, is what it saves.
- **What is measured first.** How much what the subject had read and written grew, from when it began to its first right call. A try with no right call counts for all it read and wrote.
- **The comparisons, and the rule.** Facts against none, rows against none, rows against facts. `compare.py` sets two arms try against try, and the size that matters is a third. It has five answers: shown, a saving smaller than a third, each for either arm, no saving as large as a third either way, and cannot tell. Every saving is also told in tokens for a try, and task by task.
- **What each outcome changes** is in the study. In short: a saving that is shown is the first measured saving of the project. A saving smaller than a third is a saving, told in tokens. No saving either way means the claim about spend has no support where a subject has the tool.
- **Beside it.** The same growth to each try's end. Whether the last answer passes: an arm that spends less and passes fewer tries, by a quarter of the pairs, has saved by failing. The output tokens. The calls, and how many were refused. Whether the subject asked the tool for its help. The calls that ask what a command of the guide asks, counted against the 19 rows in every arm: the arm with none says how often that is chance. In the pilot it was 35 calls of 131.
- **The order.** Four groups of 15, one for each variant. Each group holds the five tasks in all three arms, so no arm runs at another time than the others.
- **Nothing is scored until all 60 are kept.**
- **How a failure is sorted, with made-up failures sorted first.** With the tool and the code, nothing a right answer needs is withheld. So a failure is the subject's, unless the test made it: the request, the wrapper, the code, the grader, or the guide, which is part of what this test hands over. It is not known when the record cannot say.
  - The last answer lists the wrong items, the subject ran it and was shown the list, and no sentence or row of its guide says what the answer leans on: the subject's.
  - The last answer follows a sentence or a row of the guide, and the sentence is not so on the task's code: the test's. The guide is at fault.
  - The subject read in its guide the thing its answer breaks on, and went against it: the subject's.
  - The subject took the guide at its word, ran nothing, and its answer is wrong though the guide is right: the subject's.
  - The subject ran a row as it stands, was told that `demo` is not there, and gave up: not known, and told. The guide says that the directory is not there.
  - The subject ran another ast-grep than the one in `bin`: the answer is sorted as above, and the try is left out of every count of calls and of what was read before the first right call.
- **What it should cost,** guessed from the pilot, which is the same kind of try with no guide: about 3,700 output tokens a try, so about 225,000 at most, and less if a guide saves.
- **What it cannot show.** Anything about the model the maintainer aims at. Anything on tasks from another hand: the author of the guide knows these five tasks and their answers, so the guide holds what they need, and a saving here is nearer the most a guide can do than what it will do. Which of a guide's facts does the saving. Anything on code too long to read whole.
- **The guide is the third pinning, `f494600`.** `facts.md` begins `1d7da27f` and `rows.txt` begins `2d33731c`. The 40 tries with a guide were set up with the files of the pinning before, and were made anew from the pinned files before any was sent. No request changed by a word, and each `setup.json` holds the sum of the file its subject is handed. What the fresh readers found, and what was mended for it, is in the study.
- **A guess, written after the ceiling and before any try of this round.** Neither guide will be shown to save a third. Facts against none will come out as "no saving as large as a third, either way" or as "a saving, smaller than a third", with a try with the sentences spending between 0.85 and 1.0 of a try with none. Rows against none will be nearer 1.0, and may come out above it. The reason is the ceiling: all ten of its subjects read the whole code and the whole help after they had read the guide, and those two reads are near half of what a try spends before its first right call. All 20 subjects of the pilot asked for the help too. If the Haiku model does the same with a guide in hand, a guide has only the trial calls left to save.
- **So one more thing is counted beside, and fixed here:** in how many tries of each arm the subject asked for the tool's help, and in how many it read every file under `src`.

## What came, 2026-11-13

All 60 tries are kept, and nothing was scored before the last was. Every answer and every line of every subject's work was read. `compare.py` was run once on the whole.

**Every try passes: 20 of 20 in each arm.** So there is no failure to sort, and no arm saved by failing.

| for a try | none | facts | rows |
|---|---|---|---|
| read and written, growth to the first right call | 11,148 | 8,828 | 10,284 |
| the same to its end | 13,383 | 10,906 | 13,013 |
| output tokens | 3,298 | 3,006 | 2,997 |
| calls to ast-grep on the task's code | 6.1 | 4.3 | 5.2 |
| calls before the first right one | 3.6 | 2.0 | 2.4 |

**By the rule, on what was read and written before the first right call:**

| | the first spent | with the pairs drawn again | for a try | the rule's answer |
|---|---|---|---|---|
| facts against none | 0.79 of it | 0.70 to 0.89 | 2,320 tokens less | a saving, smaller than a third: the first spends less |
| rows against none | 0.92 of it | 0.80 to 1.05 | 865 less | no saving as large as a third, either way |
| facts against rows | 0.86 of it | 0.75 to 0.99 | 1,456 less | a saving, smaller than a third: the first spends less |

- **The sentences saved about a fifth, and the rule calls it a saving.** In 17 of the 20 pairs the try with the sentences spent less. Task by task it spent less on four of the five: T01 by 1,784 tokens, T02 by 3,346, T03 by 4,002, T06 by 2,594. On T04 it spent 124 more.
- **The rows were not shown to save.** A try with the rows spent 865 tokens less than one with none, and the interval holds no saving at all: in 11 of the 20 pairs it spent less. `compare.py` prints this pair the other way up, as none against rows: 1.08, and 0.96 to 1.24.
- **Facts against rows stands by the rule and not by much else.** The upper end is 0.99. With the five tasks drawn again in place of the pairs it is 0.71 to 1.06, and on T01 the rows spent less than the sentences, by 1,933. It is not leaned on.
- **With the five tasks drawn again,** facts against none is 0.67 to 0.91 and rows against none 0.76 to 1.07. Five tasks give a coarse interval. It is beside the rule, since the rule was fixed on pairs.

**Where the saving came from, read in the subjects' own commands.**

| of 20 tries | none | facts | rows |
|---|---|---|---|
| asked for the help of `outline` | 20 | 13 | 17 |
| read all of it, or all to line 120 of its 137 | 20 | 0 | 1 |
| read only its first 40 to 80 lines | 0 | 13 | 16 |
| read every file under `src` | 10 | 11 | 14 |
| read its guide | | 20 | 20 |
| named `demo` | 0 | 0 | 0 |
| calls that ast-grep refused | 2 | 0 | 0 |

- **It came from the help, and from fewer calls.** With no guide every subject read the help through: 18 in two calls, a first part and then the rest, and 2 in one. With the sentences 7 of 20 asked for none of it and 13 stopped at its first 40 or 60 lines. With the rows 3 asked for none, 16 stopped at 60 or 80 lines, and one read it all. The whole help is 7,939 characters, and its first 60 lines are 3,691.
- **A guide did not stand in for the code.** As many subjects read every file with a guide as with none, and with the rows more did. That last is 14 against 10 in 20, and is not tested.
- **The rows cost more to read than the sentences,** about 800 tokens by the ceiling's count. That is near the whole of what separates the two arms.
- **Both calls that ast-grep refused were made with no guide,** and both were a guess at a value of `--items`: `class`, and `function-declaration`.
- **No subject ran a command of its guide on `demo`.** Two with the rows ran the last row on their own code with the row's own name in it, `--match '^tally$'`.
- **One subject with the rows read the wrapper `bin/ast-grep`,** which says that every call is written down. It is rows T04 in variant 3, and it passes.

**The calls that ask what a row of the guide asks do not answer what they were counted for.**

- **They are as many with no guide as with one:** 26 of 122 calls with none, 18 of 86 with the sentences, 24 of 104 with the rows. That is about a fifth of the calls in each arm.
- **Nearly all of them are a look at the task's own code through the tool:** `ast-grep outline src`, or `--items imports src`. A subject needs that look whatever it was told. So the count cannot tell a check of the guide from a look at the code, and the hypothesis it was meant for is not tested here.
- **One thing in it does differ.** The bare `ast-grep outline src`, which shows what a directory lists when nothing is asked, was run 11 times with none, twice with the sentences and 4 times with the rows.

**The guess, against what came.**

- **Right:** neither guide was shown to save a third, and each comparison with none came out as one of the answers named.
- **Wrong:** the sentences spent 0.79 of none, below the 0.85 to 1.0 that was guessed. And the reason given was wrong for this subject. The ceiling's ten subjects read the whole help with the guide in hand. The Haiku model did not: with a guide it cut the help short or left it.

**Two rounds with no guide differ by nearly a tenth.** The pilot, `../2026-11-13-third-shell`, is the same 20 tries with the same request, run alone earlier that day. This round's arm with none spent 0.91 of what the pilot's spent, 0.83 to 1.00 with the pairs drawn again. Nothing was changed between them. So a tenth is what two rounds can differ by, and the saving of the sentences is about twice that. Inside this round the arms ran together, and that is what the rule compares.

**No sign that a subject left its directory.** `keep.py` flagged 18 commands in 10 tries. Each names only paths under the subject's own directory: most begin with `export PATH=` or `cat` and the full path, and one runs `../answer.txt` from `src`. No try changed the code.

**What it cost:** 186,022 output tokens of the Haiku model, against a guess of 225,000 at most. The ceiling cost 23,207 of the stronger model.

**What it cannot show** stands as written above, before the run. Three things are plainer now.

- **The saving is the reader's choice.** Neither guide tells a subject to leave the help. The Haiku model left most of it when it had a guide, and the stronger model left none of it. What another model does is not known from this.
- **The code here is seven short files.** Half the subjects read all of it in every arm. On code too long to read whole, what a try spends will lie elsewhere.
- **The help here is 137 lines.** The saving is about what it costs to read it. A tool with a longer help, or none, would give another number.


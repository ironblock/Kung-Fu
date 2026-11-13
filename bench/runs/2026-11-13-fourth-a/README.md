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

All 60 tries are kept, and nothing was scored before the last was. An independent check then read this write-up against the records. It found faults, some of them large. The text below is the mended one, and what the check changed is listed at its end.

**What was read, and what was not.** Each subject's commands were read, cut at 235 or 250 characters, and each subject's report as it came back. What the commands printed was counted by programs and not read. The subjects' reasoning is not in the records: 278 blocks of it, each one empty. By the check's count it is about half of the output tokens. So nothing here says why a subject did a thing.

**Every try passes: 20 of 20 in each arm.** So there is no failure to sort, and no arm saved by failing.

| for a try | none | facts | rows |
|---|---|---|---|
| read and written, growth to the first right call | 11,148 | 8,828 | 10,284 |
| the same to its end | 13,383 | 10,906 | 13,013 |
| output tokens | 3,298 | 3,006 | 2,997 |
| calls to ast-grep on the task's code | 6.1 | 4.3 | 5.2 |
| calls before the first right one | 2.6 | 1.0 | 1.4 |

**The measure held more than this note said.** After a subject's first message the harness hands it 8,401 characters of instructions for four services that are connected to the session. A subject can call none of them. That is about 2,700 tokens: 2,728 by a fit of tokens on characters over the later steps, and between 2,577 and 2,926 in every first step. It is the same in every arm, it is in every number of the table above, and it is in the pilot's numbers too. It does not change how many tokens a guide saved. It changes what share that is.

**By the rule, on what was read and written before the first right call:**

| | as it was measured | the rule's answer | with 2,700 tokens of the harness's text left out | the rule's answer |
|---|---|---|---|---|
| facts against none | 0.79, and 0.70 to 0.89 | a saving, smaller than a third | 0.73, and 0.60 to 0.85 | cannot tell |
| rows against none | 0.92, and 0.80 to 1.05 | no saving as large as a third, either way | 0.90, and 0.74 to 1.06 | no saving as large as a third, either way |
| facts against rows | 0.86, and 0.75 to 0.99 | a saving, smaller than a third | 0.81, and 0.67 to 0.98 | a saving, smaller than a third |

- **The sentences saved, and how large a share is not settled.** A try with the sentences spent 2,320 tokens less before its first right call, in 17 of the 20 pairs and on four of the five tasks. To its end it spent 2,477 less, in 18 of 20 pairs and on all five. That it is a saving holds either way. That it is smaller than a third holds only with the harness's text counted in. With that text out the rule cannot tell, and with the five tasks drawn again the interval as measured is 0.67 to 0.91.
- **The rows were not shown to save.** A try with the rows spent 865 tokens less than one with none, in 11 of the 20 pairs. The interval runs from a fifth less to a twentieth more.
- **Facts against rows is no stronger than two rounds of one arm,** which is the next thing. It is not leaned on. With the five tasks drawn again it is 0.71 to 1.06, and on T01 the rows spent least of the three.

**Two rounds with no guide, and what the rule says of them.** The pilot, `../2026-11-13-third-shell`, is the same 20 tries with the same request, run alone earlier that day.

| this round's none against the pilot's none | the first spent | with the pairs drawn again | the rule's answer |
|---|---|---|---|
| to the first right call | 0.91 of it | 0.83 to 1.00 | no saving as large as a third, either way |
| to the try's end | 0.92 of it | 0.84 to 1.00 | a saving, smaller than a third |
| by output tokens | 0.89 of it | 0.80 to 0.98 | a saving, smaller than a third |

- **The rule calls two rounds of one arm a saving, by two measures of three.** Nothing was changed between them. So its interval, which is drawn from the pairs inside the rounds, is narrower than what two rounds differ by. An answer of "a saving" near 0.9 says little.
- **The sentences against none, 0.79, lies beyond that. The sentences against the rows, 0.86, does not.**
- **Against the pilot's arm with none,** the sentences spent 0.72 of it, 0.62 to 0.82, and the rule cannot tell. The rows spent 0.84 of it, 0.74 to 0.94, and the rule says a saving. The first write-up worked these out and left them out. The second does not make the rows a saving: the same rule tells none from none.

**Where the saving came from.** The check split what a try read and wrote before its first right call by kind. The tokens of each step are the harness's own count. Inside a step they are shared among what came back by its length in characters, so the parts are near and not exact. The check's programs and the data they need are in `../../checks/2026-11-13-fourth-a`.

| tokens for a try, before the first right call | none | facts | rows | facts less none, with the pairs drawn again |
|---|---|---|---|---|
| written by the subject | 2,249 | 1,901 | 1,821 | -348, and -692 to -25 |
| the harness's text | 2,728 | 2,728 | 2,728 | 0 |
| the task | 602 | 536 | 485 | -66 |
| the guide | 0 | 453 | 1,232 | +453 |
| the tool's help | 2,791 | 534 | 1,046 | -2,257, and -2,552 to -1,960 |
| the code | 1,603 | 2,076 | 2,168 | +473, and -373 to +1,316 |
| what else the calls printed | 1,175 | 600 | 803 | -575, and -1,191 to +116 |
| all | 11,148 | 8,828 | 10,284 | -2,320 |

- **It came from the help. That much is shown.** A try with the sentences read 2,257 tokens less of the tool's help, in 20 of the 20 pairs. The two rounds with no guide differ by 54 tokens on the help.
- **The rows saved on the help too,** 1,745 tokens in 19 of 20 pairs, and gave 1,232 back in their own length.
- **That it came from fewer calls is not shown.** With the sentences a subject made 1.0 calls before its first right one, against 2.6 with none and 2.5 in the pilot. But what the subjects wrote and what their calls printed is 923 tokens less, and the two rounds with no guide differ by 1,093 on that same part.
- **It did not come from the code.** A try with a guide read no less of it, and by the split a little more.

| of 20 tries | none | facts | rows |
|---|---|---|---|
| asked for the help of `outline` | 20 | 13 | 17 |
| read it to line 120 of its 137, or all of it | 20 | 0 | 1 |
| read only its first 40 to 80 lines | 0 | 13 | 16 |
| asked for none of it | 0 | 7 | 3 |
| had read none of it at the first right call | 0 | 12 | 7 |
| also read the top help, `ast-grep --help` | 8 | 0 | 1 |
| read every file under `src` | 10 | 12 | 14 |
| read its guide | | 20 | 20 |
| named `demo` | 0 | 0 | 0 |
| calls that ast-grep refused | 2 | 0 | 0 |

- **With no guide every subject read the help to line 120 or further:** 9 saw all 137 lines and 11 saw lines 1 to 120. Two asked once, 17 twice and one three times. The whole help is 7,939 characters, and its first 60 lines are 3,691.
- **By its first right call a subject with a guide had read less of the help still.** With the sentences 12 had read none and 8 its first 60 lines. With the rows 7 had read none, 12 its first 60 or 80 lines, and one all of it. In 5 tries with the sentences and 4 with the rows the help is asked for in the same message as the first right call. So this measure turns on how a subject batches its calls.
- **`head -60` stops before the line that says what `--match` is matched against.**
- **Both calls that ast-grep refused were made with no guide,** and both were a guess at a value of `--items`: `class`, and `function-declaration`. Each came from a subject that had read only the help's first 40 lines by then.
- **No subject ran a command of its guide on `demo`.** Two with the rows ran the last row on their own code with the row's own name in it, `--match '^tally$'`.
- **One subject with the rows read the wrapper `bin/ast-grep`,** which says that every call is written down. It is rows T04 in variant 3, and it passes.

**The calls that ask what a row of the guide asks do not answer what they were counted for.**

- **They are as many with no guide as with one:** 26 of 122 calls with none, 18 of 86 with the sentences, 24 of 104 with the rows. That is about a fifth of the calls in each arm.
- **Most are a look at the task's own code through the tool:** 21 of the 26, 13 of the 18 and 15 of the 24 are `ast-grep outline src`, or the imports, or all the items. A subject needs that look whatever it was told. So the count cannot tell a check of the guide from a look at the code, and the hypothesis it was meant for is not tested here.
- **One thing in it does differ.** The bare `ast-grep outline src`, which shows what a directory lists when nothing is asked, was run 11 times with none, twice with the sentences and 4 times with the rows.

**The guess, against what came.**

- **Right:** neither guide was shown to save a third, and each comparison with none came out as one of the answers named.
- **Wrong:** the sentences spent 0.79 of none, below the 0.85 to 1.0 that was guessed. And the reason given was wrong for this subject. The ceiling's ten subjects read the whole help with the guide in hand. The Haiku model did not.
- **Not known:** whether the saving is under a third at all, now that the harness's text is seen in the measure.

**The two models did not run alike, and not only in what they are.** The harness ran the Haiku model at the effort it calls medium, and the stronger model of the ceiling at the one it calls xhigh. So that one read the whole help and the other left it is not shown to be the model's doing.

**No sign that a subject left its directory.** `keep.py` flagged 18 commands in 10 tries. Each names only paths under the subject's own directory: most begin with `export PATH=` or `cat` and the full path, and one runs `../answer.txt` from `src`. One command it did not flag steps to the directory above and straight back, and reads nothing there: rows T03 in variant 0. No try changed the code.

**What it cost:** 186,022 output tokens of the Haiku model, against a guess of 225,000 at most. The ceiling cost 23,207 of the stronger model.

**What it cannot show** stands as written above, before the run. These are plainer now.

- **The measure holds the harness's own text,** about 2,700 tokens a try. The share a guide saves depends on whether that is counted.
- **The path of a subject's directory names its arm.** Whether any subject used that is not known, since no reasoning is kept.
- **The saving is the reader's choice.** Neither guide tells a subject to leave the help. Why the Haiku model left it is not in the records.
- **The code here is seven short files, and the help is 137 lines.** The saving is about what it costs to read that help. A tool with a longer help, or none, would give another number.
- **One round.** Two rounds of one arm differ by a tenth, and the rule does not allow for it.

## What the check changed, 2026-11-13

The check was made by an agent that had not seen the write-up being made. It read the kept tries, the harness's own records, and the record of the session that wrote the first text.

- **Found: the harness's text in the measure.** The first text gave one answer of the rule for each pair of arms. Now each has two, and "smaller than a third" is taken back for the sentences.
- **Taken back: "every answer and every line of every subject's work was read".** The commands were read, cut short. What they printed was not.
- **Taken back: "`compare.py` was run once on the whole".** It ran, a line it prints was mended, and it ran again: "5 of 6 tasks" became "5 of 5", and no comparison changed. Its rule was then called again on other pairs, and two of the answers were left out. They are told above.
- **Taken back: "it came from the help, and from fewer calls".** The first half is shown and the second is not.
- **Wrong numbers, mended.** Calls before the first right one were given as 3.6, 2.0 and 2.4, which is the number of the first right call. The subjects that read every file were given as 11 with the sentences, and it is 12. "18 read the help in two calls" was 17, and "read it through" was for 11 of 20 a reading to line 120 of 137. "Near the whole of what separates the two arms" was said of 800 tokens of 1,456.
- **Added: what two rounds of one arm differ by, set against the rule.** The first text gave the tenth and did not say that the rule calls it a saving.
- **Added: the efforts the two models ran at.**
- **Kept now: each subject's steps.** `lines.json` beside each try holds its commands, how much came back for each, and what the harness added. `bench/lines.py` makes it. The help and the code counts above can be made again from it.
- **After the check, the measure was mended in the programs.** `compare.py` now leaves the harness's text out itself, at 2,728 tokens a try, and prints 0.72 for the sentences against none where this note says 0.73. The study tells it under "The measure mended".

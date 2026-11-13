# 2026-11-13-third-label-a: how often does the stronger model pass T06 with the skill?

This was written before the run. The study is `../../studies/third.md`, and its sections "After the planning session read the result" and "The go, 2026-11-13" say why this is run. The other two thirds of it are `../2026-11-13-third-label-b` and `-c`: a run holds one try at a variant, so three tries at each variant are three runs.

- **What.** The stronger model, as a subject of the kind `bench-subject-closed`, on T06 of the set `outline`, with the official outline skill, `SKILL.md`, 3,436 characters. Variants 0 to 3, three times: 12 tries. A subject gets `task.md` and the skill. It gets no code and can run nothing. The request is the study's, word for word.
- **Why.** In the study, eleven of twelve tries of the Haiku model failed T06 with the skill, and all eleven wrote one command: `ast-grep outline --items structure --type function src`. They are sorted as the subject's, because a right answer was written from the same text: by the stronger model, once, in the ceiling, and by one try of the Haiku model. The planning session saw that the stronger model's pass adds a `--match` that the skill does not ask for. So it may be care, and it is one try. Twelve tries say how often.
- **The size is fixed at twelve.** The twelve with the long help that the study's note speaks of are not run. So this settles the skill arm's eleven failures and not the help arm's eleven, which keep their label and what it rests on.
- **What each outcome changes.** Written in the study before this note:

| passes of twelve | the eleven failures of the Haiku model on T06 with the skill |
|---|---|
| ten or more | stay the subject's: a careful reader gets there from the skill |
| two or fewer | are the test's: the skill does not lead there, and the ceiling's pass was one draw |
| three to nine | are not known |

- **What is read beside the count.** How each passing answer passes: by a `--match` on the line, or another way. What each failing answer wrote. The word each subject gives.
- **How a failure of this run is sorted, with made-up failures sorted first.** After the twelve are counted, by the same line of the table: the subject's at ten or more passes, the test's at two or fewer, not known between. A try that writes `--type function` and nothing more, where eleven others pass: the subject's. The same try where one other passes: the test's. A try that fails on a quote the shell takes, whatever the count: the subject's, since the text has no part in it.
- **Twelve tries at nearly one string.** T06 has one reference answer for all four variants, and its wordings differ only in the names of their examples.
- **What it does not show.** Anything about the Haiku model, or about the help. Whether a subject with the tool in hand would do the same: `../2026-11-13-third-shell` asks that.
- **What it should cost.** The one try of this kind, in the ceiling, wrote 23,337 output tokens. So twelve are about 280,000 of the stronger model. The maintainer was told about 210,000, from the mean of all the ceiling's tries, 17,500: that was the wrong kind of try to guess from. The first four are sent and counted before the other eight.
- **What is kept, and what the test takes for granted:** as in `../2026-11-12-third-ceiling`.

## What came

Written on 2026-11-13, after all twelve tries were kept. Every answer was read with what the tool said of it. This holds the three runs.

**The stronger model passed T06 with the skill in 5 tries of 12.** By the table above, three to nine is not known.

| run | variant 0 | variant 1 | variant 2 | variant 3 | passed |
|---|---|---|---|---|---|
| `-a` | pass | pass | pass | wrong | 3 of 4 |
| `-b` | wrong | wrong | wrong | wrong | 0 of 4 |
| `-c` | pass | wrong | pass | wrong | 2 of 4 |

- **All seven wrong answers are one command:** `ast-grep outline --items structure --type function src`. It is the command that eleven of the twelve tries of the Haiku model wrote with the same text. It lists the four arrow functions that the task does not count.
- **All five passing answers add a `--match` on the word `function`.** Two have `'^\s*(export\s+)?(default\s+)?(async\s+)?function\b'` and three have `'^[^=]*\bfunction\b'`. The skill does not ask for one. So the planning session's reading holds: a pass here is care, and not a thing the subject read.
- **With the ceiling's one try, the stronger model has passed 6 of 13.**
- **The word each subject gave.** Eleven said unsure, and one said sure. The one that said sure was wrong.
- **No subject's reasoning is kept,** so why seven wrote the one command and five the other is not known. The request asks for a report of two lines, and all twelve kept to it.
- **What it changes.** The eleven failures of the Haiku model on T06 with the skill were sorted as the subject's, on the ceiling's one pass. They are now sorted as not known, and each line in their `whose.txt` says why. The seven failures here are sorted as not known by the same line of the table.
- **What it does not change.** The eleven failures of the Haiku model on T06 with the long help keep the label "the subject's". It rests on one try of the stronger model and one of the Haiku model, as the skill's did, and those twelve tries were not run.
- **What it cost.** 183,393 output tokens of the stronger model, 15,283 for a try. The two guesses were 210,000 and 280,000.
- **Each subject was what it should be.** Every record names the kind `bench-subject-closed`, and no record holds a sign that a subject left its directory.

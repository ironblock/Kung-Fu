# The fourth study, written down

It was written on 2026-11-13. The maintainer agreed that day to a study of spend, and parked one thing that was proposed beside it. The size of this study is not fixed, and not all of its tasks are here. Nothing of it has run.

## The question

With the tool in hand, how much less does a subject read and write before its command is right, when it is handed a short guide of facts? And does it matter whether the facts are sentences, or rows that `ley` checks?

## Why this one

- **With no tool, a guide taught.** In the third study a subject that did not know `ast-grep outline` passed no try of 20 with nothing, and 20 of 20 with 925 characters of facts.
- **With the tool, the code and the help, there was no failure for a guide to prevent.** In the round after that study, `../runs/2026-11-13-third-shell`, the same model passed 20 tries of 20 with no guide. Every subject asked the tool for its long help and read the code. So for a subject with a shell, on tasks like those, the question left is what a guide saves.
- **The maintainer's aim, said on 2026-11-13, is one small model: Qwen 3.8 27B, working within about half its native context.** That is what fits, the maintainer says, when the model runs at a fairly aggressive quantization on a consumer card with 24 GB of memory. For such a model what counts is what its context has to hold: what it reads as well as what it writes. The bench counted what a subject wrote. Since that day it also keeps how many tokens the subject had in front of it at each message, and `score.py` prints it.
- **No model has read a row.**

**What the kept tries already say.** These numbers were counted after the fact, from tries that were not run to compare them. They are data to size this study by, and not a finding.

| the Haiku model, on the five `outline` tasks | tries | what it had read and written grew by, to its end | to its first right call | of the growth to its end, written |
|---|---|---|---|---|
| with the tool, the code and no guide | 20 | 14,608 tokens | 12,301 | 3,720 |
| with no tool and the first facts guide | 60 | 5,793 | | 1,942 |
| with no tool and the long help | 60 | 8,482 | | 2,228 |
| with no tool and nothing | 20 | 5,692 | | 2,281 |

- **Three quarters of what a subject with the tool spent was reading:** the help, the code, and each list it asked for.
- **Each subject began with about 7,000 tokens of the harness's own,** or about 3,700 with no shell. That is the same in every arm, and it is left out of every number here.

## What exists

- **The bench, and the kind of subject with a shell,** which ran for the first time on 2026-11-13.
- **The five `outline` tasks,** and the round of 20 tries with the tool and no guide. That round is this study's pilot: it fixes the size and the guess of cost.
- **A second guide about `outline`,** in `../guides/outline2`, committed at `10faae6` and pinned again at `b46e221`, each time before any task from another hand was seen. The sums below are the second pinning's, and the last section says what changed.

| | the file | characters | its SHA-256 sum begins |
|---|---|---|---|
| the facts in sentences | `facts.md` | 997 | `772068c1` |
| the same facts as rows | `rows.txt`, which is the ledger `ley.toml` as `ley show` prints it | 2,981 | `9f154719` |
| the ledger | `ley.toml`, 19 rows, and `ley check` holds them all | | `51be8402` |

- **It mends what was wrong in the first guide,** four things in two lines, and its check ties each of its thirteen sentences to the rows it stands on. A sentence with no row has no place in it.
- **It leaves out two things the first guide said:** that `--items` takes one value, and that `--type` is given once. Each is a refusal, and a row cannot yet show a refusal. So the sentences say no more than the rows do.
- **The rows are longer than the sentences, by three times.** That is the form, and the study counts it: a subject pays for a guide in what it reads.
- **Its author knows the five `outline` tasks and their answers.** On those five this guide is not independent of the tasks. On the maintainer's tasks it is.

## What has to be done first

1. **The maintainer's tasks,** which the maintainer said they will bring. They go into a set as they are worded, with the code they are about and the items each expects.
2. **`compare.py` gets the rule below,** on the new measure, and the self-check covers it. Done on 2026-11-13, with the two answers that the last section adds.
3. **The ceilings.** The stronger model does each task once in each arm, with the tool.
4. **A fresh reader** reads one request that has a guide and the tool together, which has not been sent before.
5. **The rule that sorts failures is tried on made-up failures,** as `AGENTS.md` asks, and written in the first run's note.

## The subject

The Haiku model, as a subject of the kind `bench-subject`: a shell and its files, with the code and the tool. One task for one subject. It stands in for the kind of model the maintainer aims at, and nothing here is about that kind.

## The arms

Every arm has the tool and the code.

| arm | what the subject is given besides the task | characters |
|---|---|---|
| none | nothing | 0 |
| facts | `facts.md` | 997 |
| rows | `rows.txt` | 2,981 |

- **Every arm runs in every round, at one time.** The 20 tries of the pilot ran alone, so they are not this study's arm with none.
- **Not an arm:** the long help handed over at the start. Every subject of the pilot fetched it unasked.
- **Not an arm yet:** the rows with their small file beside them, so that a subject can run a row. It is what a ledger about a tool would be in use, and it costs more to read. It is left for later.

## What is measured

**First: how much what the subject had read and written grew, from when it began to when it made its first right call.** A try that never makes a right call is counted for all it read and wrote, and the number of such tries is printed beside the sum, as in the first study.

**Beside it:** the same to the try's end. Whether the last answer passes. The output tokens. The calls, and how many the tool refused. Whether the subject asked for the help, and how much of it it was shown. The word each subject gives.

**The rule.** Two arms are set try against try: the same task in the same variant of the same round. R is what the first arm spent, summed over the pairs, as a share of what the second spent.

| the rule says | when |
|---|---|
| shown: the first spends less, by the size that matters or more | R is at or under one less the size, and R is under 1 in 95 of 100 resamplings of the pairs |
| no saving as large as that | R is over one less the size in 95 of 100 resamplings |
| cannot tell | anything else |

- **The size that matters is not fixed here.** The first study took a half. A third is proposed, and it is the maintainer's to say: for a model with a bounded context a saving counts in proportion, and a third of 12,000 tokens is 4,000 for each thing learned.
- **A saving is told with the passes beside it.** An arm that spends less and passes fewer tries, by a quarter of the pairs, has saved by failing, and is told so.
- **The task is the unit.** The table of each task in each arm is the result, and the rule over all tasks stands beside it.

**The comparisons, fixed here.** Each is made on the five `outline` tasks and on the maintainer's tasks, apart.

1. **Facts against none.** What the sentences save.
2. **Rows against none.** What the rows save.
3. **Rows against facts.** Whether the form matters, at three times the length.

## What each outcome changes

- **1 is shown.** The first measured saving of the project. It is told in tokens for each task, which is what the maintainer's aim counts in.
- **1 is "a saving, smaller than a third".** Added on 2026-11-13. The guide saves what the comparison gives in tokens for a try, most likely the reading of the help. The claim about spend has support of that size.
- **1 is "no saving as large as a third, either way".** With a shell, on these tasks, a guide of this kind is not shown to save anything. The claim about spend then has no support where a subject has the tool, and what is left of the project's claim is the subject with no tool, or a weaker subject than this one.
- **2 or 3 is shown for the rows.** A ledger can teach a tool, which is the link between the two projects. Building the first ledger about a tool has a reason.
- **3 is shown for the facts.** The rows cost more than they give, in this form.
- **The maintainer's tasks and the five tasks disagree.** The maintainer's count for more: the guide's author did not know them.
- **Cannot tell.** It is said so, and no tries are added.

## Its size

It is not fixed. The rule was tried on made-up subjects, 200 times a line with 1,000 resamplings: the arm with none drawn from the pilot's tries at the same task, and the guide's arm drawn the same way and made smaller by a share. One round is 20 pairs on the five tasks.

| the guide's arm spends, of none | size a third, 20 pairs: shown | none that large | size a third, 60 pairs: shown | none that large | size a half, 20 pairs: shown | none that large |
|---|---|---|---|---|---|---|
| a half | 100 in 100 | 0 | 100 in 100 | 0 | 53 in 100 | 5 in 100 |
| two thirds | 43 in 100 | 5 in 100 | 47 in 100 | 4 in 100 | 0 | 100 in 100 |
| four fifths | 0 | 87 in 100 | 0 | 100 in 100 | 0 | 100 in 100 |
| the same | 0 | 100 in 100 | 0 | 100 in 100 | 0 | 100 in 100 |

- **One round nearly always gives an answer,** unless the true saving sits on the size that matters, where "shown" is one draw in two at any size. Spend varies little from try to try: in the pilot it ran from 7,000 to 16,400 tokens to the first right call.
- **The table says more than it can,** as the third study's did: it takes each try as its own draw, and tries at one task move together.

**What is proposed.** One round: three arms on the five `outline` tasks in four variants, 60 tries, and the same three arms on the maintainer's tasks.

**What it may cost,** guessed from the pilot, which is the same kind of try: about 3,700 output tokens for a try with no guide, so at most about 225,000 for the 60, and less if a guide saves. The ceilings are 15 tries of the stronger model on the five tasks, about 57,000. The maintainer's tasks add to both by their number.

## What it cannot show

- **Anything about the kind of model the maintainer aims at.** The Haiku model found the help and read it unasked, in 20 tries of 20. A smaller model may not, and may gain more from a guide, or less. To run one, the bench needs a program of its own in the place of `claude_code.py`, and a place where that model answers.
- **Tokens are this model's.** Another model counts the same text in other tokens.
- **Anything on code too long to read whole.** The five tasks have 320 lines of it.
- **That the five `outline` tasks are fair to the guide.** Its author knows them.
- **Which of a guide's facts does the saving.**

## Parked, and left for later

- **Tasks where a wrong list looks right.** The maintainer parked it on 2026-11-13: it is the more speculative, and near to proving that a thing does not happen.
- **The twelve tries of the stronger model on T06 with the long help.**
- **The guide with one line taken out at a time.**
- **The rows with their small file, to be run.**

## After the planning session read it, and before the maintainer's tasks

Written on 2026-11-13. The planning session read this repository at `e91d247` and sent four things to settle, and the maintainer said what may be written of the aim. Each number of the planning session's was made again here, and each holds. No task of the maintainer's has been seen, and nothing has run.

**The aim is named.** The maintainer said that Qwen 3.8 27B may be named, and that "about half its native context" is about right. The line under "Why this one" now says so, in the maintainer's reason. The project this one came out of is public, the maintainer says, and names that model as its target.

**1. The size that matters is a third, and the rule has two more answers.**

- **A half is out of reach, and a third is within it.** The least a subject could spend is near what a subject with no tool and the first facts guide spent: 5,793 tokens. Against the pilot's 12,301 that is 0.47.
- **Two outcomes are likely, and a third tells them apart.** Reading the long help cost about 2,790 tokens, where there was no tool: 8,482 with it and 5,692 with nothing. A guide that takes the place of the help and of nothing else saves about 2,000 to 2,500 once its own length is paid, which is near 0.8 of the arm with none. A guide that also takes the place of the looking around comes near 0.5.
- **At 0.8 the rule above said "no saving as large as that", and the list of outcomes then read "the claim about spend has no support".** That said too much. A saving of 2,400 tokens for each thing learned is not nothing to a model with a bounded context.
- **So the rule now has five answers,** and `compare.py` holds it: shown, for either arm. A saving, smaller than a third, for either arm: one arm spends less in 95 of 100 resamplings, and in 95 of 100 the saving is under a third. No saving as large as a third, either way. Cannot tell.
- **Every saving is told in tokens for a try, and task by task, whatever the rule says.** `compare.py` prints both.
- **The outcome "1 is a saving, smaller than a third"** is added to the list above: the guide saves what it is told to save in tokens, most likely the help. The claim about spend then has support of that size, and the outcome that reads "has no support" is kept for "no saving as large as a third, either way".
- **The size is still the maintainer's to fix.** A third is what this note proposed and what the planning session argues for.

**2. The first study, by the new measure.** These are counted after the fact, from tries that were not run to compare them, on a part of the tool the subject knew. They are data to size this study by.

| growth to the first right call, for a try | none | skill, 22,196 characters | facts, 1,303 characters |
|---|---|---|---|
| the six tasks that turn on a fact, 18 tries an arm | 16,031 | 23,148 | 14,119 |
| the four control tasks, 12 tries an arm | 9,201 | 19,584 | 9,029 |

- **The long skill cost about 7,100 and 10,400 tokens a try, and saved nothing.** The output tokens hid it: 187,194 with none and 188,068 with the skill. By the new rule, the facts against the skill is "shown: the first spends less, by a third or more".
- **The short guide broke even where it was not needed,** on the control tasks: 0.98 of none, and with resampling 0.79 to 1.18. On the other six it spent about an eighth less, 0.88, which by the rule is "no saving as large as a third, either way".
- **So the control tasks are not run in this study.** What a short guide in sentences costs when it is not needed is on record for one guide: nothing that twelve pairs could see. The rows are three times as long. Their own length is about a tenth of what a control try spends, and twelve pairs gave an interval of a fifth either way. So a round of control tasks at this size could not tell the rows' cost from none. What the rows cost when they are not needed is not measured here, and is at least their length.

**3. The small file's directory is `demo`, and the guide is pinned again.**

- **The rows named `src`, and so does every task.** A subject with the tool could run a row as it stood on its own code. It would get another count than the row gives, and might take that as a sign that the guide is wrong. That would count against the rows for the name of a directory, and not for their form.
- **Now no command of either guide runs as it stands in a subject's directory.** The sentences name `demo` as well, in their two commands, so that neither form says more than the other. The rows' first line says that the directory is not there.
- **Pinned at `b46e221`.** `facts.md` is 997 characters, `rows.txt` 2,981, and the ledger still holds its 19 rows.

**4. The calls that ask what a guide's command asks are counted.**

- **This is the first test of a hypothesis of the project:** that a fact stated plainly is used without being checked again. The bench writes down every call. `score.py --guide` counts the calls that ask what a row asks, but for the path, the view and the order of the options.
- **The arm with none is what the count is read against.** A subject that has seen no guide meets such commands by chance. In the pilot, with no guide at all, 35 of 131 calls did, in 16 tries of 20. So a count in an arm with a guide says something only where it differs from that.
- **The sentences hold two commands and the rows nineteen.** The count is made against the nineteen in every arm.

**Two more things.**

- **Neither guide tells a subject to skip the help or the code.** So what an arm saves, its subjects chose to save. The planning session saw this, and it is why the requests stay as they are.
- **Of the maintainer's tasks,** the planning session says that eight tasks in two variants say more than four tasks in four. The task is the unit.


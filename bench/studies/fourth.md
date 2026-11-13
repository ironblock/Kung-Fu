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
- **A second guide about `outline`,** in `../guides/outline2`, committed at `10faae6`, pinned again at `b46e221`, and a third time at `f494600`, each time before any task from another hand was seen and before any try of this study. The sums below are the third pinning's, and the last sections say what changed.

| | the file | characters | its SHA-256 sum begins |
|---|---|---|---|
| the facts in sentences | `facts.md` | 1,099 | `1d7da27f` |
| the same facts as rows | `rows.txt`, which is the ledger `ley.toml` as `ley show` prints it | 3,286 | `2d33731c` |
| the ledger | `ley.toml`, 19 rows, and `ley check` holds them all | | `b819f98c` |

- **It mends what was wrong in the first guide,** four things in two lines, and its check ties each of its thirteen sentences to the rows it stands on. A sentence with no row has no place in it.
- **It leaves out two things the first guide said:** that `--items` takes one value, and that `--type` is given once. Each is a refusal, and a row cannot yet show a refusal. So the sentences say no more than the rows do.
- **The rows are longer than the sentences, by three times.** That is the form, and the study counts it: a subject pays for a guide in what it reads.
- **Its author knows the five `outline` tasks and their answers.** On those five this guide is not independent of the tasks. On the maintainer's tasks it is.

## What has to be done first

1. **The maintainer's tasks,** which the maintainer said they will bring. They go into a set as they are worded, with the code they are about and the items each expects.
2. **`compare.py` gets the rule below,** on the new measure, and the self-check covers it. Done on 2026-11-13, with the two answers that the last section adds.
3. **The ceilings.** The stronger model does each task once in each arm, with the tool.
4. **A fresh reader** reads one request that has a guide and the tool together, which has not been sent before. Done on 2026-11-13, once for each form of the guide: the last section says what they found.
5. **The rule that sorts failures is tried on made-up failures,** as `AGENTS.md` asks, and written in the first run's note.

## The subject

The Haiku model, as a subject of the kind `bench-subject`: a shell and its files, with the code and the tool. One task for one subject. It stands in for the kind of model the maintainer aims at, and nothing here is about that kind.

## The arms

Every arm has the tool and the code.

| arm | what the subject is given besides the task | characters |
|---|---|---|
| none | nothing | 0 |
| facts | `facts.md` | 1,099 |
| rows | `rows.txt` | 3,286 |

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
- **Pinned at `b46e221`.** At that pinning `facts.md` was 997 characters and `rows.txt` 2,981, and the ledger held its 19 rows. The last section pins it once more.

**4. The calls that ask what a guide's command asks are counted.**

- **This is the first test of a hypothesis of the project:** that a fact stated plainly is used without being checked again. The bench writes down every call. `score.py --guide` counts the calls that ask what a row asks, but for the path, the view and the order of the options.
- **The arm with none is what the count is read against.** A subject that has seen no guide meets such commands by chance. In the pilot, with no guide at all, 35 of 131 calls did, in 16 tries of 20. So a count in an arm with a guide says something only where it differs from that.
- **The sentences hold two commands and the rows nineteen.** The count is made against the nineteen in every arm.

**Two more things.**

- **Neither guide tells a subject to skip the help or the code.** So what an arm saves, its subjects chose to save. The planning session saw this, and it is why the requests stay as they are.
- **Of the maintainer's tasks,** the planning session says that eight tasks in two variants say more than four tasks in four. The task is the unit.

## The go, 2026-11-13

The maintainer said go that day, and did not ask for another size than a third. Everything below was written before any try.

- **The size that matters is a third.**
- **One round, on the five `outline` tasks.** Three arms in four variants: 60 tries of the Haiku model. The runs are `../runs/2026-11-13-fourth-ceiling` and `../runs/2026-11-13-fourth-a`, each with a note.
- **The maintainer's own tasks are not here.** The maintainer wants to make them with care, so that they do not become a study of their own. So each comparison is made on the five `outline` tasks alone for now, and what that takes from the result is said with it: the guide's author knows those five tasks and their answers.
- **The ceilings are ten tries, not fifteen.** The stronger model does each task once with the sentences and once with the rows. With nothing, and with the same request, it passed all five on this day: `../runs/2026-11-13-third-shell-ceiling`. That ceiling stands.
- **The order.** Four groups of 15, one for each variant, each holding the five tasks in all three arms.
- **The maintainer named a library as a thing to try next,** in place of a tool: it moves fast, and the model the maintainer aims at does not know it. It is not started. It asks for another kind of task and another grader, and it is written here so that it is not lost.

## What the fresh readers found, 2026-11-13, before any try

Four readers read the guide that day. Each was the stronger model, and none had seen the tasks' answers or how the test is built. No try of the study had been sent.

**The first two each got one request as a subject gets it,** in a directory of its own: one with the rows (T04, variant 3) and one with the sentences (T01, variant 2). Each did its task with the tool, and was told to check its guide against the tool as it went. Neither found a sentence or a row that was untrue of the tool on its code. They found these:

- **Neither form said where its commands had run.** The sentences said only "Each line was checked by running it", and named `demo` without a word on what it is. The rows said "a small file, in a directory named `demo`", and every command passes the directory.
- **Three rows could not be read.** Each had `^` in its regex and the words "as it is read", with no word on who reads. The reader understood them only after running the tool.
- **"Results" was never said to mean items,** and a row with 0 results says "it will show you" a thing and then that it shows none.
- **Two rows about types, and the sentence they stand under, could be read two ways:** whether "that is not exported" covers the function declarations too, and whether "exported or holds another value" joins as the tool does. In the sentences, "with another value" and "both" had no clear referent.
- **"Only exported items" left a case open.** A `const` named in an `export {...}` list is not listed as exported, and the list itself is.
- **An `export * from` is a `module` too.** Both readers found this alone, each on its own task's code. Neither form said so.

**Both forms were mended together, and the guide pinned a third time at `f494600`.**

- **The small file gains one line,** `export * from "./tint.js";`, and four counts rise by one. The ledger still holds its 19 rows, and the check still ties each of the thirteen sentences to its rows.
- **`facts.md` is 1,099 characters, and its cap rises from 1,000 to 1,100.** Saying where the commands ran cost about 80. `rows.txt` is 3,286.
- **`setup.py` now writes the sum of each guide file into `setup.json`,** so that a kept try says which pinning its subject was handed.

**Not mended, and why.**

- **Nothing says that a class inside a function is no item.** The reader of the sentences guessed it from "a function inside a function", and was right. The first task turns on it. To add it now would be to add a fact because a task needs it.
- **"It will show you X: 0 results" is how `ley show` prints a row that counts none.** The rows are the ledger as `ley` prints it, so the words stay, and the first lines of `rows.txt` now say what such a row means. It is a thing for Ley Lines to hear of.
- **The wrapper `bin/ast-grep` says in a comment that every call is written down, and the path of a subject's directory names its arm, its task and its variant.** So a subject can learn that it is in a test, and which arm it is in. Both are as they were in the pilot and are the same in every arm. They are not changed, and it is a limit.
- **A command of the guide, run as it stands, prints an error and "nothing found", and ends with status 0.** Each reader ran two. The guide says that `demo` is not there.
- **Both readers said that the guide comes close to the answer of their task.** Four rows put together are the answer to the fourth task, and the last sentence with two words changed is the answer to the first. That is the limit already told: the guide's author knows these five tasks. The mending adds to it, since what the readers found, they found on the tasks' code.

**The other two readers had no tool,** and each read one mended form alone. Each answered the same ten questions from the text: what is listed, of which type, and which command lists a thing. The questions were fixed before either reader was sent. The tool was then run on each of the ten, and the readers were marked against what it lists.

- **Each got all ten right.** So each form, as pinned, carries the facts to a reader that has only the text.
- **Each named readings that could go two ways,** and each took the one the tool bears out. The rule for this last read was set after the first report and before the second: mend only a sentence that is untrue, or that a reader took the wrong way. Neither report has one. So nothing was mended, and the pinning stands.
- **Left as they are, and known before the run:** "items with `export` in front of them" can be read to leave out a bare `export {...}`; "the imports" can be read to take in an export with `from`; the first sentence, read alone, says more than the second allows; and no line shows `--type` without `--items`, or `--type class` alone.
- **Each was unsure of about as many answers:** the reader of the rows of five, the reader of the sentences of four. What differed is what each doubted. The reader of the rows doubted whether one case stands for the rest: "the text does not say ... that every `var` behaves the same", and no row shows `--type class` alone. The reader of the sentences doubted whether a rule as stated is whole: its answer on a class in a `const` "rests on 'every other' being literally complete". That is one reader for each form, with no tool. It is a thing to look for in the round, and it is not a result.

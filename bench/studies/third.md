# The third study, written down

It was written on 2026-11-12, after the second study, and its author had seen that study's answers. The maintainer has not said go. Nothing here has run except a probe of ten tries, told below.

## The question

When a model has never seen a part of a tool, how little text does it take for its first command to be right?

## Why this one

The first two studies used a subject that already knew ast-grep. With no guide and no tool it passed 47 of 48 tries at the control tasks. So a guide could only correct a few wrong beliefs, and neither study could show even that. Neither says anything about a tool a model has never seen, and that is the aim.

On 2026-11-12 the maintainer saw that the same model and the same tool can ask it.

- **ast-grep has a subcommand the subject does not know.** `ast-grep outline` arrived in version 0.44. A probe of ten tries, `../runs/2026-11-12-probe-known`, supports it: no Haiku subject listed `outline` from memory, and none called it part of ast-grep when shown the name. The old names were called yes in 19 of 20 lines.
- **`outline` has an official guide of its own.** <https://github.com/ast-grep/agent-skill> holds two skills at commit `0613dc7`. One is the guide of the first two studies, `ast-grep/skills/ast-grep`. The other is `ast-grep/skills/outline/SKILL.md`: 3,436 characters, and its SHA-256 sum begins `ebd4c3a7`. The first two studies took their guide from that commit and did not look beside it.
- **The two guides do not overlap.** The ast-grep skill never has the word `outline`. The outline skill never names `ast-grep scan` or `--inline-rules`, and has neither the word `pattern` nor the word `rule`. It names `ast-grep run` once, as another tool to reach for.

So each official guide can stand as the other's placebo, and the tasks split the same way: those about `outline`, which the subject has never seen, and those it already passes. Three things follow that the first two studies lacked.

- **A place where a guide must help.** With no guide and no tool, a subject has nothing to go on for `outline`. If the bench cannot show a difference there, it cannot show one anywhere.
- **A placebo.** In the second study an arm with a guide differed from the arm with none in more than its facts: it read more, wrote more, and nine answers failed on a form that no subject with no guide got wrong. A guide of the same kind about the other half of the tool has all of that and none of the facts.
- **A ladder.** Several texts teach `outline`, of very different lengths. The pass rate at each length is the measure the aim asks for.

## What exists, and what has to be done first

**It exists.**

- The bench, the subject of the kind `bench-subject-closed`, and `compare.py` with the rule of the second study.
- The four control tasks of the set `first`.
- The two official guides, pinned as above, and the tool's own help: `ast-grep outline --help` is 7,939 characters in 0.51.1.

**It has to be done before any try, in this order.**

1. **The facts guide.** A short guide of checked facts about `outline`, at most 1,000 characters, each line checked by a program as `../guides/facts/check.py` checks the first guide. Its author has read the official outline skill and the help, and has run the tool. It is written before any task of this study exists, and its sum is written here. It is not changed afterwards.
2. **The tasks.** Six tasks about `outline`. Each names the subcommand, since a subject cannot be asked to find a thing it has never heard of. They are written by an agent that has the tool and its help, and has seen neither the facts guide nor the outline skill. It is asked for tasks that a first user would get wrong without being told so. The author of the facts guide does not edit them, except where the ceiling shows a fault in the wording.
3. **The grader.** An `outline` answer is graded on which top-level items it lists: the file, the name, the type and the line of each. The JSON output of `outline` lists the same items in every view, so the grader asks for it and does not judge the view. `selfcheck.py` covers it.
4. **A fresh reader** reads one request of each kind with its task, as `AGENTS.md` asks, and **the list of what the test takes for granted** is written. Both were skipped in the second study, and nine answers failed on form.
5. **The ceilings**, as told below.
6. **One round of the arm with no guide**, on every task. The size is fixed after it and before anything else runs.

## The subject

One Haiku model, as a subject of the kind `bench-subject-closed`: it can read and write files and can run nothing. One task for one subject. It gets `task.md` and the files of its arm, and writes one command.

## The arms

| arm | what the subject is given besides the task | characters | on the `outline` tasks | on the control tasks |
|---|---|---|---|---|
| none | nothing | 0 | the floor | the baseline |
| other skill | the official ast-grep skill, its two files | 22,196 | the placebo | not run |
| outline skill | the official outline skill | 3,436 | teaches | the placebo |
| help | the text of `ast-grep outline --help` | 7,939 | teaches | not run |
| facts | the checked facts | at most 1,000 | teaches | the placebo |

The arm "other skill" is not run on the control tasks: the second study did that, 45 of 48 against 47 of 48.

## What is measured

**Whether the answer passes**, as in the second study: the command in `answer.txt` is graded on what it lists or matches, as it was written. The rule is the second study's, unchanged: two arms are set try against try, the size that matters is a quarter of the pairs, and the answer is "shown", "no difference that large" or "cannot tell".

**The comparisons, fixed here.** Each is read once, when every try is kept.

On the `outline` tasks:

1. **Outline skill against none.** The place where a guide must help.
2. **Other skill against none.** The placebo. If a long guide about the wrong half of the tool moves the pass rate, the difference in 1 is not all teaching.
3. **Facts against none.**
4. **Facts against outline skill.** The question about spend.
5. **Help against outline skill.** What the tool says of itself, against what its makers wrote for a model.

On the control tasks:

6. **Outline skill against none**, and **facts against none.** A guide about one half of the tool should not harm the other half.

**Each task by itself.** The second study summed over tasks that pulled different ways. Here each `outline` task's passes are given in every arm, and comparisons 3 and 4 are also made on each task alone, by the same rule. That is twelve more questions, and a "shown" among them is told as one of twelve.

**Beside it,** as in the second study: the kind of each failure, the word each subject gives, the output tokens of each try, and the characters of guide. Every answer is read before a number is explained, the passing ones too.

## The ceilings and the first round

The stronger model does each task once in each arm that the Haiku model will do it in, as the same kind of subject. It did not know `outline` either: before it ran the tool it wrote that `ast-grep outline` would be an error. So its failure with no guide is expected, and says the task cannot be guessed.

- A task the ceiling passes in at least one arm with a guide goes in.
- A task the ceiling fails in every arm with a guide is read first. If the fault is in its wording or its expected items, it is mended and its ceilings run again. If not, it is taken out before the run.

Then the Haiku model does one round of the arm with none on every task. A control task that it does not nearly always pass, and an `outline` task that it passes more than one time in four with nothing, are told to the maintainer before the size is fixed: such a task does not sit on the side of the split it was written for.

## What each outcome changes

- **1 is not shown.** The bench cannot show teaching where teaching must happen, or the official skill does not teach. The answers say which. Nothing else in this study is read as a result.
- **1 is shown, and 2 is no difference that large.** The bench can show a guide's worth, and a guide's bulk alone does not make it. This is what the rest stands on.
- **2 is shown, either way.** Bulk alone moves the pass rate. Every comparison against none, in this study and the second, has that in it.
- **3 is shown, and 4 is no difference that large.** A guide of at most 1,000 characters did what one of 3,436 did, on a thing the subject had never seen. That is the first support for the claim about spend. The guide can be written as rows that `ley` checks today: what `outline` does wrongly is to stay silent, and a count holds that.
- **4 is shown for the outline skill.** The skill holds something the facts lack. It is found by reading, task by task.
- **4 is shown for the facts.** Fewer characters did more. It is read task by task before it is believed.
- **6 is shown, as harm.** It is reported beside any gain.
- **Cannot tell**, for any of them. It is said so, and no tries are added.

## Its size

It is not fixed yet. It is fixed after the first round of the arm with none, and before any other try.

The rule was tried on made-up subjects, each try passing by chance at a rate that is given, 200 times for each line, with 2,000 resamplings where the rule uses 20,000.

| the two rates | 48 pairs: shown | 48 pairs: no difference that large | 72 pairs: shown | 72 pairs: no difference that large |
|---|---|---|---|---|
| 70% against 5% | 100 in 100 | 0 | 100 in 100 | 0 |
| 35% against 5% | 78 in 100 | 0 | 78 in 100 | 0 |
| 85% against 60% | 54 in 100 | 2 in 100 | 49 in 100 | 3 in 100 |
| 85% against 85% | 0 | 83 in 100 | 0 | 98 in 100 |
| 70% against 70% | 0 | 53 in 100 | 0 | 80 in 100 |
| 5% against 5% | 0 | 98 in 100 | 0 | 100 in 100 |

A guide that teaches is shown against a floor at either size. The question about spend is the hard one: two guides that both pass 70 times in 100 are called alike only about half the time with 48 pairs. And a true difference of exactly a quarter is "shown" only half the time at either size, which is what a size that matters means.

**What is proposed.** Six `outline` tasks and four control tasks, in four variants. Two rounds give 48 pairs on the `outline` tasks, and three give 72.

| | tries of the Haiku model |
|---|---|
| `outline` tasks, five arms, two rounds | 240 |
| `outline` tasks, five arms, three rounds | 360 |
| control tasks, three arms, two rounds | 96 |
| control tasks, three arms, three rounds | 144 |

**What it costs.** A try of this kind wrote about 4,300 output tokens in the second study. So two rounds are about 1.4 million output tokens and three are about 2.2 million. That is a guess from the same kind of try on other tasks, and the first round of the arm with none, 40 tries, will say what a try costs here. The ceilings are 42 tries of the stronger model. In the second study such a try wrote about 24,500 output tokens, so they are about a million.

## What it cannot show

- **Anything about a tool the subject has never seen at all.** The subject knows ast-grep: its flags for paths, for languages and for JSON, and the way its help reads. `outline` is a new part of a known tool. That is nearer to a tool that changed after a model was trained than to a new one.
- **Whether the subject would find `outline` by itself.** The task names it.
- **What a guide is worth with the tool in hand.** A subject with the tool can read the help. That study is still left for later.
- **Anything about another model, another tool or another harness.**
- **That the facts guide is the smallest that works.** It is one guide of one length. A ladder with more steps would say where the pass rate falls.
- The facts guide's author has read the official skill. The facts are checked against the tool, and they are not independent of the skill.

## Left for later

- The same tasks with the tool in hand, where a subject with no guide can read the help, and the cost of doing so is counted.
- A ladder below the facts guide: one worked command and nothing else.
- The five new flags that the probe also found unknown: `run --kind`, `--files-with-matches`, `scan --max-results`, `scan --min-severity` and `--custom-languages`. All five subjects of the probe said that `run --kind` does not exist.

## After the go, and before any task

Written on 2026-11-12. Everything above stands as it was, but for the ceilings.

- **The maintainer said go that day**, to everything under "It has to be done before any try". The size of the study is still to be fixed, after the first round of the arm with none.
- **The ceilings are 24 tries, not 42.** The maintainer agreed to it with the go. The stronger model does each of the six `outline` tasks once in the arms none, outline skill, help and facts. It does not run in the arm "other skill", and not on the control tasks. So this study has no ceiling for a placebo arm, and none of its own for the control tasks: for those it leans on the second study's, where the stronger model passed all four with no guide.
- **The facts guide is written, and no task exists yet.** It is `../guides/outline/facts.md`: 925 characters, and its SHA-256 sum begins `460bb561`. `../guides/outline/check.py` runs 17 commands on a small file and compares what `outline` lists with what the guide says. Its author had read the official outline skill and the help, and had run the tool on two small files of their own. It is not changed from here on.
- **The two sets are kept apart.** The six `outline` tasks are a set of their own, `../sets/outline`, with code of their own. The four control tasks stay in the set `first`, with the code the second study used. So a round is two runs, one on each set, and `compare.py` reads them apart.

## After the tasks were written, and before any try

Written on 2026-11-12.

- **The tasks exist.** A fresh agent wrote `../sets/outline` that day: six tasks, seven files of code, 57 expected items, and the build passes in all four variants. Its note says what each task turns on and which first command fails. The harness's record of the agent was checked by a program for every forbidden place and for the words `skill` and `facts.md`. It opened the nine files its note lists and no other, and no call of its shell names a forbidden place.
- **One line of that note was changed, and no task.** The agent had written the name of its own model there. This repository keeps such names out, so the line now says "the stronger model". The name stands in the history of one commit, `9e1a6c6`.
- **The facts guide is wrong in one line, and it is left so.** Its third fact says that `const f = () => 1` is a `function` and that any other `const` is a `constant`. The tasks' author found, and the tool confirms, that this holds only for a `const` that is not exported: `export const f = () => 1` is a `constant`. `check.py` passed because its small file has no exported arrow function. The guide was pinned before the tasks existed, and its author has now read them, so it stays as it is. What the wrong line costs the facts arm is read from the answers, on T04 and T06 above all.
- **A checked fact is not a true one.** A check shows that a line holds on the code it was run on. The line above was written wider than its check.
- **Four of the six tasks turn on no name.** T01, T04, T05 and T06 differ between variants only in the examples of their wording, and each has one reference answer for all four. So their tries in one arm are tries at nearly one string, as T05 was in the second study.
- **Neither official text names the types `constant` and `variable`.** The outline skill and the help both show `--type` with other types. T04's reference answer needs those two names, and the tool refuses `const` and `let`. T04 can also be answered with `--match` on the first line. This is told here because it was seen before any try, and it was not a reason to change a task.

## After the ceilings, and before any try of the Haiku model

Written on 2026-11-12. The run is `../runs/2026-11-12-third-ceiling`, and its note has every answer's verdict.

- **A fresh reader read one request of each kind, and the list of what the test takes for granted is written.** Both are in the ceiling's note. For what the readers found, the request now tells a subject that the code is not there, and the grader no longer refuses three things that a shell runs the same.
- **With nothing, the stronger model passed none of the six `outline` tasks.** Every answer was refused for a flag that `outline` does not have. So the tasks cannot be guessed, by the stronger of the two models.
- **With each of the three guides it passed five of six.**
- **T05 is taken out.** It failed in every arm with a guide, on one item, for a thing about `outline` that no guide holds. Its wording and its expected items are right, so by the rule above it leaves the study. Nothing was written in its place.
- **So the study has five `outline` tasks.** A round is 100 tries on them and 48 on the control tasks. Two rounds give 40 pairs on the `outline` tasks, where a quarter is 10. Three give 60, where a quarter is 15. The table under "Its size" was made for 48 and 72 pairs, and was not made again.
- **"Each task by itself" is ten questions and not twelve.**
- **A failure in the arm with none, on an `outline` task, is sorted as the test's when the subject guessed at a flag.** That arm withholds what the task needs, by design. The sorting says so, and the score of that arm is read with it.

## After the first round of the arm with none

Written on 2026-11-12. The runs are `../runs/2026-11-12-third-a` and `../runs/2026-11-12-third-a-control`, and their notes have every answer's verdict.

| the arm with none, round one | tries passed | output tokens | for one try |
|---|---|---|---|
| the five `outline` tasks | 0 of 20 | 45,624 | 2,281 |
| the four control tasks | 15 of 16 | 40,384 | 2,524 |

- **The split holds on both sides.** No `outline` task passed once with nothing: every command was refused for a flag that `outline` does not have. Every control task nearly always passed. So no task is told to the maintainer as out of place.
- **These 36 tries are the arm with none of round one.** They are not run again.
- **A try costs about half the guess.** The guess was 4,300 output tokens, from the second study. With nothing, a try here wrote about 2,400. An arm with a guide will write more: in the second study such arms wrote 16 and 26 parts in 100 more.

**The rule, tried again at the sizes the study now has.** Made-up subjects, 200 times for each line, with 2,000 resamplings where the rule uses 20,000.

| the two rates | 40 pairs: shown | 40 pairs: no difference that large | 60 pairs: shown | 60 pairs: no difference that large |
|---|---|---|---|---|
| 70% against 0% | 100 in 100 | 0 | 100 in 100 | 0 |
| 35% against 0% | 94 in 100 | 0 | 96 in 100 | 0 |
| 85% against 60% | 58 in 100 | 4 in 100 | 52 in 100 | 2 in 100 |
| 85% against 85% | 0 | 66 in 100 | 0 | 94 in 100 |
| 70% against 70% | 2 in 100 | 33 in 100 | 0 | 66 in 100 |

Either size shows a guide against the floor. The question about spend is the one that needs the third round: two guides that both pass 70 times in 100 are called alike one time in three with 40 pairs, and two times in three with 60.

**What is left to run, and what it may cost.** The size is the maintainer's to fix.

| | tries still to run | output tokens of the Haiku model, a guess |
|---|---|---|
| two rounds in all | 260 | about 760,000 |
| three rounds in all | 408 | about 1,180,000 |

The guess takes 2,400 for a try with nothing and 3,000 for a try with a guide. The second number is not measured. The first group of tries with a guide will say what it is, and it is told before the rest is sent.

**What the work before the study cost.** The ceilings wrote 420,678 output tokens of the stronger model, and this first round 86,008 of the Haiku model. The agent that wrote the tasks and the four fresh readers were the stronger model, and what they wrote is not counted here.

## After the planning session read it, and before any try with a guide

Written on 2026-11-12. The planning session read this repository at `3ff81fe` and sent the maintainer five things to settle. Each was checked here by running its commands, and each holds. What follows changes the study. No subject with a guide has run.

**1. The spend question gets a guard, and the ladder gets two steps that can fail.**

The stronger model passed the same five tasks with each of the three texts, and 13 of its 15 passing answers go one road: `--match` on a line of text, with `--items` where the task needs it. All three texts hold what that road needs. If the Haiku model goes the same road, comparison 4 reads "no difference that large" whatever the lengths are.

- **The guard.** If both arms of comparison 4 pass nine tries in ten or more, the study says that these tasks are easy once the flags are known. It says nothing about spend. This takes the place of the outcome above that calls such a result "the first support for the claim about spend".
- **Two more arms, on the `outline` tasks only.** Each text is cut from the tool by a command. It has no author, so it cannot be fitted to the tasks.

| arm | the file | how it is made | characters | its SHA-256 sum begins |
|---|---|---|---|---|
| names | `flags.txt` | `ast-grep outline -h`, the lines that name a flag, with the spaces before them taken off | 337 | `9e9a1e2c` |
| short-help | `short-help.txt` | `ast-grep outline -h` | 2,010 | `dfb78b50` |

So the ladder has five steps: the names of the flags (337), the facts (925), the short help (2,010), the skill (3,436) and the long help (7,939). The names give no value for any flag. The short help gives the values of `--items` and of `--view`, and says nothing of what a directory hides or of what `--match` reads.

- **What is expected, task by task, written before any try.**

| task | with the names | with the short help |
|---|---|---|
| T01, T06 | passes only if the subject guesses a value for `--items` | passes only if the subject sets `--items structure` or `all`, with no word that the default hides anything |
| T03 | passes only if the subject guesses `--items imports` | can pass: the value is given |
| T02, T04 | can pass: the default lists what they ask for | can pass |

**2. The task is the unit, and there are five.**

- **The result of the study is the table of passes for each task in each arm**, with the rule on each task by itself. The rule over all five tasks stands beside it, and is not read as a finding about tasks in general.
- **A round adds tries and no task.** Tries at one task rise and fall together. `compare.py` now gives each comparison's difference task by task, and draws the tasks again in place of the pairs. In the second study, facts against none was +12 of 72: drawn again by pair, +2 to +22, and drawn again by task, -4 to +30.
- **The table of made-up subjects above says more than it can.** It takes each try as its own draw at one rate. So it does not say how often five tasks would give the same answer as five others.
- **Three of the five tasks have one reference answer for all four variants**: T01, T04 and T06. Their wordings differ only in the names of their examples.
- **The reason for a third round is a task by itself.** Twelve tries in an arm say more of one task than eight do. The question about spend is not the reason.
- `compare.py --each-task` prints each task by itself. "Each task by itself" above named two comparisons, 3 and 4. It now means every pair of arms on that task, and what is read first is the table.

**3. What is known is not run again.**

- **An arm that passes no try in round one is at the floor, and is not run in later rounds.** An arm that passes any try runs in every round.
- **The arm with none on the `outline` tasks is such an arm.** It is 0 of 20, and each answer was refused for a flag the subcommand does not have. The arm "other skill" is run for one round, and again only if it passes a try.
- **A comparison against an arm at the floor is read on round one alone**: 20 pairs, where a quarter is 5.
- On the control tasks every arm runs in every round.

**4. Two lines of the facts guide are wider than their checks.**

- The third fact is told above. The fourth says that `--match` keeps an item "if its name or its first line fits". The tool reads the line that holds the item's name, which is the first line only when the name stands on it. `check.py` passed because every item of its small file has its name on its first line.
- The help says "first source lines", and the skill says "name or signature". Neither says what the tool does with an item written over several lines. Only a run shows it.
- The guide stays as it is, for the reason given above.

**5. One road in the ceiling is one model's habit.**

The same model wrote the tasks, the facts guide and the ceiling's answers, and read the requests. Each was a fresh agent, which keeps what one has read from the next. It does not make five readers into five minds. The Haiku model may go another road, and nothing here leans on the ceiling for what that road will be.

**What is left to run, with these changes.** The size is still the maintainer's to fix.

| | tries still to run | output tokens of the Haiku model, a guess |
|---|---|---|
| two rounds in all | 300 | about 890,000 |
| three rounds in all | 448 | about 1,330,000 |

The counts take the arms "none" and "other skill" to stay at the floor on the `outline` tasks, and every other arm to pass a try. The guess takes 2,500 for a try with nothing and 3,000 for a try with a guide, and the second number is still not measured.

**Not settled here: ceilings for the two new arms.** The five tasks are in the study already, so a ceiling would not decide that. It would say whether the stronger model can do a task from the names alone, which is what a failure of the Haiku model there would be read against. It is ten tries of the stronger model, about 175,000 output tokens at what a ceiling try cost here.

**The model's name in the history of `9e1a6c6`** is left there. A forced push would change the hash of every commit from that one on, and what this note says was written before what rests on those hashes and their order.

## The size, fixed on 2026-11-12

- **The maintainer fixed three rounds.** Round one is the 36 tries already kept and 152 more. Rounds two and three are 148 each, less any arm that round one leaves at the floor.
- **The two new arms get ceilings**: ten tries of the stronger model, told in the ceiling's note.
- **After round one, one thing is read for each arm: whether it passed any try.** That decides which arms run again. After the first group of tries with a guide, their output tokens are counted, to say what the rest will cost. Nothing else is scored until every round is kept.
- **The rounds.** Round one is `../runs/2026-11-12-third-a` and `-a-control`, round two `-b` and `-b-control`, round three `-c` and `-c-control`.
- **How the subjects start.** A group of 15 is sent at once, and the session waits for all 15 before it sends the next.

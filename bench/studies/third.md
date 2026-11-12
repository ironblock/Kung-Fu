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

## After the ceilings of the two new arms

Written on 2026-11-12, before any try of the Haiku model with a guide. The ceiling's note has every answer.

- **With the names of the flags the stronger model passed none of five. With the short help it passed four.** So the ladder now has a step that fails for the stronger of the two models.
- **How a failure is sorted on a ladder.** It is the test's when the arm's text does not hold what the answer needs: the step was built to find that. It is the subject's when the text holds it and the subject got it wrong. The two counts are read for each step: the first says where the text runs out, and the second says where the model does.
- **One expectation above was wrong for the stronger model.** T02 and T04 "can pass" with the names, since the default lists what they ask for. Both failed: the subject wrote `--items exported`, which the flag does not take. The expectation stands as it was written, and is set against the Haiku model's answers when they are read.

## What came, 2026-11-12

The three rounds are kept: 484 tries of the Haiku model, in six runs. Every answer was read with every line the tool said, the passing ones too, before `compare.py` ran. Each of the 149 answers that did not pass has a line beside it, in `whose.txt`, that says whose failure it is and why. Then `compare.py` ran on three things: round one alone, for the comparisons against an arm at the floor; the three rounds of the `outline` tasks; and the three rounds of the control tasks.

**The result is this table: tries that passed, for each task in each arm.** Each count is of 12. The arms "none" and "other skill" stayed at the floor in round one and ran that round only, so theirs are of 4.

| | none | other skill | names | facts | short help | outline skill | help |
|---|---|---|---|---|---|---|---|
| characters of text | 0 | 22,196 | 337 | 925 | 2,010 | 3,436 | 7,939 |
| T01, classes, exported or not | 0 of 4 | 0 of 4 | 0 | 12 | 11 | 12 | 12 |
| T02, an exported function by its name | 0 of 4 | 0 of 4 | 10 | 12 | 12 | 12 | 12 |
| T03, imports from one path | 0 of 4 | 0 of 4 | 0 | 12 | 11 | 9 | 11 |
| T04, exported `const` and `let` | 0 of 4 | 0 of 4 | 0 | 12 | 1 | 11 | 8 |
| T06, function declarations, exported or not | 0 of 4 | 0 of 4 | 0 | 12 | 0 | 1 | 1 |
| all five | 0 of 20 | 0 of 20 | 10 of 60 | 60 of 60 | 35 of 60 | 45 of 60 | 44 of 60 |
| round by round | 0 | 0 | 3, 3, 4 | 20, 20, 20 | 12, 12, 11 | 14, 15, 16 | 15, 14, 15 |

On the control tasks each of the three arms passed 47 of 48.

**The comparisons fixed beforehand, by the rule.** A comparison against an arm at the floor is read on round one alone, as was fixed: 20 pairs, where a quarter is 5.

| | pairs | difference | only the first passed | only the second | sign test | with resampling | task by task | the tasks drawn again | the rule says |
|---|---|---|---|---|---|---|---|---|---|
| 1. outline skill against none | 20 | +14 | 14 | 0 | 0.00 | +10 to +18 | +4, +4, +2, +4, 0 | +6 to +20 | shown |
| 2. other skill against none | 20 | 0 | 0 | 0 | 1.00 | 0 to 0 | 0, 0, 0, 0, 0 | 0 to 0 | no difference as large as 5 of 20 |
| 3. facts against none | 20 | +20 | 20 | 0 | 0.00 | +20 to +20 | +4, +4, +4, +4, +4 | +20 to +20 | shown |
| 4. facts against outline skill | 60 | +15 | 15 | 0 | 0.00 | +9 to +22 | 0, 0, +3, +1, +11 | +1 to +36 | shown |
| 5. help against outline skill | 60 | -1 | 5 | 6 | 1.00 | -8 to +5 | 0, 0, +2, -3, 0 | -9 to +6 | no difference as large as 15 of 60 |
| 6. control: outline skill against none | 48 | 0 | 1 | 1 | 1.00 | -3 to +3 | 0, 0, 0, 0 | 0 to 0 | no difference as large as 12 of 48 |
| 6. control: facts against none | 48 | 0 | 1 | 1 | 1.00 | -3 to +3 | 0, 0, 0, 0 | 0 to 0 | no difference as large as 12 of 48 |

Which round of one arm is set against which round of another is an accident of the order they ran in. For comparisons 4 and 6 it cannot matter: the facts arm passed every try, and the three control failures are in three different variants, so no pairing changes a count. For comparison 5 it can. Paired in 300 other ways, it gives the same answer 300 times of 300, counted with 2,000 resamplings where the rule uses 20,000.

Of the outcomes written above:

- **1 is shown, and 2 is no difference that large.** With the official outline skill 14 of 20 tries passed, and with nothing none did. This is the first time the bench has shown a guide to teach. The official guide to the other half of the tool, 22,196 characters, taught nothing here: 0 of 20.
- **What 2 can and cannot say.** Both of its arms passed nothing, and a rate of nothing cannot fall. So it says that this bulk did not teach, of one text, and it cannot say whether bulk harms. The placebo did change what the subjects wrote: all 20 of its answers have `--inline-rules`, the flag its guide teaches, and with nothing 12 of 20 did.
- **3 is shown,** on round one: with the 925 characters of facts 20 of 20 passed, and with nothing none. Over the three rounds the facts arm passed 60 of 60. That is a count: the rule was asked about round one.
- **4 is shown for the facts. The guard does not apply:** the outline skill passed 45 of 60, which is under nine in ten. The outcome written for this case is: "Fewer characters did more. It is read task by task before it is believed." It is read so below, and what it shows is narrower than those words.
- **5 is no difference that large.** The tool's own long help and the skill its makers wrote for a model passed 44 and 45 of 60.
- **6 is not shown.** On the control tasks each arm passed 47 of 48, and by the rule neither guide about `outline` differs from nothing by as much as 12 of 48. With resampling the difference lies between -3 and +3.

### Comparison 4, task by task

| task | facts | outline skill | difference, of 12 pairs | the rule on this task by itself |
|---|---|---|---|---|
| T01 | 12 | 12 | 0 | no difference as large as 3 of 12 |
| T02 | 12 | 12 | 0 | no difference as large as 3 of 12 |
| T03 | 12 | 9 | +3 | cannot tell: sign test 0.25 |
| T04 | 12 | 11 | +1 | cannot tell |
| T06 | 12 | 1 | +11 | shown |

- **It is one task.** T06 carries +11 of the +15. With T06 left out of both arms, counted after the scores were seen, the difference is +4 of 48 and the rule says "no difference as large as 12 of 48". With the five tasks drawn again, the difference lies between +1 and +36.
- **It sits on the line.** The difference is 15 and the size fixed beforehand was 15. One more passing try with the skill and the rule says "cannot tell".
- **What T06 turns on is one thing the tool does.** `ast-grep outline --items structure --type function src` lists every function declaration, and four items more: arrow functions stored in a `const` or a `let` that is not exported, which the tool calls a `function`. Three of the four are a `const` and one is a `let`. The task does not count those.
- **The facts guide says that thing, and the skill does not.** The guide's third line: "`const f = () => 1` is a `function`." The skill: "to keep only functions, classes, or another symbol kind, use `--type`." Eleven of the twelve answers with the skill are that one command, letter for letter. All twelve answers with the facts add a `--match` on the word `function`.
- **The long help does not say it either, and passed T06 once in twelve.** So did the skill.
- **The stronger model passed T06 with the skill, and with the help, once each,** by a `--match` on the line. So a right answer can be written from the skill's text, and by the project's rule the 22 failures of the Haiku model on T06 with those two texts are its own. What the facts guide did on T06 is to say the trap outright, and with it the Haiku model kept out of the trap in twelve tries of twelve. With the short help the stronger model wrote `--items structure --type function` and nothing more, and failed as the Haiku model did.
- **No subject's reasoning is kept.** Why the Haiku model wrote the one command and not the other is not known. Five of the twelve hand-backs of the facts arm on T06 give a reason for their `--match`: that `--type function` alone would also keep `const f = () => 1`. Three of the five name the guide's third line for it. The other seven give no reason.
- **So "fewer characters did more" is not what this shows.** One text says a thing about the tool that the other leaves out, and one task of five turns on it. On the other four tasks no difference between the two is shown.
- **The "shown" on T06 is one of ten.** Comparisons 3 and 4 were each to be made on each task by itself: ten questions. Five of them, comparison 3 on round one, cannot be called "shown" by the rule, as the next line tells.
- **Comparison 3 on a task by itself.** On round one alone a task has four pairs, and the rule cannot call four pairs "shown": the sign test gives 0.12 at best. The table says it instead: with nothing 0 of 4 on every task, and with the facts 4 of 4 on every task.

`compare.py --each-task` printed every pair of the five arms that ran three rounds, on every task: 50 lines. Eighteen of them say "shown", and none is told as a finding beyond the table of passes.

| task | pairs of arms that the rule calls "shown" on this task by itself, the first passing more |
|---|---|
| T01 | facts, short help, outline skill and help, each against names |
| T02 | none |
| T03 | facts, short help, outline skill and help, each against names |
| T04 | facts, outline skill and help, each against names and against short help |
| T06 | facts against names, short help, outline skill and help |

Three of the five tasks have one reference answer for all four variants, T01, T04 and T06: their wordings differ only in the names of their examples. So twelve tries at one of them in one arm are tries at nearly one string. On T06 with the skill, eleven of the twelve answers are one string, and the rule counts them as eleven pairs.

### The ladder

**Among the four texts that this study's author did not write, more text passed more tries, and then no more.** In order of length: 10 of 60 with the names, 35 with the short help, 45 with the skill and 44 with the help. By the rule, the names are shown to pass fewer than each of the other three. The skill against the short help, +10 of 60, and the help against the short help, +9, are both "cannot tell". **The facts guide is out of that order:** 60 of 60 with 925 characters, the shortest text but one. Its author wrote it for this study, and the limits below say what that takes from it.

**What the failed answers broke on.** The count is of failed tries, each put in the first row it breaks on. Nineteen of the 29 in the second row would break on a lower row as well: with `--items imports` added, all seven such answers on T03 with the names still miss the import written over several lines, and with `--items structure` added, the nine on T06 with the names and the three with the short help still list the four extra items.

| what the answer broke on | names | short help | outline skill | help | facts |
|---|---|---|---|---|---|
| a value for `--items` or `--type` that the tool refused | 19 | 0 | 0 | 0 | 0 |
| `--items` left out, so the directory hid the items that are not exported, or the imports | 25 | 4 | 0 | 0 | 0 |
| the type `variable` taken to hold a `const` too (T04) | 6 | 11 | 1 | 4 | 0 |
| the type `function` taken to hold declarations only (T06) | 0 | 9 | 11 | 11 | 0 |
| one regex over an import written on several lines (T03) | 0 | 1 | 3 | 1 | 0 |
| all | 50 | 25 | 15 | 16 | 0 |

- **A text has a failure in a row only where it does not say that row's thing.** The names give no value. The short help gives the values of `--items` and does not say what `auto` lists for a directory. Only the facts guide names the types `constant` and `variable`, and only it says what the tool calls a function.
- **With any text that gives the values, no command was refused.** All 56 failures of the three longer texts ran and listed the wrong items. With the names alone, 19 of 50 were refused. The tool prints a refusal as an error. It prints a wrong list as it prints a right one, and the wrong list for T06 has `detour` and `onChange` in it, which the task names as not counted. Whether a subject with the tool would see that was not measured: no subject had the tool.
- **On T04 the arms went different roads, and three of them have the same silence.** The short help, the skill and the help all leave out the names of the types. With the short help eleven of twelve answers have `--type variable`, a real type that holds less than the subject took it to. With the help four of twelve have it, and with the skill one. The others with those two texts have a `--match` on `const` and `let` and no `--type`: eleven with the skill, eight with the help. All twelve answers with the facts have such a `--match`, nine of them with the word `export` in it. Why the same silence led to different commands is not known.

**What was expected of the two new arms, and what came.**

| | expected, before any try | came |
|---|---|---|
| names, T01 and T06 | passes only by a guessed value for `--items` | 0 of 12 on each. No answer has a right value: five guessed `class` or `function` for it, eighteen left the flag out and listed too little, and one left it out and was refused for a type it guessed. The stronger model's one try failed on each as well. |
| names, T03 | passes only by guessing `--items imports` | 0 of 12. Three wrote `--items import`, one letter short, and were refused. The stronger model failed too. |
| names, T02 | can pass | 10 of 12. The stronger model's one try failed here: it wrote `--items exported`. |
| names, T04 | can pass: the default lists what it asks for | 0 of 12. **The expectation was wrong,** as it was for the stronger model. No subject left the default alone: each added a type or a value that the names do not give. |
| short help, T02 and T03 | can pass | 12 and 11 of 12 |
| short help, T04 | can pass | 1 of 12. **Wrong again, and the same way:** eleven wrote `--type variable`. |
| short help, T01 | passes only if the subject sets `--items structure` or `all` unprompted | 11 of 12: eleven set `--items all`. |
| short help, T06 | the same | 0 of 12. Nine set `--items all`, and all nine broke on the second thing T06 turns on, which the expectation did not name. |

### Beside it

**What the facts guide's wrong lines cost: no pass in 60 tries.** That is what these five tasks could show of it, and no more. The check of this note found one more wrong thing in the guide, and it is told here.

- **The third line is wrong in two places.** It says "`const f = () => 1` is a `function`", and an exported one is a `constant`. It says "a `let` is a `variable`", and a `let` that holds an arrow function and is not exported is a `function`. The second was not known when the study was written down. A second reader found it after the tries, and the tool confirms it.
- **On T04.** Five of the twelve facts answers add `function` to their types, as in `--type constant,variable,function`, which is where the third line leads. Three of the five hand-backs say that this is why, and two give no reason. All five pass, since each also has a `--match` on `const` and `let`. No facts answer is the reference answer, `--type variable,constant` by itself: by the third line it would miss the exported arrow functions.
- **On T06.** The four extra items are three `const` and one `let`, none of them exported. The guide is right about the three and wrong about the one. Every facts answer has a `--match` on the word `function`, which keeps all four out. What the guide says wrongly of exported arrow functions does not bear on this task: the tool calls those `constant`, so `--type function` leaves them out by itself.
- **The fourth line**, on T03. It says `--match` reads an item's "name or its first line". The tool reads the name and the line the name stands on, and for an item that is not exported it reads that line without its `const` or `let`. All twelve facts answers match on the path alone, and the path is the name of an import, so they pass by the half of the line that is true. No facts answer leaned on the first line of an item written over several lines. So the wrong half was never put to the test.
- **The long help is wrong in the same place.** It says the regex is matched against "first source lines". For the import written over several lines, the line that is read is its last.

**Whose each failure is.** Of the 146 failures on the `outline` tasks, 100 are sorted as the test's, 32 as the subject's and 14 as not known. Of the three on the control tasks, two are the subject's and one is not known.

| arm | failures | the test's | the subject's | not known |
|---|---|---|---|---|
| none | 20 | 20 | 0 | 0 |
| other skill | 20 | 20 | 0 | 0 |
| names | 50 | 48 | 0 | 2 |
| short help | 25 | 12 | 1 | 12 |
| outline skill | 15 | 0 | 15 | 0 |
| help | 16 | 0 | 16 | 0 |

- **The rule that sorts them is the project's fifth step, which was written before this study.** It asks whether a right answer can be written from what the subject was given, and says how to show it: write one, or run a stronger subject with exactly that. The ladder's rule says "the test's when the arm's text does not hold what the answer needs". Read with the fifth step, that is what a right answer needs.
- **The test's, 100.** No try passed the task with that text. That is every task with nothing and with the other skill, four of the five tasks with the names, and T06 with the short help. The stronger model failed each of those too, where it was run: it was not run with the other skill. This is where the text runs out.
- **The subject's, 32.** A right answer was written from the same text, by other tries of the Haiku model and by the stronger model's one try, none of them with a type or a value of `--items` that the text does not give. Nineteen of those 59 passing answers do name a language, such as `-l js`, which no text of an arm gives a value for, and each of the seven rows below that are sorted as the subject's has a pass with none. So the subject had what a right answer needs. Of the 32, 22 are on T06 with the skill or the help. This is where the model runs out.
- **Not known, 14.** A right answer was written from the same text, but every one of them names a type that the text does not give: a guess that came out right. Here the fifth step's two questions part. Not everything a right answer needs is in the text, and yet one was written from it.

| arm and task | failures | sorted as | tries of the Haiku model that passed with the same text, of 12 | the stronger model's one try |
|---|---|---|---|---|
| names, T02 | 2 | not known | 10, each naming the type `function`, which the names do not give | failed |
| short help, T01 | 1 | not known | 11, each naming the type `class`, which the short help does not give | passed, naming it too |
| short help, T04 | 11 | not known | 1, naming the type `constant`, which the short help does not give | passed, naming it too |
| short help, T03 | 1 | the subject's | 11 | passed |
| outline skill, T03 | 3 | the subject's | 9 | passed |
| outline skill, T04 | 1 | the subject's | 11 | passed |
| outline skill, T06 | 11 | the subject's | 1 | passed |
| help, T03 | 1 | the subject's | 11 | passed |
| help, T04 | 4 | the subject's | 8 | passed |
| help, T06 | 11 | the subject's | 1 | passed |

- **They were sorted three times, and this is the third.** The first sorting called all 146 the test's, by another reading of the ladder's rule: the test's when the answer broke on a thing that the arm's text does not say. A second reader sorted all 149 without seeing the first sorting, chose that reading too, and came to the same labels. In its report it put its trust in the reading at about six in ten.
- **A third reader, who checked this note, showed why that reading will not do.** It can hardly ever say "the subject's", since a wrong value is nearly always a thing the text does not say. A count of none from it says little. And it sets aside the fifth step, which is the project's own test. The second sorting here called the 46 failures in the table above not known. The third reader held that this hid what the records settle, and it was right: for 32 of them the showing that the fifth step asks for is in the records.
- **Other readings give other counts.** The second reader named one between: the subject's only where a right answer follows from what the text states, with nothing guessed about what a flag reads. Of the texts that have failures, only the long help names the source line as a thing `--match` is read against, so that gives 15, the help arm's failures on T04 and T06. Counting a right guess as a showing gives 46. And by one more reading of the second reader's, a listed value of `--items` counts as the text holding it, which would move the three answers on T06 with the short help that left the flag out. Those three have a second fault, and no try passed T06 with that text, so they stay the test's here.
- **The facts arm has no failure to sort,** by any reading.
- **On the control tasks** one try failed in each arm, all three on T08. Two are the subject's: a rule with no `rule:`, and a pattern that does not parse as one node. The third is a quote that ends the shell's quoting. It was first sorted as the subject's and is now not known: the subject's hand-back says it meant an escape at that place, and what the subject sent before the harness read its call is not kept.

**The word each subject gave**, on the `outline` tasks.

| | sure | unsure | guess |
|---|---|---|---|
| none, of 20 | 0 | 3, of which 0 passed | 17, of which 0 passed |
| other skill, of 20 | 0 | 6, of which 0 passed | 14, of which 0 passed |
| names, of 60 | 0 | 1, of which 0 passed | 59, of which 10 passed |
| facts, of 60 | 8, of which 8 passed | 48, of which 48 passed | 4, of which 4 passed |
| short help, of 60 | 0 | 24, of which 20 passed | 36, of which 15 passed |
| outline skill, of 60 | 0 | 44, of which 31 passed | 16, of which 14 passed |
| help, of 60 | 0 | 42, of which 35 passed | 18, of which 9 passed |

- Only the facts arm ever said "sure", and it was right each time.
- With the skill, an answer called a guess passed more often than one called unsure. The eleven wrong answers on T06 were all called unsure.

**Output tokens for one try**, on the `outline` tasks: 1,573 with the names, 1,942 with the facts, 1,479 with the short help, 1,543 with the skill, 2,228 with the help, 2,281 with nothing and 2,817 with the other skill. The facts arm wrote a quarter more than the skill arm. Every subject read about 3,720 tokens before its request, in every arm: the text of its arm is read after that, and the bench does not count it in tokens. The spend of an arm is told here in characters.

**On the control tasks** a try wrote 2,652 output tokens with nothing, 2,859 with the outline skill and 3,088 with the facts guide. Nearly every subject there called its answer unsure: 44 of 48 with nothing, of which 43 passed, all 48 with the skill, of which 47 passed, and 47 of 48 with the facts guide, of which 46 passed. With nothing, two said sure and two said guess, and with the facts guide one said guess. All five of those passed.

**Each subject was what it should be.** All 484 records name the kind `bench-subject-closed`. For 429 of them the harness also wrote the list of tools, and each list is `Read`, `Write` and the hand-back. Every subject called those three and no other, and no record holds a sign that a subject left its directory.

**What it cost.** The 484 tries wrote 1,040,597 output tokens of the Haiku model: 402,165 in round one, 322,506 in round two and 315,926 in round three. The 448 tries that were still to run when the size was fixed were guessed at 1,330,000 and wrote 954,589, so the guess was two fifths too high. The ceilings wrote 613,054 output tokens of the stronger model, in 34 tries.

## What the reading suggests

None of this is a result. It is what the answers look like after three readers went through them, and two sentences that stood here first have been taken back, as the last section tells.

- **On five listing tasks, a Haiku subject that did not know `outline` wrote a right first command in every try with 925 characters of facts, and in no try with nothing.** The rule shows it on round one: +20 of 20. It is the thing the first two studies could not ask.
- **On T06, what counted was whether the text said the one thing the task turns on.** On T04 and T03 that does not hold. Three texts are silent on the names of the types, and passed T04 in 1, 11 and 8 of 12 tries. No text says what is read of an import written over several lines, and T03 passed in 9 to 12 of 12 with every text that gives `--items imports`. Something else counts as well, and this study does not say what.
- **The skill points at the answer that failed on T06.** "To keep only functions, classes, or another symbol kind, use `--type`", and eleven of twelve subjects did that and no more. The skill teaches when to reach for `outline` and how to read code in stages. The tasks ask for a filter that lists an exact set, which it was not written for. On four of the five tasks it is not shown to do worse than the facts guide, and this study does not say it is a poor skill.
- **T04's own word is a type of the tool that holds less.** The task says "every exported top-level variable: a `const` or a `let`", and the tool's type `variable` holds a `let` and not a `const`. 22 failed answers have `--type variable`: 6 with the names, 11 with the short help, 4 with the help and 1 with the skill. So the word did not lead every arm there. Five failed answers on T04 hold a `--match` that passes by itself, and broke only on a guessed value beside it.
- **With the names alone, some answers were one guess from right.** Three wrote `--items import` for `imports`, and two of the three pass with the one letter added. The two that failed T02 pass with their `--items` taken off.

## What this cannot carry

- **Five tasks, and one of them decides comparison 4.** Three of the five have one reference answer for all four variants, so their twelve tries in an arm are tries at nearly one string.
- **One model wrote the tasks, the facts guide and the ceilings' answers.** The guide was committed before the tasks, at `8fc6b27` and `9e1a6c6`, and the tasks' author did not read it. That keeps one text out of the other. It does not keep one mind out of both: the tasks were asked to be ones a first user gets wrong, the guide was written to say what a first user gets wrong, and the same model chose both. Each of the guide's five lines bears on a task. How many of the 60 passes would stand on tasks from another hand is not known.
- **The guide ends with one whole command,** `--items structure --type function --match '^tally$'`. One reference answer, T06's, has all three of those flags, and three more have two of them. With T02's name in it, the guide's command fails T02: it also lists a function of that name that is not exported.
- **Two of the guide's lines are wrong, in four ways, and they cost nothing here.** The third line is wrong of an arrow function in an exported `const`, and of one in a `let` that is not exported. The fourth is wrong of an item whose name is not on its first line, and of the line read for an item that is not exported. That they cost nothing is the luck of these tasks: a task on any of the four could turn on them.
- **No subject's reasoning is kept.** Where this note says why a subject wrote what it wrote, it leans on the hand-back, and most hand-backs give no reason.
- **The ceiling is one try for each task in each arm.** With the names the stronger model failed T02, which the Haiku model passed in 10 of 12 tries. All ten of those name the type `function`, which the names do not give: they are guesses that came out right.
- **The arm with nothing ran eleven hours before the arms it is set against:** from 06:17 to 06:19, and the others of round one from 17:09 to 17:20.
- **"With no guide" has never meant an empty context.** Every subject of all three studies read about 8,600 characters from the harness, about four services connected to the session. It is the same in every arm, it does not name ast-grep, and round one's note tells it. Whether the subjects do better or worse without it is not known. That text is in the harness's own records and not in this repository.
- **The session that ran the study saw some answers before every round was kept.** The request asks for a hand-back of two lines, and some subjects wrote their command there as well. Nothing was scored and nothing was changed for it, and what would run was written down before. That every answer was read before `compare.py` ran is this session's word: no record shows it.
- **No subject had the tool.** Nothing here says what a subject with the tool would see or miss.
- **That each subject was handed the pinned text is not kept.** A try's directory is removed when it is kept, and `setup.json` names its files and holds no sum of them.
- **One model, one tool, one harness, one day.**
- `compare.py` names T05 at the head of its output. T05 is in the set and not in the study: no try of it exists, and no pair counts it.

## What this leaves open

For the maintainer to choose among. Nothing here has been started.

- **The same arms on tasks from another hand.** It is the plainest check of what is told above: whether the facts guide still passes when its author's kind of mind did not also choose the tasks.
- **Which lines carry it.** The guide with one line taken out, for each line. This is the measure the aim asks for: the least text that still passes.
- **The same tasks with the tool in hand.** It says what a guide is worth when a refusal can be read, and it counts what the help costs to read.
- **A mended guide, as rows that `ley` checks.** What is wrong is known: four things, in two lines. The pinned guide stays as it is, and a mended one would be a new file with new checks.

## What the check changed

The first form of everything from "What came" down is commit `f59cfc8`. Two readers then went through it. One recomputed every number and checked each sentence it could against the records, the texts and the tool. The other sorted all 149 failures without seeing how they had been sorted. Every number in every table held. These things did not. They were mended in `72f07b7`, and the first reader then checked the mending and found more, which is mended here.

- **The sorting, twice.** "All 146 are the test's" became 100 the test's and 46 not known, and then 100 the test's, 32 the subject's and 14 not known, for the reasons told under "Whose each failure is". One control failure went from the subject's to not known.
- **A thing said of the tool.** The four extra items on T06 were called arrow functions in a `const`. One of the four is a `let`. That showed a second wrong thing in the guide's third line, and the second reader found a second in its fourth.
- **Two sentences of the reading were against the answers, and are taken back.** One said that where a text was silent the Haiku model took the plain meaning and did not hedge. On T04, with the skill, eleven of twelve matched on the line and named no type. The other said that what counted was whether the text said the one thing a task turns on. That is so of T06 and not of T04 or T03.
- **Three sentences said what the tool in hand would tell a subject, or would not.** No subject had the tool. Two are taken back. The third now says only what the tool prints, and that whether a subject would see it was not measured.
- **"The pass rate does not follow the length" was wider than its table.** Among the four texts that this study's author did not write it does follow it, up to the skill.
- **"Each failure broke on one thing" was not so** for 19 of the 29 answers in one row of that table.
- **Three counts were wrong, and one judgment was changed.** The facts answers on T04 with `export` in their `--match` are nine and not twelve. The reference answers with the shape of the guide's command are one and not three. In round one's note, the hand-backs with nothing that doubt `outline` are 14 of 20 and not 11. And the guide's lines that bear on a task are now counted as five, where four was written.
- **"300 times of 300" was a check for one comparison of the three it named.** For the other two no pairing can change a count.
- **Four things promised above were missing and are added:** that the "shown" on T06 is one of ten, the eighteen pairs that are "shown" on a task by itself, the stronger model's tries with the names beside the Haiku model's, and the tokens and the words on the control tasks.
- **Sentences were made no wider than their evidence,** and limits were added under "What this cannot carry".
- **The mending brought in slips of its own, which the second check found:** "three of the five tasks read the same in every variant", where it is their reference answer that is the same; a sign the wrong way round in the ladder; "three wrote `--items import`" told as one guess from right, where two of the three are; and "no try of either model" of an arm the stronger model did not run in.

The second reader also sent these, which are told above where they belong: that the long help is wrong about what `--match` reads, that T04's own word is a type that holds less, and that a `var` is not listed by `outline` at all, which no task here touches.

Some things in this note no reader could check from the repository: that every answer was read before `compare.py` ran, that the second reader had not seen the first sorting, how far that reader trusted its own reading, what the harness does to a call before the record keeps it, that the tasks' author did not read the guide, the text every subject read from the harness, and that each subject was handed the pinned text.

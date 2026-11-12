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

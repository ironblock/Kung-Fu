# The first study, written down

It has not run. It waits for the maintainer's go. Three things have to be built before it can run, and they are listed here.

## The question

Does a short guide of checked facts cut what a weaker model spends before it is first right with a tool? It is compared with no guide, and with the guide the tool's own makers publish.

## What has to exist first

1. **Each task says which files count.** In the ceiling run, three subjects were right on their first call and then spent most of their tokens on TypeScript files that the task did not say counted.
2. **The guide of facts.** A few sentences, each beside a command that shows it, each tried by hand on ast-grep 0.51.1. It is written from the three traps of the pilot: a rule must name a kind of node, and a position is not one; `$$$` stops at the first argument that fits; `var $A = $B` also matches a statement with two variables. For this study the guide is plain text. Whether it can be a ledger that `ley` checks waits on a ruling about rows that show a refusal.
3. **Tasks the guide was not written from.** A guide is scored on other tasks than the ones it came from. So T08, T09 and T14 are out. For each fact there are two new tasks that turn on it, and beside them four tasks that turn on none, as a control. A fresh agent writes the new tasks from one line about each behaviour, and does not see the guide. Each new task gets a reference answer, variants, and a ceiling.

## The arms

One Haiku model as the subject, with the code and ast-grep to run. One task for one subject.

| arm | what the subject is given besides the task |
|---|---|
| none | nothing |
| skill | the published ast-grep skill: `SKILL.md` and its rule reference |
| facts | the guide of facts |

Each task gets three tries in each arm, on variants 1, 2 and 3.

## What is measured

- **First:** the output tokens a subject spends before its first right call.
- **A gate:** an arm with a guide must pass no fewer tasks on every try than the arm with none.
- **Beside them:** the calls before the first right one, the calls ast-grep refused, what each subject took the task to be, and each failure sorted as the subject's, the test's or not known.

Every request, answer and call is read before any number is explained.

## What each outcome changes

The difference that matters is a half: one arm spends half of what another spends, or less, on the tasks that turn on a fact. It is written here before the run.

- **The facts arm spends half or less, and passes no fewer tasks.** The guide becomes a ledger, the row that shows a refusal is built, and a second tool is tried.
- **No arm differs from another by a half.** The idea that a few facts are enough is not shown. The calls are read to see why, before anything else is built.
- **The skill arm does as well as the facts arm.** A short guide has no edge over what is already published.
- **On the control tasks an arm with a guide spends twice what the arm with none spends.** The guide costs more than it gives where no fact is needed. That is reported beside any gain.

Anything between these is "cannot tell", and is said so.

## Its size

Ten tasks, three arms and three tries: 90 runs of the Haiku model. Before them, ten runs of the stronger model for the ceilings of the new tasks.

In this harness every run also reads more than 60,000 tokens of the harness's own instructions. The one Haiku run so far wrote 8,304 output tokens. The ceiling run of 14 tasks wrote 147,391. If the 90 runs are like the one, that is about 5.7 million tokens read and 0.75 million written. This is a guess from one run.

## What it cannot show

- Anything about another model, another tool or another harness.
- How a guide does on a task that needs a fact the guide lacks.
- Why a subject spent what it spent: the harness does not keep the reasoning.
- The author of the guide also wrote the pilot's tasks. The new tasks are written by another hand to keep the two apart, and that is the only guard.

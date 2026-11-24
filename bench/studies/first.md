# The first study, written down

The maintainer said go on 2026-11-11. The three things it needed are built. What was settled after the go, and before any try of the study, is at the end, with its date. The run is `../runs/2026-11-11-first`.

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

## Settled on 2026-11-11, after the go and before any try

Everything above stands as it was written. These points were not said above, or have changed since. All of them were written down and committed before the first Haiku try.

**What was built.** The guide of facts is `../guides/facts`. The tasks are `../sets/first`: T01 to T06 turn on a fact, two tasks to a fact, and T07 to T10 are the control. Two ceilings ran, `../runs/2026-11-11-first-ceiling` and `../runs/2026-11-11-first-ceiling-2`. The stronger model passed all ten tasks in each.

**The request changed after the first ceiling.** One subject wrote files into a directory that all subjects share. The request now says: "Do not read or write any file outside that directory, and do not use the network. If you need a file of your own, make it in that directory." The second ceiling ran under this request, and no subject left its directory.

**What a call on the task's code is.** A call that searches code the subject piped in, or a file of the subject's own, is counted apart. The first ceiling showed that such calls had been counted as tries at the task.

**How the first measure is added up.** `../compare.py` holds this rule.

- For each arm, the output tokens before the first right call are added up over the 18 tries at T01 to T06: six tasks, three tries each.
- A try that never made a right call spent everything it wrote and was never right. All its output tokens are counted, and the number of such tries is printed beside the sum.
- The median over the 18 tries is printed beside the sum. One long try can move a sum a long way.
- One arm spends half of another, or less, when the sum and the median both say so. When only one says so, the answer is "cannot tell".
- The control tasks are added up the same way, over their 12 tries. An arm spends twice what another spends when the sum and the median both say so.

**The gate counts all ten tasks.** An arm with a guide must pass no fewer of the ten tasks on every try than the arm with none.

**What each arm is given, and how much it is.**

| arm | files beside the task | characters |
|---|---|---|
| none | none | 0 |
| skill | `SKILL.md` and `rule_reference.md`, from `ast-grep/skills/ast-grep` in <https://github.com/ast-grep/agent-skill> at commit `0613dc7` | 22,196 |
| facts | `facts.md`, from `../guides/facts` | 1,303 |

**The order.** Three batches, one for each variant. A batch is 30 tries: the ten tasks in each of the three arms, started together. So a run that stops half way leaves whole batches, and each batch holds every arm.

**A try that goes wrong.**

- A subject that stops before it finishes is no try. Its directory is made anew with `setup.py --again`, and the same request is sent once more.
- `keep.py` writes down each sign that a subject left its directory. Each sign is read against the subject's commands. If the subject read an answer, a guide it was not given, or another subject's work, that try is spoiled. It stays in the record, and the same task and variant are left out of every arm with `compare.py --without`. The result is then given both ways.

**What the two ceilings say about spread.** On one task, two tries by the stronger model differed by more than a half: 6,704 output tokens before the first right call, and 2,702. Added up over T01 to T06 the two ceilings gave 27,066 and 21,843. So no task of the study is read alone, and a difference of a half on one task shows nothing.

## What came, 2026-11-11

The run is `../runs/2026-11-11-first`, and its note has every number.

**No arm spent half of what another spent, and every arm passed every task.** Of the outcomes written above, this is the second: the idea that a few facts are enough is not shown. The third holds too, in the weak sense that the skill arm and the facts arm did not differ by a half. The fourth did not happen: no guide cost twice on the control tasks.

On the tasks that turn on a fact, the facts arm spent 0.78 of what the arm with none spent by the sum, and 1.01 by the median.

## What the reading suggests

This part is the author's reading of the calls. It is not a result, and nothing in it is decided.

- **The tasks did not need a guide.** The Haiku model, with the tool to try and the code to look at, passed all 30 tries with no guide. A study can only show a guide's worth where the subject without one fails, or spends a great deal.
- **The tool taught the first fact itself.** Its refusal says what to add. A fact that the tool states in its own refusal is worth one refused call, and no more.
- **Short files hide the cost of a pattern that matches wrongly.** A subject saw at a glance that its matches were wrong. In a large body of code it could not. The second and third facts are about that case, and this set could not show them.
- **The facts moved the first call.** It was right in 10 of 18 tries with the facts, and in 6 and 5 of 18 without them. That was not the measure written down, and 18 tries are few. A study where the subject gets one call, or where each call is dear, would measure it. It would need its own tasks, its own tries and its own note written first.
- **The harness is part of what was measured.** Every subject read some 62,000 tokens of the harness's instructions before the request, and more than half of the Haiku subjects called a tool that has nothing to do with the task. A subject given a shell and its files alone would be a cleaner subject.

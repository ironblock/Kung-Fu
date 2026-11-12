# The second study, written down

It has not run. It waits for the maintainer's go. It was written on 2026-11-12, after the first study, and its author had seen that study's numbers.

## The question

With no tool to try, does a short guide of checked facts raise how often a weaker model's command is right as it is first written? It is compared with no guide, and with the guide the tool's own makers publish.

## Why this one

The first study gave its subjects the tool, and no arm spent half of what another spent. Reading its calls gave three reasons why a guide had little to do there.

- The subject with no guide passed every try. A guide had no failure to prevent.
- The tool taught the first fact itself. Its refusal says what to add, so the fact was worth one refused call.
- Each task's code was one short file. A subject saw at a glance that a pattern matched the wrong lines.

One number leaned the other way. With the facts, a subject's first call was right in 10 of 18 tries, against 6 and 5 of 18. That was not the measure written down, and 18 tries are few.

Here the first call is the only call. The subject writes one command and never runs it. There is no refusal to learn from and no output to check. If a few facts teach a tool, this is where it shows.

## What was agreed, and what this is

On 2026-11-12 the maintainer agreed to a study "where the subject gets a single call on long code". This is written as no call at all, and with no code. The reason: with no call, nothing can be checked by eye, however long the code is. So long code is not needed, and the first study's tasks and its guide can be used unchanged. The other form, with the tool in hand on code too long to check, needs a new and large set of tasks. It is left for after this one, and is named at the end.

## What exists, and what has to be done first

**It exists.**

- The tasks: the set `../sets/first`, unchanged. Six turn on a fact, two to a fact, and four are the control.
- The guide: `../guides/facts/facts.md`, unchanged. Its SHA-256 sum begins `dc06aac5`, as in the first study. It must stay unchanged: its author has now seen the tasks.
- The bench: `setup.py --closed` makes a try with no tool and no code. `compare.py` holds the rule below. `keep.py` keeps a try only from the kind of subject the try is for. The self-check covers all three.

**It has to be done before the run.**

1. **The kind of subject must load.** `bench-subject-closed` is defined in `.claude/agents` of this repository: it can read and write files, and it has no shell and no other tool. In the session where this was written the definition could not be loaded, because Claude Code reads a new directory of definitions only when a session starts. So the first step of the run is a check that harms nothing: one such subject reads one file, and its record must show that it was handed `Read` and `Write` and nothing else, apart from a tool to hand its report back.
2. **The ceilings**, as told below.

## The subject

One Haiku model, as a subject of the kind `bench-subject-closed`. One task for one subject. It gets `task.md`, and the files of its arm's guide. It does not get the code, and it cannot run ast-grep. The request is the one `setup.py --closed` writes.

## The arms

| arm | what the subject is given besides the task | characters |
|---|---|---|
| none | nothing | 0 |
| skill | `SKILL.md` and `rule_reference.md`, from `ast-grep/skills/ast-grep` in <https://github.com/ast-grep/agent-skill> at commit `0613dc7` | 22,196 |
| facts | `facts.md` | 1,303 |

A round is four tries at each task in each arm, on variants 0, 1, 2 and 3: 120 tries. The study is three rounds, fixed here before any of them runs: 360 tries. That is 72 tries in each arm on the tasks that turn on a fact, and 48 in each arm on the control. Why three is told under "Its size".

## What is measured

**First: whether the answer passes.** The command in `answer.txt` is graded on what it matches, as it was written.

**The rule for a difference.** `../compare.py` holds it, and reads the three rounds as one. Two arms are set try against try: the same task in the same variant of the same round, once in each arm. The size that matters is a quarter of those pairs: 18 of the 72 on the tasks that turn on a fact.

The answer is read once, when all three rounds are kept. Nothing is decided from one round or two.

- **Shown:** one arm passed more tries, by a quarter of the pairs or more, and an exact sign test on the pairs that differ gives 0.05 or less.
- **No difference that large:** the difference, in 95 of 100 resamplings of the pairs, lies within a quarter of the pairs either way.
- **Cannot tell:** anything else.

**Beside it:**

- **The kind of each failure.** ast-grep refuses the command, or the command runs and matches other code, or it is not a command of the form asked for. A subject with the tool would see the first kind at once. Nothing would tell it of the second.
- **The word each subject gives for how sure it is**, set against whether its answer passed. In the first study all 90 said "sure".
- **Each fact by itself:** T01 and T02, T03 and T04, T05 and T06.
- **The control tasks**, compared by the same rule: 48 pairs, and a quarter is 12.
- **The output tokens of each try**, and the characters of guide in front of each subject.

Every request and every answer is read before any number is explained.

## The ceilings

Before the run, the stronger model does each of the ten tasks once in each arm, as the same kind of subject with no tool: 30 tries, on variant 1.

- A task the ceiling passes in at least one arm goes into every arm. A difference between the arms is what the study measures.
- A task the ceiling fails in every arm is read first. If the fault is in the wording or the reference answer, the task is mended and its ceilings run again. If not, nothing here could have passed it, and it is taken out of every arm before the run.

Both ceilings of the first study passed all ten tasks with the tool in hand. So each task can be done. These ceilings ask whether it can be done from the wording alone.

## What each outcome changes

- **The facts arm is shown to pass more than the arm with none.** The idea has its first evidence. The guide becomes a ledger that `ley` checks, which needs a ruling on a row that shows a refusal. A study with the tool in hand, on code too long to check by eye, comes next.
- **No difference that large between the facts arm and the arm with none.** Three facts do not teach the tool, even with no tool to teach it. The failed answers are read for what they lacked, and nothing is built on the guide.
- **The skill arm is shown to pass more than the facts arm.** The longer guide holds something the three facts lack. It is found by reading, and the smallest set of facts has to grow.
- **The facts arm and the skill arm do not differ by that much, and each is shown to pass more than the arm with none.** A guide of 1,303 characters did what one of 22,196 did. That is the first support for the claim about spend.
- **An arm with a guide is shown to pass fewer control tries than the arm with none.** The guide harms where no fact is needed. That is reported beside any gain.
- **Cannot tell.** It is said so. Tries are not added until an answer comes: a further study gets a note of its own.

## Its size

360 tries of the Haiku model and 30 of the stronger model.

**Why three rounds.** The rule was tried on made-up subjects before any real one: each try passes by chance at a rate that is given, and the rule is asked for its answer many times over. The table says how often it answered "shown", and in its last column how often it answered "no difference that large" when the two rates were the same.

| pairs on the tasks that turn on a fact | 70% against 30% | 60% against 30% | 50% against 30% | 50% against 50% |
|---|---|---|---|---|
| 24, one round | 72 in 100 | 48 in 100 | 21 in 100 | 1 in 100 |
| 48, two rounds | 96 in 100 | 69 in 100 | 34 in 100 | 28 in 100 |
| 72, three rounds | 98 in 100 | 84 in 100 | 32 in 100 | 70 in 100 |

One round can show a very large difference and can say nothing else. Three rounds can also say that there is no difference that large. With the same rates in both arms, the rule answered "shown" in 2 to 4 of 100. The maintainer may pick one round with the go, and the first row is then what the study can do.

**What it costs.** A try with no tool is short. In the pilot, a Haiku subject with no tool wrote 14 answers in about 20,000 output tokens. If a single answer costs about a tenth of that, 360 tries write about 700,000 output tokens. That is a guess. What each subject reads first is not known yet: a subject of this kind is handed two tools, where the first study's subjects were handed 52.

The harness runs 20 subjects at once. So the tries start in groups of 15: five tasks in each of the three arms, on one variant.

## What it cannot show

- What a guide is worth to a subject that has the tool. The first study asked that.
- Anything about another model, another tool or another harness.
- How a subject does when it can read the code. Here it reads only the wording of the task.
- Whether a failure on T01 or T02 is for want of the fact. A right answer there names kinds of node of the JavaScript grammar. The three facts name none. The kind of each failure is read for this.
- The rule for a difference was written by someone who had seen the first study's numbers. The tasks, the guide and the arms were all fixed before that.

## Left for later

A study with the tool in hand, on code too long to check by eye. A pattern that matches wrongly would then pass unseen, as it does for a model at work in a large repository. It needs a new set of tasks: many files, many expected matches, and the hard cases few among them.

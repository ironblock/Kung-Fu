# The second study, written down

It was written on 2026-11-12, after the first study, and its author had seen that study's numbers. The maintainer said go that day, to three rounds. What was done after the go, and before any try, is at the end.

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

## After the go, and before any try

Written on 2026-11-12. Everything above stands as it was.

- **The kind of subject loaded.** Two subjects of the kind `bench-subject-closed` each read one file that has nothing to do with any task. Each was handed `Read`, `Write` and the tool that hands a report back, and nothing else. Each read 3,464 tokens before its request.
- **`compare.py` prints the two things named under "Beside it".** For each arm it says what became of the answers that did not pass, and how many answers passed under each word a subject gave for how sure it was. That was added before any try.
- **The runs.** The ceilings are `../runs/2026-11-12-second-ceiling`. The three rounds are `../runs/2026-11-12-second-a`, `-b` and `-c`.
- **How the subjects start.** A group of 15 is sent at once, and the session waits for all 15 before it sends the next.
- **Nothing is scored until every round is kept.** `score.py` and `compare.py` are not run on a round before all three are kept. A try's record is looked at before that for three things only: that the subject finished, which model it names, and whether it left a sign.

## What came, 2026-11-12

The three rounds are kept: 360 tries. `compare.py` read them as one. Every failed answer was read first, with every line the tool said. Each of the 114 has a line beside it, in `whose.txt`, that says whose failure it is and why: 113 are sorted as the subject's and one as the test's. Nine of the 114 fail on the form of the answer and not on what its rule says. They are told by themselves below.

| tries that passed | none | skill | facts |
|---|---|---|---|
| on the tasks that turn on a fact, of 72 | 30 | 34 | 42 |
| on the control tasks, of 48 | 47 | 45 | 48 |

**By the rule, the study cannot tell whether the three facts raise how often the command is right.**

| on the tasks that turn on a fact | difference, of 72 pairs | only the first passed | only the second passed | sign test | with resampling | the rule says |
|---|---|---|---|---|---|---|
| facts against none | +12 | 19 | 7 | 0.03 | +2 to +22 | cannot tell |
| facts against skill | +8 | 18 | 10 | 0.18 | -2 to +18 | cannot tell |
| none against skill | -4 | 6 | 10 | 0.45 | -12 to +4 | no difference as large as 18 of 72 |

Of the outcomes written above, this is the last one: cannot tell. No tries are added, and nothing is built on the guide from this study.

- **The facts arm passed 12 more tries than the arm with none, and the size fixed beforehand was 18.** The resampling puts the difference between 2 and 22. It may be as large as a quarter, and it may be far smaller. The sign test alone gives 0.03, and the rule asks for the size as well. A direction is not a result.
- **The published guide did not raise the pass rate by a quarter.** With its 22,196 characters, 34 of 72 tries passed. With nothing, 30 did.
- **No guide is shown to harm where no fact is needed.** On the control tasks no two arms differ by as much as 12 of 48. Facts against none is +1, facts against skill is +3, and none against skill is +2.

**The answer does not turn on a choice of counting.** Each line below was counted after the scores were seen, and each is told further down.

| counted | facts against none | the rule says |
|---|---|---|
| as scored | +12 of 72, with resampling +2 to +22 | cannot tell |
| the three-line answer taken whole | +13 of 72, +3 to +23 | cannot tell |
| all six answers that pass once their form is mended | +14 of 72, +4 to +23 | cannot tell |
| T02 left out of every arm | +11 of 60, +2 to +20, where a quarter is 15 | cannot tell |
| the rounds paired in 300 other ways | +12 of 72, sign test 0.01 to 0.04 | cannot tell, 300 times of 300 |

### Beside it

**Each task.** Tries that passed, of 12 in each arm.

| task | its fact | none | skill | facts |
|---|---|---|---|---|
| T01 | 1 | 2 | 2 | 7 |
| T02 | 1 | 0 | 0 | 1 |
| T03 | 2 | 12 | 11 | 12 |
| T04 | 2 | 5 | 9 | 2 |
| T05 | 3 | 1 | 1 | 9 |
| T06 | 3 | 10 | 11 | 11 |
| T07 | | 12 | 12 | 12 |
| T08 | | 11 | 11 | 12 |
| T09 | | 12 | 11 | 12 |
| T10 | | 12 | 11 | 12 |

- The six tasks did not pull one way. Against the arm with none, the facts arm is +5 on T01, +8 on T05 and -3 on T04.
- Three tasks could show little: almost nobody passed T02 in any arm, and almost everybody passed T03 and T06 in every arm.
- T05, T06 and T10 read the same in every variant. So T05's 12 tries in an arm are 12 tries at one string, and T05 carries +8 of the +12.
- By the README's measure, a task passes when every try passes. Over the 12 tries of each arm, that is 4 of the 10 tasks with none, 1 with the skill and 5 with the facts.

**Each fact by itself.** No rule was fixed for this beforehand. The numbers below come from the function that holds the rule, asked after the scores were seen, on the 24 pairs of each fact's two tasks. A quarter of 24 is 6.

| fact | none | skill | facts | facts against none | facts against skill | none against skill |
|---|---|---|---|---|---|---|
| 1: T01, T02 | 2 | 2 | 8 | +6, sign test 0.07, cannot tell | +6, sign test 0.07, cannot tell | 0, no difference as large as 6 |
| 2: T03, T04 | 17 | 20 | 14 | -3, sign test 0.38, cannot tell | -6, sign test 0.07, cannot tell | -3, sign test 0.51, cannot tell |
| 3: T05, T06 | 11 | 12 | 20 | +9, sign test 0.02, "shown" | +8, sign test 0.04, "shown" | -1, no difference as large as 6 |

Nine questions were asked this way, and none was written down first. So a "shown" among them counts for less than the word says. Nearly all of the third fact's difference is one task, T05.

Which round of one arm is set against which round of another is an accident of the order they ran in. Paired in 300 other ways, the third fact reads "shown" every time, against none and against the skill. The first fact reads "shown" against none in 131 of the 300 and "cannot tell" in the rest, so its line above is one draw of two.

**The kind of each failure**, on the tasks that turn on a fact, of 72 tries in each arm.

| | none | skill | facts |
|---|---|---|---|
| passed | 30 | 34 | 42 |
| ast-grep refuses the command | 19 | 23 | 15 |
| it runs and does not match what the task asks for | 23 | 14 | 14 |
| not a command of the form asked for | 0 | 1 | 1 |

A subject with the tool would see a refusal at once. Of the 51 commands that ran, four matched nothing at all, and a subject with the tool would see that too. Of the other 47, 25 matched everything the task asks for and more, 18 matched a part of it and nothing else, and four matched only other code. Whether a subject with the tool would notice any of those was not run here.

On the control tasks there were four failures, all refusals: one with none and three with the skill. All three of the skill's are a rule with no braces around it, told below.

**The word each subject gave.** Of the 360 answers, 312 were called "unsure", 41 "guess" and 7 "sure".

| | called sure | called unsure | called guess |
|---|---|---|---|
| tasks that turn on a fact | 4, of which 2 passed | 182, of which 100 passed | 30, of which 4 passed |
| control tasks | 3, of which 3 passed | 130, of which 126 passed | 11, of which 11 passed |

"Unsure" was the word for nearly every answer, and it says little: 126 of 130 such answers passed on the control tasks, and 100 of 182 on the others. "Guess" follows the task more than the answer: 25 of the 30 guesses on the tasks that turn on a fact are on T01 and T02, where few answers passed under any word.

**Tokens and characters.**

| | none | skill | facts |
|---|---|---|---|
| characters of guide | 0 | 22,196 | 1,303 |
| output tokens, 120 tries | 456,603 | 573,182 | 528,264 |
| output tokens, the median try | 3,322 | 4,483 | 3,839 |

A subject with a guide wrote more than a subject with none. Each subject read between 3,677 and 3,694 tokens before its request.

**What it cost.** 1,558,049 output tokens of the Haiku model. The guess above was 700,000, so the run cost 2.2 times the guess. The ceilings cost 736,977 output tokens of the stronger model.

**Nine answers fail on their form.** Seven give the rule as `id: ..., language: ..., rule: {...}` on one line with no braces around it. That is not valid YAML, and ast-grep refuses it. Two are written over three lines, where the task asks for one, and the grader reads the first line. Six of the nine are in the skill arm and three in the facts arm. In the arm with none, all 87 inline rules have their braces.

The task asks for one line and does not say how a whole rule goes on one. The published guide shows whole rules over several lines. Its two examples on one line give no `id` and no `language`, and ast-grep 0.51.1 refuses them: "missing field `language`". `facts.md` shows each rule as `rule: {...}` alone.

With only the form mended, afterwards, six of the nine pass.

| try | the fault | with the form mended |
|---|---|---|
| skill, T04, round three, variant 0 | no braces | passes |
| skill, T08, round one, variant 1 | no braces | passes |
| skill, T09, round two, variant 2 | no braces | passes |
| skill, T10, round three, variant 3 | no braces | passes |
| facts, T05, round one, variant 2 | no braces | passes |
| facts, T05, round three, variant 1 | three lines | passes, taken whole |
| facts, T04, round one, variant 1 | no braces | still misses 2 of 9 |
| skill, T04, round three, variant 1 | no braces | still misses 2 of 9 |
| skill, T01, round two, variant 2 | three lines | refused: the rule names no kind |

With the six counted as passes, the tasks that turn on a fact stand at 30, 35 and 44, and the control tasks at 47, 48 and 48.

- **The three-line answer that matches exactly is sorted as the test's.** The README says an answer is judged by what it matches, never by how it is written. Here the grader read one line of three. It stays a failure in the score, because the study named "not a command of the form asked for" as a kind of failure before the run.
- **The seven with no braces are sorted as the subject's.** ast-grep itself refuses them, the task asks for that form, and every subject with no guide wrote it rightly. Each line in `whose.txt` says what the arm's guide showed. A reader may sort them otherwise, and the table above counts them both ways.
- **Two steps of `AGENTS.md` were not done for this study's request.** No fresh reader read it before the run, and no list was written of what the test takes for granted. "A subject knows how to write a whole rule on one line" is such a thing. It held for every subject with no guide, and it failed for nine with one.

**The ceilings.** They are told in `../runs/2026-11-12-second-ceiling`. The stronger model passed every task with either guide, and nine of ten with none: it failed T02 with a rule that names no kind. So with no guide, no subject of either model passed T02: 0 of 1, and 0 of 12 here. The rule fixed before the run let a task in when the ceiling passed it in any arm.

A right answer to T02 can be written from the wording and the first fact. A rule that lists only the six kinds the wording names passes in all four variants. It was written and run after the scores were seen. So the 12 failures of the arm with none on T02 are sorted as the subject's: the request holds what the task needs, and what is missing is a fact about the tool, which is what that arm asks about. With T02 left out of every arm the rule still says: cannot tell.

**What was read, and what is not kept.**

- Every failed answer was read before the comparison ran. The answers that passed were read too. Those on T03 and on T06 to T10 were read in full only afterwards.
- A subject's reasoning is not kept. So nothing here says why a subject wrote what it wrote, except where its report says so, and most reports are two lines.
- The `task.md` each subject read is not kept beside its answer. `setup.py` keeps it from now on. For these rounds it can be built again from the set as it stood.
- A reader with no part in the run then checked this note against the records, and read all 114 failed answers. One count was wrong and is corrected. The same reader's findings changed how one answer is sorted, and several sentences here.

**The subjects were what they should be.** Every record names the kind `bench-subject-closed`. For 324 of the 360 the harness also wrote the list of tools, and each list is `Read`, `Write` and the hand-back. No record holds a sign that a subject left its directory.

## What the reading suggests

This part is the author's reading of the 360 answers. It is not a result, and nothing in it is decided. Where a failed answer was mended and run again, that was done after the scores were seen.

- **A fact was used where it came with a rule that fits the task after one change.** The third fact ends with a rule for `var` statements with one variable. T05 asks for `let` statements with one variable. All 12 answers of the facts arm carry the fact's `not: {has: {kind: variable_declarator, nthChild: 2}}`. Nine pass. Two of the other three fail on their form: a rule with no braces around it, and the answer on three lines. The third names two kinds that the grammar does not have, `"let"` and `"="`. In the other two arms, 21 of 24 answers rest on the pattern `let $A = $B`, and each also matches `let first = 1, second = 2;`. That is the trap the fact names.
- **Naming the trap was not enough.** The second fact says that `wrap($$$A, last)` misses `wrap(last, last)`. The wording of T04 says that `[stopper, stopper]` counts. Ten of the 12 answers of the facts arm are built on the pattern `[$$$A, stopper]`, which misses it: nine ran and missed, and one was refused for its form. The fact's own rule is for the arguments of a call, and the task is about an array. Two subjects carried the rule over to `kind: array`, and both passed.
- **Two reports say why their subjects did not.** One read the fact's first sentence against its own example: "`$$$A` stops at the first fitting place, which is safe here because `bookend` followed by `]` only fits at the end". One thought of the fact's rule and turned away from it on a wrong belief: "I avoided a `kind: array` plus `has: nthChild reverse` rule because `has` searches descendants, so it would wrongly match outer arrays". That rule passes. A third wrote that its answer relies "on `[$$$A, capstone]` matching only when the identifier is the direct last element". A fourth wrote that its four patterns were made "following facts 2 and 3 in facts.md". The other six reports give no reason, and five of them are two lines long.
- **On T04 the published guide did better, by another road.** Nine of its 12 answers pass, and eight of those name `kind: array` and put a regex on the array's text. Five answers of the arm with none pass the same way. The facts arm wrote no such rule. A guess, and no more: the first and third facts speak against a regex and against text, and may have turned subjects away from a rule that works here. Set try against try, the skill arm passed T04 where the facts arm failed in 7 pairs, and the other way in none. One task was picked out after the scores were seen, so this is a thing to test and not a finding.
- **The first fact was taken up every time.** On T01 and T02 no answer of the facts arm was refused for want of a kind, in 24 tries. In the other two arms 26 of 48 were. The published guide has a sentence near this fact: "at least one "positive" key (e.g., `kind`, `pattern`) must be present". It is not the same fact. It counts a pattern as enough, and ast-grep refuses `pattern: $X` with a position. Its subjects were refused for want of a kind in 19 of 24 tries.
- **A fact that is taken up shows the next thing that is missing.** On T02 all 12 answers of the facts arm list kinds of node, as the first fact says. Ten were then refused because they wrote `{kind: true}` with no quotes, which YAML reads as a truth value and not as a name. With quotes put in afterwards, one of the ten passes. Six are refused again, for the kind `function`, which the JavaScript grammar does not have. The study said beforehand that the three facts name no kind of node. On T01, four answers of the facts arm use `follows` with no `stopBy`, which looks only at the node just before, and that node is a comma. With `stopBy: end` put in afterwards, three of the four pass.
- **Three of the six tasks could show little here.** The arm with none passed T03 in 12 of 12 tries and T06 in 10 of 12, so a guide had little to add there. One round of that arm alone would have shown those two. It would not have shown T02: with no guide T02 passed 0 of 12, much as T05 and T01 did, and only the arms with a guide show that it stays at the floor. The table under "Its size" took every pair to be one where the arms could differ. With many of them fixed, the rule had less chance to say "shown" than that table says.
- **A sum over tasks hid what each fact did.** The facts arm is far ahead on one task, ahead on another and behind on a third. One rule over all six gives one answer for three different things. A rule for each fact by itself, fixed beforehand, would have asked a sharper question.
- **The one-line form and the guides' examples made a failure together.** Neither made it alone: no subject with no guide left the braces out, and a subject free to write several lines would have had no braces to leave out. A guess: subjects folded what their guide showed into the one line the task asks for.
- **The cost guess came from another kind of try.** It was taken from the pilot, where one subject wrote 14 answers in one go. A subject with one task wrote about 4,300 tokens for it, not 2,000.

## What this leaves open

- Whether the facts arm's lead over the arm with none is as large as a quarter. This study cannot tell, and by its own rule no tries are added to it.
- Whether a fact must come as a rule close to the task to be used. The reading suggests it, on two tasks.
- What a guide is worth with the tool in hand, on code too long to check by eye. That is still the study named under "Left for later". This study adds one number to it: with no tool, 47 of the 114 failed commands ran and matched some code. Whether a subject with the tool would have seen that they were wrong is the thing that study would ask.

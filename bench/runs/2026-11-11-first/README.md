# 2026-11-11-first: the first study

The first part was written before the run. The study is written down in `../../studies/first.md`: the question, the arms, what is measured, what each outcome changes, and what was settled after the maintainer's go.

- **What.** A Haiku model, on each of the ten tasks of the set `first`, in three arms, three tries in each: 90 tries. A try is one subject on one task in one variant, with the code and ast-grep to run. The tries of a task in an arm are on variants 1, 2 and 3.
- **The arms.** `none` gets the task alone. `skill` also gets `SKILL.md` and `rule_reference.md`, the published ast-grep skill, 22,196 characters. `facts` also gets `facts.md`, the guide of three facts, 1,303 characters.
- **The files, pinned.** The two files of the skill are from `ast-grep/skills/ast-grep` in <https://github.com/ast-grep/agent-skill> at commit `0613dc7`. Their SHA-256 sums begin `a84b6735` and `9f6d2ba2`. `facts.md` is `../../guides/facts/facts.md` as committed in this repository, and its sum begins `dc06aac5`.
- **The model.** The harness's `haiku` setting. The record of each subject names the model it ran on. `keep.py` writes "a Haiku model" in its place: this repository holds no model's identifier.
- **The order.** Three batches, one for each variant. A batch is 30 tries, the ten tasks in each of the three arms, started together on one machine.
- **What is kept.** For each try: the request, the answer, the report, every call to ast-grep with any code that was piped in, the output tokens of each message, and each sign that the subject left its directory.
- **How it is read.** `score.py` first, and every answer and every odd call with it. Each failure is sorted in `whose.txt`. Then `compare.py`, which holds the rule for a difference that matters.

**What the test takes for granted.** Each points at words in a kept request, or at this note.

- The subject has a shell, and can read and write files in its directory. The request says to put `bin` on the `PATH`, and to write `answer.txt`.
- The answer is one command on one line. `task.md` says so, in the same words for every task.
- A name in a task's wording is a name in the code of that variant. `build.py` renames both together, and stops unless every reference answer still matches the marked lines.
- Every subject gets the harness's own instructions before the request: about 62,000 tokens, by its count, and the same for every arm.
- The subject stays in its directory because the request says so. Nothing holds it there. `keep.py` looks for signs that it left.
- The subjects of a batch run at the same time and do not meet. Nothing holds them apart but their directories.

**What it cannot show** is in the study. In short: one model, one tool, one harness, ten tasks, and three tries at each.

## Changes during the run

Each is written here with its date, before the next subject starts.

- **2026-11-11. A batch cannot start together.** The harness runs 20 subjects at once and no more. Of the first batch, the `none` and `skill` arms started together: 20 tries. The ten tries of the `facts` arm were turned away, and no subject of theirs started. They start after the 20 have finished and been kept. From the second batch on, a batch is two groups of 15: tasks T01 to T05 in each of the three arms, and then T06 to T10 in each. So every group still holds every arm. The first measure counts tokens and not seconds, so the order should not move it. It is said here because the note above says otherwise.
- **2026-11-11. A finished subject's directory is removed once the try is kept.** It holds a right or wrong answer to a task that later subjects get. Everything that is scored is already in this repository by then.

## What came

Written on 2026-11-11, after the run. It is from `score.py` and `compare.py`, from every answer, from the calls of each try that was not right at once, and from the harness's record of each subject's commands.

**No arm spent half of what another spent.** The study names this outcome before the run: "No arm differs from another by a half. The idea that a few facts are enough is not shown." All 90 tries were kept. Each record names a Haiku model, and each subject opened the guide it was given.

| | none | skill | facts |
|---|---|---|---|
| tasks passed on every try, of 10 | 10 | 10 | 10 |
| single tries passed, of 30 | 30 | 30 | 30 |
| T01 to T06: output tokens before the first right call, 18 tries | 128,800 | 109,551 | 100,894 |
| the same, as a median | 4,292 | 5,528 | 4,353 |
| T07 to T10, the control: the same sum, 12 tries | 21,586 | 26,116 | 19,057 |
| the same, as a median | 1,677 | 2,048 | 2,006 |
| output tokens in all, 30 tries | 187,194 | 188,068 | 165,418 |
| characters of guide put before each subject | 0 | 22,196 | 1,303 |

As the grader stood during the run, the skill arm passed 28 of 30 tries and 9 of 10 tasks. Both failures were the grader's, and are told below.

`compare.py` says of each pair, on the tasks that turn on a fact:

- facts against none: 0.78 by the sum, 1.01 by the median. Not shown.
- facts against skill: 0.92 by the sum, 0.79 by the median. Not shown.
- none against skill: 1.18 by the sum, 0.78 by the median. Not shown.

On the control tasks no arm spent twice what another spent: 0.88 and 1.20 for facts against none, 0.83 and 0.82 for none against skill.

**The gate holds for both guides.** Each arm passed all ten tasks on every try.

### What the calls show

None of this is a finding. It is one study: one model, ten tasks, three tries at each.

- **The subject with no guide passed everything.** So a guide had no failure to prevent. It could only cut what a subject spent, and it did not cut it by a half.
- **What was spent, by group of tasks.** Output tokens before the first right call:

| tasks | none | skill | facts |
|---|---|---|---|
| T01, T02: a part found by its place | 83,931 | 46,504 | 54,132 |
| T03 to T06 | 44,869 | 63,047 | 46,762 |
| T07 to T10, the control | 21,586 | 26,116 | 19,057 |

- **The whole gap in the sums is on T01 and T02.** One try carries a sixth of the none arm's sum: 21,065 tokens, on T01 in variant 3. The medians of the none and facts arms are the same. That is why the rule asks for both.
- **The fact about kinds did what it says.** The guide's first fact is that a rule must name a kind of node. On T01 and T02, ast-grep refused a call with "Rule must specify a set of AST kinds to match" in 4 of 6 tries with no guide, in 5 of 6 with the skill, and in 1 of 6 with the facts. The refusal itself says "Try adding `kind` rule". So a subject with no guide learns the fact from one refused call.
- **With the facts, the first call was more often right.** On T01 to T06 the first call on the task's code was right in 10 of 18 tries with the facts, in 6 of 18 with no guide, and in 5 of 18 with the skill. Calls that ast-grep refused, in all: 12 with the facts, 23 with no guide, 31 with the skill.
- **A subject can check a short file by eye.** Each task's code is one file of 28 to 105 lines. A pattern that runs and matches the wrong lines is seen at once. The second and third facts are about such patterns, and on T03 to T06 no arm did better than the arm with none.
- **Every subject called its answer sure.** All 90 did. So that word told nothing apart.
- **The measure counts whole messages.** On T07 the facts arm spent 444, 760 and 451 tokens before its first right call, and the none arm 1,641, 1,418 and 1,755. Two of the three facts subjects ran their first pattern one message sooner, and the third wrote a shorter message before it. Every one of the six was right on its first call.

One thing was noticed after the run, by a rule that was not written before it. It is told as a thing seen, and no more. Some answers tell the wanted code from the rest by a regex over the whole text of an array, a call or a statement, as `kind: array, regex: "[\\[,]\\s*bookend\\s*,?\\s*\\]$"`. Such an answer passes here, and reads the code as text. Counted by hand on T01 to T06, that is 5 of the 18 answers with no guide (T04 in all three variants, T06 in variants 2 and 3), 3 of 18 with the skill (T04 in variant 3, T05 in variant 1, T06 in variant 2), and 2 of 18 with the facts (T03 in variant 3, T05 in variant 1). The line between such an answer and the others is not sharp, and another reader could draw it one answer to either side.

### One fault in the test

**The grader refused two right answers.** Both are in the skill arm, on T08, and both are written in double quotes with a regex that ends in `$`: `regex: '^.\./pigment\.js.$'`. The grader refused any `$` inside double quotes, because a shell expands `$A` there. A shell does not expand a `$` that begins no name. Run by bash on the clean code, each answer matches the six expected statements and nothing else, and each subject had run that same rule and seen it right. Both failures are sorted as the test's, in `whose.txt`. The grader now reads such a `$` as a shell does, and the self-check holds the cases. No other kept answer changes: the pilot's five passes and the three ceilings score as before.

### Did the subjects stay in their directories?

`keep.py` wrote down a sign for 6 of the 90 tries. Each was read against the subject's commands. None read a file outside its directory.

- Two subjects wrote an empty file, `/tmp/x`, with `cat > /tmp/x`. A third ran `rm -f /tmp/x`.
- Two removed a file of their own by its full path, in a command that did not start with `cd`.
- One began its commands with `export PATH=` and its own directory, and then `cd`.

No subject named another arm's guide. No try is left out.

### What the harness added

**Fifty of the 90 subjects called a tool the task does not need.** It was 14 with no guide, 20 with the skill and 16 with the facts. In 49 of the 50, each such call came after the subject's last call to its shell or its files: at the moment of reporting back. In the other one it came beside that last call. The harness hands every subject many more tools than a shell and its files. The 58 calls were:

- a hand-back tool under a name that does not exist: 16
- a tool that sends a message to another session: 13
- the harness's own documentation: 11
- a search for tools: 6
- tools to archive a session (5), to start one (1), to interrupt one (1), to list sessions (1) and to list a session's events (1)
- a tool that puts a suggested task in front of the person, and the tool that withdraws one: 1 each
- a name cut short, which is no tool: 1

Every call that would have changed something was refused by the harness, or failed because it was given no real session to act on. There is one exception. One subject put a suggestion named "noop" in front of the person, and withdrew it with its next call. The call that lists sessions succeeded, and what it returned went to that subject alone.

None of the 34 subjects of the stronger model did any of this, in the three ceilings. Nor did the one Haiku subject of the check run. The calls came after the first right call, so the first measure is as it was. They are part of the output tokens in all.

A study in this harness should give its subjects a shell and their files and nothing else. That is not done yet.

### What this changes

The study says what follows this outcome: "The calls are read to see why, before anything else is built." So the guide is not made into a ledger on the strength of this run, and no second tool is tried.

What the reading suggests is in `../../studies/first.md`, as a reading and not as a result.

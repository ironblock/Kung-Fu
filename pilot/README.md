# Pilot: writing ast-grep queries

The first pilot for Kung Fu. It asks one question: when a model writes an `ast-grep` command from a description, with no way to run it, is the command right?

Nothing here is a finding. One subject ran once in each arm. This guide has been wrong more than once, and its last section lists every claim it has taken back.

## What is here

- `tasks.md`: 14 tasks. Each describes some code and asks for one command that finds it.
- `marked/`: the code the commands run against. A marker ends each line where an expected match starts. The markers are the ground truth, placed by hand. A closed-book subject never sees this code.
- `reference/answers.txt`: one answer per task that is right on this code.
- `build.py`: strips the markers into `clean/`, runs the reference answers, stops unless they start on exactly the marked lines, and writes `oracle.json`.
- `grade.py`: grades one pass, comparing exact spans. It prints every answer. For an answer that did not pass, it prints every line ast-grep said, and the lines that were missed or should not have matched. The total comes last and cannot be printed alone. A pass with no request beside it is not graded.
- `passes/<arm>/`: what was sent to one subject, and what came back.
  - `request.md`: the request, word for word.
  - `answers.txt`: the file the subject wrote, as it stood when the subject finished.
  - `report.md`: what the subject reported back, word for word.

```sh
python3 build.py /path/to/ast-grep
python3 grade.py /path/to/ast-grep passes/none
```

Each subject also received things this directory does not hold:

- **Every subject:** the harness's own instructions and tools, which came before the request. By the harness's count, the first message each subject read was about 62,800 tokens, and the request is a few hundred of them. The rest includes a note on how to hand the report back.
- **The help arm:** `help.txt`, the output of `ast-grep --help`, `ast-grep run --help` and `ast-grep scan --help` from ast-grep 0.51.1, each under a line that shows the command. Made again on 2026-11-11, it came out the same, byte for byte.
- **The skill arm:** `SKILL.md` and `references/rule_reference.md`, from `ast-grep/skills/ast-grep` in <https://github.com/ast-grep/agent-skill> at commit `0613dc7`. The copies the subject read are the same as those files, byte for byte.
- **The ceiling:** the code as it stood that day, and ast-grep 0.51.1 to run.

## The first pass (2026-11-10, one subject per arm), and a second ceiling

| arm | what the subject had | passed, on the code as it is now | passed, on the code as it was | output tokens |
|---|---|---|---|---|
| ceiling | a stronger model, the tasks, the code, and ast-grep to run | 14 of 14 | 14 of 14 | 165,998 |
| closed-ceiling | the same stronger model, and the tasks only | 13 of 14 | 13 of 14 | 54,445 |
| none | the tasks only | 11 of 14 | 12 of 14 | 18,594 |
| help | the tasks and the help text | 11 of 14 | 13 of 14 | 23,090 |
| skill | the tasks and the published skill | 11 of 14 | 13 of 14 | 24,930 |

The three closed-book arms ran on one Haiku model. Both ceilings ran on one stronger model. The harness's record names the version that served each subject. The closed-book ceiling ran a day after the others, on 2026-11-11. Why it ran, and what was written down before it ran, is in a section of its own below.

**The two score columns.** After the subjects ran, 24 lines were added to the code: decoys, and five more expected matches. Two of those lines decide five of the nine failures below. "As it was" is the code as it stood when the subjects ran. Its expected matches come from today's reference answers, because that day's markers were not kept. Both columns use today's grader. That day's code is not in this repository, so its column is said here and not shown.

**The output tokens** come from the record the harness keeps of each subject. That record is not in this repository, so these numbers are said here and not shown. They count everything a subject wrote: its reasoning, its answers and its report. Each closed-book Haiku subject wrote all 14 answers in one message, of 18,339, 22,496 and 23,273 tokens. The closed-book ceiling wrote its 14 in one message of 54,338. An answers file is about 2,000 characters. So nearly all of those tokens are reasoning, and the record keeps the reasoning empty. What a subject did with them cannot be read. No task has a cost of its own, because one message answered all 14.

No reason is given here for any difference between those numbers. One pass per arm cannot support one.

## Every answer that did not pass

`grade.py` prints these. The quotes are ast-grep's own words.

| arm | task | the answer, in short | what happened |
|---|---|---|---|
| none | T08 | a rule whose own part is `regex: "."`, with `follows: {kind: ","}` inside it | not run: "Rule contains invalid kind matcher." "Missing Selector" |
| help | T08 | `{nthChild: 2, inside: {kind: arguments, …}}` | not run: "Rule must specify a set of AST kinds to match. Try adding `kind` rule." |
| skill | T08 | the same rule as the help arm | the same |
| none | T09 | `var $A = $B` | matched 1 not expected: line 113, `var a = 1, b = 2;` |
| help | T09 | `var $A = $V;` | missed 1 of 3: line 111, `var fifth = 5` with no semicolon |
| skill | T09 | `var $A = $V;` | the same |
| none | T14 | `finish(done)` or `finish($$$ARGS, done)` | missed 1 of 3: line 132, `finish(done, done)` |
| help | T14 | `finish($$$ARGS, done)` | the same |
| skill | T14 | `finish(done)` or `finish($$$, done)` | the same |
| closed-ceiling | T09 | `var $A = $B` | matched 1 not expected: line 113, `var a = 1, b = 2;` |

Sorted, for the nine failures of the Haiku subjects: six are the subject's, none is the test's, and three are set aside. Until the closed-book ceiling ran, three of the six were not known.

**T08, the second argument of a call: the subject's.** The three rules were refused for two different reasons. The help and skill subjects wrote a rule made only of `nthChild` and `inside`. ast-grep refuses a rule that names no kind of node. The subject in the none arm wrote punctuation as a `kind`. ast-grep 0.51.1 reads a `kind` as a selector, and `","` is not one. That subject's rule also named no kind of node. With real kinds in place of the punctuation, it is refused the way the other two are.

So each of the three wrote a rule that ast-grep refuses, and each called its answer a guess. Could a subject who knew the tool have passed? The first pass could not show it. No way was found to write "any node" in a rule. Each of these was tried as the rule's own part:

| the rule's own part | what ast-grep 0.51.1 did |
|---|---|
| `pattern: $X` | refused: "Rule must specify a set of AST kinds to match." |
| `any: [{pattern: $X}]` | the same |
| `not: {kind: comment}` | the same |
| `regex: '^'` | the same |
| `kind: '*'` | refused: "Illegal character * encountered" |
| `kind: 'arguments > *'` | the same |
| `kind: expression` | ran, and matched nothing |

If there is no such way, a right answer must list kinds of node, one by one. The reference answer lists the four that are in this code. The ceiling's answer lists 34. A closed-book subject cannot see which kinds the code holds. And the first ceiling saw the code, so it did not show that the task can be answered without it.

The closed-book ceiling showed it. With the tasks alone, the stronger model wrote `nthChild: 2`, the two `inside` rules, and a list of 31 kinds of node from memory. It called that answer unsure, and it passed. So T08 can be answered from its wording, and by the rule written down before that run, the three failures are the subjects'.

**T14: the subject's. T09: set aside.** Each pattern is wrong for what the task describes. `var $A = $B` also matches a statement with two variables. `var $A = $V;` misses a statement that ends with no semicolon. `finish($$$ARGS, done)` misses `finish(done, done)`: `$$$` stops at the first argument that fits what comes next in the pattern, and never tries again.

Five of these six fail only on a line that was added after the subjects ran. Line 132 was added on a reviewer's advice, before any subject's answers had been looked at. The session's record bears that out: the line was written at 21:05 UTC, and no answer was printed until 21:06. Line 111 was added a day later, after the answers had been read. On the code as it stood, only one of the six failed.

Two subjects wrote `finish(done)` as a second pattern beside the first. The first pattern already matches it. Why they added it is not known, because their reasoning was not kept.

The closed-book ceiling failed T09 as well. It wrote `var $A = $B`, the pattern of the none arm, and called that answer sure. The task says in so many words that `var a = 1, b = 2;` does not count, so the fault is not in the wording. By the rule written down before that run, T09 counts against no weaker subject until it is reworded or a closed-book ceiling passes it. It passed T14, with a rule that asks for the last child and puts no `$$$` before `done`.

**What the passes support.** No closed-book Haiku subject wrote a T08 rule that ast-grep would run. The stronger model did. The help text and the published skill made no difference that one pass can show. On the code as it stood, the none arm passed one task fewer than the other two, and a difference of one task at one pass is not a finding.

One trace of the help text can be seen in the answers. The help subject added `--globs '!**/*.py'` to two commands. No other subject used a flag beyond the ones that give a pattern, a language or a rule.

**The skill holds one fact T08 needs.** Its reference file says:

> Every field within an ast-grep Rule Object is optional, but at least one "positive" key (e.g., `kind`, `pattern`) must be present.

The subject read that file: its report lists the read. It then wrote a rule with no such key. The file says that `regex` is not a positive rule. It does not say so of `nthChild`.

## What the subjects said about their own answers

Each closed-book subject was asked for one word per task: sure, unsure or guess. The words are in each `report.md`. This guide did not report them until 2026-11-11. The counts are on the code as it is now.

| | answers | passed |
|---|---|---|
| sure | 6 | 6 |
| unsure | 25 | 19 |
| guess | 11 | 8 |

All three subjects called T08 a guess. All three called T09 and T14 unsure. All three also called T06 and T11 a guess, and passed both.

The closed-book ceiling called 12 answers sure and 2 unsure. The two were T06 and T08, and both passed. Its one failure, T09, it called sure. No Haiku subject called a failed answer sure.

## What the open-book ceiling showed

The first ceiling subject could run ast-grep. By its own count it ran 236 commands. Most tasks took 0 to 2 tries before the answer it kept. It says it replaced several answers that were right on this code, so that they would also be right on code that is not here. The exceptions are the same traps:

- **T08**: 12 tries, 9 of them failures. It says seven were refused with "Rule must specify a set of AST kinds to match". The harness's record of its commands shows that refusal seven times. Its first try was the rule the help and skill subjects wrote: `nthChild: 2` and `inside`, and no kind.
- **T09**: 3 tries. The first, `var $NAME = $VALUE`, also matched the two-variable line.
- **T11**: `print($$$BEFORE, file=$TARGET, $$$AFTER)` matched one line of three. This is a second behaviour of `$$$`, and not the one in T14. A `$$$` at the start of a list can match nothing. But a comma written before a `$$$` must be in the code, so `print(x, file=f)`, with nothing after `file=f`, is not found.

So the stronger model's first rule for T08 was the same refused rule. It reached a rule that runs by trying, and by its own count nine failures came first.

The record of the ceiling's commands is not in this repository. What this section takes from it is said here and not shown.

## What the ceiling run could not decide from the wording

None of these changes a result on this code. Each is a place where a task says less than it should, so each is a way a future version of the code could make a correct answer look wrong.

- Tasks with no language tag (T01 to T09, T13, T14) do not say whether the same thing in a `.ts` or `.py` file counts. They mean the JavaScript files.
- T09: does `var {a, b} = o;` declare one variable? Is the head of a `for (var i = 0; …)` a `var` statement?
- T07: does a quoted key (`"key": 1`) or the short form `{ key }` count?
- T10: "match from the `def` keyword" rules nothing out, and `async def` starts at `async`.
- T03, T04: do generator declarations (`function*`) count?
- T01, T03, T05, T08, T14: do optional calls (`f?.()`) and tagged templates count?
- T02: "the same text" is compared as structure, so `f( 1 ) == f(1)` matches.
- T06: the example shows a semicolon, and the matched field ends before it.
- T12: for an exported interface, is the match the declaration or the whole `export` statement? The grader takes either.

## What this does not show

- One pass per arm. A difference of one task between arms is not a finding.
- The closed-book ceiling is one pass of one model. It shows that 13 of the 14 tasks can be answered from their wording. It does not show how often.
- The author of the tasks knew which traps to set. Two of the three are traps the author fell into while writing the reference answers.
- The code changed after the subjects ran. 24 lines were added: decoys, and five more expected matches, among them `finish(done, done)` and a `var` statement with no semicolon. A variable in one added line was later renamed, because its name was also declared with `let` three lines below. No answer was changed. The first version of the grader compared only the line a match starts on, and would have scored higher.
- A pass shows that an answer is right on this code. It does not show the answer is right in general. Each passing answer was read, and none passes by an accident that a reading can see. None was run against other code.
- Nothing here gives the cost of one task, or shows what a subject reasoned. The bench in [`../bench`](../bench) gives each task a cost of its own. No study has been run with it.

## The closed-book ceiling: what was written before it ran, and what came

The six lines below were written on 2026-11-11, before the run, and have not been changed. The run was to wait for the maintainer's go. The maintainer was asked, and answered that what was open should be done. Claude read that as the go.

- **What.** The request in `passes/none/request.md`, unchanged but for the directory, sent to the stronger model. One pass. No code, no tool.
- **Why.** It is the ceiling for the closed-book arms, and it was never run.
- **If it passes T08:** T08 can be answered from its wording. The three T08 failures above are then the subjects'.
- **If it fails T08:** T08 is reworded or dropped before any other pass. If it is kept, it says which kinds of node the argument may be.
- **For any other task it fails:** the task counts against no weaker subject until it is reworded, or a closed-book ceiling passes it.
- **Kept:** its request, its answers as they stand when it has finished, its report, and its output tokens for each message.

**What came.** 13 of 14, the same on the code as it was and as it is now.

- **It passed T08.** So T08 can be answered from its wording, and the three T08 failures are the subjects'.
- **It failed T09**, and no other task. So T09 counts against no weaker subject until it is reworded, or a closed-book ceiling passes it.
- **What is kept** is in `passes/closed-ceiling`. The subject made three calls: it read the tasks, wrote its answers once, and handed back its report. It wrote two messages, of 107 and 54,338 output tokens. Its answers were copied after it had finished.

## Claims this guide has taken back

2026-11-10, the first version:

1. It named one behaviour of `$$$`. There are two.
2. It said the published skill did not hold the fact that T08 needs. The skill holds one such fact.
3. It gave the help and skill arms 12 of 14, one more than the none arm. Every `var` statement in the code ended with a semicolon. With one that does not, all three arms have 11. A missing line of test code had made the difference.

2026-11-11, after every request, every answer and every line of ast-grep's output had been read for the first time:

4. It said all three subjects "wrote a rule made only of `nthChild` or `follows`", refused for having no positive part. One subject's rule was refused for another reason. The old grader printed only the first line ast-grep said, and that line is the same for both refusals.
5. It said all three "wrote `finish($$$ARGS, done)`". Two wrote two patterns.
6. It called T08 a failure of belief. Whether T08 can be answered closed-book was never measured.
7. It said nothing here measures reasoning before the answer, and that the harness reports only a total per subject. The harness's record holds the output tokens of each message.
8. It said the version of the Haiku model had not been checked. The record names it.
9. `passes/ceiling.txt` was copied while the ceiling subject was still working. Two of its lines differ from the file that subject finished with. The table's "14 of 14" was first written before the subject had finished. The finished file also passes 14 of 14.
10. It listed eight things the ceiling could not decide. The ceiling's report has nine.
11. It called itself local and unpublished after it had been pushed.

Each of 4 to 11 came from writing before reading: from a score, from the first line of an error, from memory, or from a file copied too early. The steps that would have caught them are now in [`AGENTS.md`](../AGENTS.md).

# 2026-11-11-first-ceiling-2: the ceiling again, under the request the study will send

The first part was written before the run.

- **What.** The stronger model, on each of the ten tasks of the set `first`, in variant 2. One task for one subject, with the code and ast-grep to run, and no guide. One try at each task.
- **Why.** The first ceiling passed all ten tasks, and showed that the request let a subject write outside its directory. The request now has one sentence changed and one added. A ceiling under an earlier request was not measured under this one. Variant 2 is used so that a second set of names meets a real subject before the study does.
- **What each outcome changes.** A task the ceiling passes goes into the study as it is. A task it fails is read first. If the fault is in the wording, the code, the names of the variant or the reference answer, the task is mended and its ceiling is run again. If the stronger subject had what it needed and was wrong, the task stays out of the study.
- **What a sign changes.** `keep.py` now writes down each sign that a subject left its directory. Each sign is read against the subject's commands. A try whose subject read an answer, a guide or another subject's work is not counted, and that task's ceiling is run again. If more than one subject wrote outside its directory, the new sentence does not hold, and the request is reworked before the study.
- **What is kept.** For each task: the request, the answer, the report, every call to ast-grep with any code that was piped in, the output tokens of each message, and the signs.
- **What it does not show.** How often the stronger model passes, or anything about the Haiku model or a guide.

## What came

Written after the run, from `python3 bench/score.py`, from the calls in each `calls.jsonl`, and from the harness's record of each subject's commands.

**The ceiling passed all ten tasks, under the request the study will send.** Each subject called its answer sure, and none changed the code. This is one try at each task, in variant 2.

**No subject left its directory.** `keep.py` wrote down no sign for any of the ten. A second look by hand agrees: no command names a path outside the subject's directory, every command starts with `cd` into it, and nothing new lay in the shared directory afterwards. Subjects still made files of their own. Six of them did, and each made them in its own directory.

| task | what it turns on | calls on the task's code | refused | first right call | output tokens before it | output tokens in all |
|---|---|---|---|---|---|---|
| T01 | a part found by its place | 3 | 1 | 2 | 2,738 | 4,551 |
| T02 | a part found by its place | 8 | 4 | 5 | 12,523 | 13,601 |
| T03 | a list with a fixed member | 11 | 0 | 4 | 1,334 | 5,030 |
| T04 | a list with a fixed member | 6 | 0 | 2 | 1,065 | 3,152 |
| T05 | a statement of one shape | 6 | 0 | 2 | 2,702 | 5,196 |
| T06 | a statement of one shape | 3 | 0 | 1 | 1,481 | 2,154 |
| T07 | control | 4 | 0 | 1 | 724 | 1,678 |
| T08 | control | 3 | 0 | 1 | 958 | 2,194 |
| T09 | control | 4 | 0 | 1 | 907 | 1,582 |
| T10 | control | 7 | 0 | 1 | 1,132 | 1,932 |

Calls on files of the subject's own, which are not in the table: 29 on T02, ten of them refused; six on T03; one each on T01, T04, T05 and T08.

What the calls show. None of it is a finding.

- **On the four control tasks and on T06 the first call was right,** as in the first ceiling.
- **T01 and T02: the first rule was refused again,** in the same words: "Rule must specify a set of AST kinds to match. Try adding `kind` rule." On T02 the subject added `pattern: $X` and got the same words again, as the first ceiling's subject did. It then made a file of test cases, and ran rules on it to learn which kinds this ast-grep knows. Two more of its rules for the task were refused before one was right: one for a `false` that YAML read as a boolean, and one with "Missing Selector".
- **T03: the pattern with a comma missed one line again.** `convey(satchel, $$$REST)` missed `convey(satchel)`. The subject's next pattern had no comma, `convey(satchel $$$REST)`, and was right. The guide of facts does not hold that.
- **T04 and T05: the first call was a pattern and was not right, and the second was a rule on kinds and was right.**

**Two tries at one task differ a good deal.** Both ceilings used the stronger model. Output tokens before the first right call, first ceiling and then second:

| task | first | second |
|---|---|---|
| T01 | 2,506 | 2,738 |
| T02 | 12,034 | 12,523 |
| T03 | 2,574 | 1,334 |
| T04 | 1,504 | 1,065 |
| T05 | 6,704 | 2,702 |
| T06 | 1,744 | 1,481 |
| T07 to T10 together | 5,101 | 3,721 |

Added up over T01 to T06, that is 27,066 and 21,843. The two runs differ in the variant and in two sentences of the request, so this is not the spread of one thing measured twice. It does show that on one task, two tries by one model can differ by more than a half. The study looks for a difference of a half. So no task of the study is read alone.

**What this changes.** The ten tasks go into the study as they are, with this request.

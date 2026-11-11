# 2026-11-11-ceiling: can each task be done, one at a time, with the tool in hand?

The first part was written before the run.

- **What.** The stronger model, on each of the 14 tasks in variant 1. One task for one subject, with the code and ast-grep to run, and no guide. That is the least any arm of a study would be given with the tool in hand. One try at each task.
- **Why.** A ceiling comes first. Before any weaker subject's pass rate is read, a stronger subject must pass every task as it is worded, with exactly what the weaker subject will be given. Variant 1 is used so that the variants meet a real subject as well.
- **What each outcome changes.** A task the ceiling passes can be counted against a weaker subject that has the tool in hand. A task it fails is read first. If the fault is in the wording, the code or the grader, the task is mended and its ceiling is run again. If the stronger subject had what it needed and was wrong, the task counts against no weaker subject until a ceiling passes it.
- **What is kept.** For each task: the request, the answer, the report, every call to ast-grep, and the output tokens of each message.
- **What it also gives, as data and no more.** How many calls and how many output tokens the stronger model spent before its first right call on each task. No reason will be given for a difference between two tasks.
- **What it does not show.** How often the stronger model passes. Anything about a weaker model or about a guide.

## What came

Written after the run, from `python3 bench/score.py` and from the calls in each `calls.jsonl`.

**The ceiling passed all 14 tasks.** Each subject called its answer sure, and none changed the code. So each task, in variant 1, can be done by the stronger model with the tool in hand and no guide. This is one try at each task. It does not show how often.

| task | calls on the task's code | refused | first right call | output tokens before it | output tokens in all |
|---|---|---|---|---|---|
| T01 | 6 | 0 | 1 | 1,553 | 2,311 |
| T02 | 5 | 0 | 1 | 2,399 | 4,411 |
| T03 | 5 | 0 | 1 | 2,922 | 4,540 |
| T04 | 11 | 6 | 1 | 1,632 | 13,772 |
| T05 | 5 | 1 | 1 | 3,155 | 9,208 |
| T06 | 14 | 3 | 5 | 3,390 | 17,406 |
| T07 | 5 | 0 | 1 | 3,198 | 8,351 |
| T08 | 148 | 28 | 146 | 19,226 | 20,797 |
| T09 | 6 | 0 | 3 | 38,914 | 42,573 |
| T10 | 4 | 0 | 1 | 1,131 | 1,840 |
| T11 | 4 | 0 | 1 | 1,341 | 2,982 |
| T12 | 4 | 0 | 1 | 1,095 | 2,052 |
| T13 | 9 | 4 | 1 | 2,820 | 4,777 |
| T14 | 5 | 0 | 4 | 12,006 | 12,371 |

Three things can be read from the calls. None is a finding: it is one try each.

- **Three tasks took more than 10,000 output tokens before a first right call:** T08, T09 and T14. They are the three tasks the Haiku subjects failed in the pilot. No reason is given here.
- **On T04, T05 and T13 the first call was right, and most of the tokens came after it.** The calls show what they went on. Each subject tried to make one command cover the TypeScript files as well: two `--inline-rules`, two rules joined by `---`, a list of rules. ast-grep refused each. The tasks do not say whether those files count, and the pilot's first ceiling said the same. So on these tasks the cost after a first right call is partly the wording's. The cost before it is not touched.
- **A count of calls is not a count of tries.** On T08 the subject ran rules in a loop to learn which kinds of node the code holds: 117 of its 148 calls ran and were not right. Its first three calls were each refused: two for naming no kind of node, and one for a `*` written as a kind.

**Three things went wrong with the run itself, and were mended.**

- **The first launch failed.** All 14 subjects stopped when the account's usage ran out. None had made a call to ast-grep or written an answer, and each directory was as `setup.py` had left it. The subjects were started again some three hours later, with the same requests in the same directories.
- **The bench counted refusals wrongly.** It ran each call again and called it refused when that failed. A call on a file of the subject's own fails that way, and so does a call for help. Reading the calls showed it: one task had seven refusals after a right first call, and two of them were nothing of the kind. A call is now refused when ast-grep ended it with an error as the subject made it, and that status is written down with the call. The self-check covers both cases.
- **The bench counted calls on other code as tries at the task.** This showed later the same day, in the ceiling of the first study's tasks. A call with `--stdin` searches code that is piped in. A call that names a directory of the subject's own searches that. Neither is a try at the task's code, and both are now counted apart. In this run that changed seven rows of the table: T02, T05, T06, T09, T11, T12 and T14. On T09 it changed the most. The subject made 42 calls on a directory of its own, and ten of those were refused. It made six calls on the task's code, none was refused, and the third was right. The table first said 16 calls, ten refused and the thirteenth right. The numbers above are from the count as it now stands. The output tokens are as they were: they are counted by the time of the first right call, and that call is the same one.

**What this changes.** All 14 tasks can be counted against a weaker subject that has the tool in hand. Before a study reads the cost in all, each task should say which files count.

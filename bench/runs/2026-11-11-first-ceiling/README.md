# 2026-11-11-first-ceiling: can each task of the first study be done?

The first part was written before the run.

- **What.** The stronger model, on each of the ten tasks of the set `first`, in variant 1. One task for one subject, with the code and ast-grep to run, and no guide. That is the least any arm of the study gives. One try at each task.
- **Why.** The study's tasks are new, and a ceiling comes first.
- **What each outcome changes.** A task the ceiling passes goes into the study as it is. A task it fails is read first. If the fault is in the wording, the code or the reference answer, the task is mended and its ceiling is run again. If the stronger subject had what it needed and was wrong, the task stays out of the study.
- **What is kept.** For each task: the request, the answer, the report, every call to ast-grep, and the output tokens of each message.
- **What it does not show.** How often the stronger model passes, or anything about the Haiku model or a guide.

## What came

Written after the run, from `python3 bench/score.py`, from the calls in each `calls.jsonl`, and from the harness's record of each subject's commands.

**The ceiling passed all ten tasks.** Each subject called its answer sure, and none changed the code. So each task, in variant 1, can be done by the stronger model with the tool in hand and no guide. This is one try at each task. It does not show how often.

| task | what it turns on | calls on the task's code | refused | first right call | output tokens before it | output tokens in all |
|---|---|---|---|---|---|---|
| T01 | a part found by its place | 6 | 2 | 3 | 2,506 | 3,944 |
| T02 | a part found by its place | 5 | 2 | 3 | 12,034 | 14,820 |
| T03 | a list with a fixed member | 5 | 0 | 3 | 2,574 | 4,905 |
| T04 | a list with a fixed member | 9 | 2 | 1 | 1,504 | 7,736 |
| T05 | a statement of one shape | 21 | 0 | 18 | 6,704 | 8,951 |
| T06 | a statement of one shape | 3 | 0 | 1 | 1,744 | 2,438 |
| T07 | control | 4 | 0 | 1 | 1,264 | 1,869 |
| T08 | control | 3 | 0 | 1 | 1,463 | 2,053 |
| T09 | control | 4 | 0 | 1 | 1,019 | 1,765 |
| T10 | control | 4 | 0 | 1 | 1,355 | 2,289 |

Several subjects ran each command twice, once plain and once with `--json`. So a count of calls is more than a count of tries.

What the calls show. None of it is a finding: it is one try each.

- **On the four control tasks the first call was right.** Each subject wrote between 1,019 and 1,463 output tokens before it.
- **T01 and T02: the first rule was refused.** Each subject first wrote a rule made of `nthChild` and `inside`, with no kind of node. ast-grep said: "Rule must specify a set of AST kinds to match. Try adding `kind` rule." On T02 the subject then added `pattern: $A`, and got the same words. On T01 the next rule listed five kinds and was right.
- **T02 cost the most, and the calls show on what.** After its two refusals the subject piped a line of code in 57 times, each time with a rule that named one kind of node, to learn which kinds this ast-grep knows. Nine of those were refused. Its answer lists 34 kinds.
- **T03: the first pattern ran and missed one line.** `shuttle(crate, $$$REST)` matched six of the seven expected calls. It missed `shuttle(crate)`. The subject's next call was a rule on kinds, and was right.
- **T05: the first pattern ran and matched one line too many.** `let $A = $B` also matched `let first = 1, second = 2;`. The subject then tried that pattern, and the same with a semicolon, under each of the six values of `--strictness`. None was right. Its answer keeps the pattern and adds a rule against a second declarator.
- **T04 and T06: the first call was right.** Neither subject began with a pattern. On T04 the subject then spent 6,232 more output tokens. It piped in code of its own making, with holes and comments in arrays, which the task's code does not hold.

**Two faults showed, and both were in the test.**

- **The bench counted calls on piped-in code as tries at the task.** A call with `--stdin` searches what is piped in, and no file. On T02 the bench first said 63 calls. Five were on the task's code. `score.py` now counts those calls apart, and the `ast-grep` a subject runs writes down what was piped in. It also counts apart a call that names a file of the subject's own, whether or not that file can still be found. The numbers above are from the mended count.
- **One subject wrote outside its directory, and the request had not forbidden it.** The harness tells every subject to put temporary files in one directory, which all subjects share. The request said only not to read outside the subject's own. The subject on T02 wrote three files to the shared directory: a script to print matches, a file of test cases, and its rule. Its commands read back those three, and name nothing else outside its directory. But its rule was the right answer to T02, and it lay where a later subject could have found it. In a study with three arms, that is a way for one arm's work to reach another.

**What was changed.**

- The three files were removed from the shared directory. So were the other copies of answers to these tasks that lay there: the directories of the ten finished subjects, and the working files of the agent that wrote the tasks. The repository and the harness's own records still hold the answers, on the same machine. Nothing can be done about that here but to look for signs.
- The request now says: "Do not read or write any file outside that directory, and do not use the network. If you need a file of your own, make it in that directory."
- `keep.py` writes down each sign that a subject left its directory, and `score.py` prints it. The tries above were kept before that, so `score.py` says of each that the signs were not looked for. They were looked for by hand in the harness's records: the T02 subject's three files are the only ones.

**What this changes.** The ten tasks can be done as they are worded. The request has changed, so by this repository's rule the ceiling is run again before the study: `2026-11-11-first-ceiling-2`.

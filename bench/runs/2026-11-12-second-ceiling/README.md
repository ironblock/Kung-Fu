# 2026-11-12-second-ceiling: can each task be done from its wording alone?

The first part was written before the run. The study is `../../studies/second.md`.

- **The first step: the kind of subject loads.** The study's subjects are of the kind `bench-subject-closed`. On 2026-11-12 two such subjects each read one file that has nothing to do with any task, and reported the one word in it. Each record says the subject was handed `Read`, `Write` and the tool that hands a report back, and nothing else. Each read 3,464 tokens before its request. The first study's subjects were handed 52 tools, and read about 62,900.
- **What.** The stronger model, as that kind of subject, on each of the ten tasks of the set `first`, once in each of the three arms, in variant 1: 30 tries. A subject gets `task.md` and the files of its arm's guide. It gets no code, and it can run nothing.
- **Why.** Both ceilings of the first study passed all ten tasks with the tool in hand. This one asks whether each can be done from the wording alone, and with each arm's guide.
- **What each outcome changes.** A task the ceiling passes in at least one arm goes into every arm of the study. A task it fails in every arm is read first. If the fault is in the wording or the reference answer, the task is mended and its ceilings run again. If not, nothing here could have passed it, and it is taken out of every arm before the study runs.
- **What is kept.** For each try: the request, the answer, the report, the output tokens of each message, each sign that the subject left its directory, the kind of subject and the tools it was handed.
- **What it does not show.** How often the stronger model passes, or anything about the Haiku model.

## What came

Written after the run, from `score.py`, `compare.py` and every answer.

**Every task passed in at least one arm. So all ten go into every arm of the study.**

| arm | tries passed, of 10 | output tokens |
|---|---|---|
| none | 9 | 239,390 |
| skill | 10 | 305,407 |
| facts | 10 | 192,180 |

This is one try at each task in each arm. None of what follows is a finding.

- **The one failure is the first fact.** With no guide, on T02, the stronger model wrote a rule made of positions and named no kind of node. ast-grep refuses it: "Rule must specify a set of AST kinds to match. Try adding `kind` rule." The subject called that answer unsure. In both arms with a guide the stronger model listed kinds of node and passed. The failure is sorted as the subject's: the wording says what counts, and this arm asks what a subject knows unaided.
- **T01 and T02 can be done from the wording.** A right answer there names kinds of node of the JavaScript grammar, and no guide lists them. The stronger model named them from memory, in every arm.
- **With no guide the stronger model was less sure.** It called 8 of its 10 answers unsure. With either guide it called 3 of 10 unsure. Every answer it called sure passed.
- **A try with no tool is not short for this model.** A subject wrote between 8,521 and 59,262 output tokens for one command: 736,977 in all. The study guessed about 2,000 for a Haiku try, from the pilot. The first group of the study will show what a Haiku try costs.
- **Each subject was what it should be.** Every record names the kind `bench-subject-closed`. For 21 of the 30 the harness also wrote the list of tools, and each list is `Read`, `Write` and the hand-back. No subject called any other tool, and none left a sign that it left its directory. Each read about 3,660 tokens before its request.
- **Most answers add options that the task did not ask for**, such as `--no-ignore hidden`, to be sure that every file is searched. The grader runs them as written.

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

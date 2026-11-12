# 2026-11-12-third-ceiling: can each `outline` task be done from its wording and a guide?

The first part was written before the run. The study is `../../studies/third.md`.

- **What.** The stronger model, as a subject of the kind `bench-subject-closed`, on each of the six tasks of the set `outline`, in variant 1, once in each of four arms: 24 tries. A subject gets `task.md` and the files of its arm. It gets no code and can run nothing.
- **The arms, and what each is given.**

| arm | the file | characters | its SHA-256 sum begins |
|---|---|---|---|
| none | nothing | 0 | |
| outline-skill | `SKILL.md`, from `ast-grep/skills/outline` in <https://github.com/ast-grep/agent-skill> at commit `0613dc7` | 3,436 | `ebd4c3a7` |
| help | `help.txt`, what `ast-grep outline --help` prints in 0.51.1 | 7,939 | `488433c9` |
| facts | `facts.md`, from `../../guides/outline` | 925 | `460bb561` |

- **Why.** A task goes into the study when a stronger subject can do it with exactly what an arm's subject is given. The stronger model did not know `outline` either, so its try with nothing is expected to fail, and says that the task cannot be guessed.
- **What each outcome changes.** A task the ceiling passes in at least one arm with a guide goes in. A task it fails in all three is read first. If the fault is in its wording or its expected items, it is mended and its ceilings run again. If not, it is taken out before the study runs.
- **What is kept.** For each try: the request, the task as the subject read it, the answer, the report, the output tokens of each message, each sign that the subject left its directory, the kind of subject and the tools it was handed.
- **What it does not show.** How often the stronger model passes, or anything about the Haiku model. There is no ceiling here for the arm "other skill" or for the control tasks: the maintainer agreed to that with the go.

## What the test takes for granted

Each points at words in a kept request or task, at the kind of subject, or at a check that runs.

1. **The subject cannot run the tool or look anything up.** Its kind is handed `Read` and `Write`, and `keep.py` keeps no try from another kind. The request says: "You cannot run ast-grep."
2. **The subject knows that it will not see the code.** The request says: "You cannot see the code either. The `src` that the task speaks of is not in that directory". This line is new. Both fresh readers said its want could be read as a broken setup.
3. **The subject's directory holds `task.md` and its arm's files, and nothing else.** `setup.py` writes them, and `setup.json` lists them.
4. **The subject knows which subcommand is wanted.** Every task begins "An `ast-grep outline` command that lists", and `task.md` says: "in the form `ast-grep outline ... src`".
5. **The answer is one line, and `src` is the path.** `task.md` says both. The grader reads the first line that is not empty. It takes `src`, `src/` and `./src` alike, and it leaves out an answer's own `--json`: both were refusals until a fresh reader asked what the grader does with them. The self-check covers each.
6. **The grader reads the line as a shell does.** A `|` or a `(` with no quotes is refused, as a shell would not pass it on. A `$` that ends a word stands for itself, with or without quotes: `--match ^name$` was a refusal until today. The self-check covers it. The task does not say how the line is run, and a subject may fear that a quoted `|` breaks "No pipes".
7. **The subject knows what is graded.** `task.md` says: "It is graded on which top-level items it lists. ... How the items are shown does not matter." The grader asks for JSON and takes the top-level items, and the self-check shows that every view gives the same ones.
8. **The wording alone settles what counts.** The tasks' author checked each reference answer and several wrong ones. This ceiling is the other check.
9. **The subject does not know `outline`.** The probe `../2026-11-12-probe-known` supports it for the Haiku model. This run's arm with none, and the first round of the study's, ask it task by task.
10. **For the control tasks: the subject knows how to write a whole rule on one line.** `task.md` does not say how. In the second study all 87 inline rules of subjects with no guide had their braces, and the nine that failed on form had read a guide that shows rules another way. The guides this study gives beside a control task show no rule at all. So the line is left as it was, and this is the reason.

**Not checked:** what the harness's own instructions say, about 3,700 tokens that each subject reads first. A subject's reasoning is not kept.

## The fresh readers

On 2026-11-12 two fresh readers, the stronger model with no tool, each read one request and its task: T05 of the set `outline`, and T08 of the control tasks. Each said rightly what is asked and in what form, and neither found the two texts at odds.

**Changed for what they found:** the line that says the code is not there, the three ways the grader reads a path, a `--json` and a `$`, all told above.

**Left, and why.**

- "Every file counts" can be read as a hint that some files are hidden, and a subject may add flags for that. The grader runs what is written.
- T05 does not say whether `export default name;` counts. The tasks' author lists it as unsettled: `outline` never lists such a statement, and the code holds none.
- The control task does not say how a rule goes on one line. See 10 above.
- One word must say how sure a subject is of its answer.

**What they answered.** The reader of T05 wrote `ast-grep outline --kind export src` and called it a guess: "I have no reliable memory of an `outline` subcommand or its options." The reader of T08 wrote a rule in braces and called it sure.

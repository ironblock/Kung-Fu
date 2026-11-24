# 2026-11-13-third-shell-ceiling: the five `outline` tasks with the tool in hand and no guide, by the stronger model

This was written before the run. The study is `../../studies/third.md`. The round this is the ceiling of is `../2026-11-13-third-shell`.

- **What.** The stronger model, as a subject of the kind `bench-subject`, on T01, T02, T03, T04 and T06 of the set `outline`, in variant 1, with nothing but the task: five tries. A subject gets `task.md`, the code under `src`, and `bin/ast-grep`, which writes down each call and then runs ast-grep 0.51.1. It has a shell and its files.
- **The first try is the check try.** No subject of this kind has run. T01 is sent alone, kept and read to its last line before the other four are sent: the kind and the tools the harness wrote down, each call the tool's record holds, each sign that the subject left its directory, and what `score.py` says of each call to `outline`.
- **A fresh reader reads one request of this kind first,** as `AGENTS.md` asks: the request has not been sent with an `outline` task before. What it finds is told below, before any try.
- **Why.** A ceiling comes first. It says whether each task can be done as it is worded with exactly what the round's subjects are given.
- **What each outcome changes.** A task the ceiling fails is read. If the fault is in the request, the wrapper or the grader, it is mended and that try is run again. If the stronger model had what it needed and still failed, the task stays in the round, and the failure is told beside the Haiku model's: the round asks how a subject with the tool fares on these five tasks, and a trap that catches the stronger model too is part of the answer.
- **What it does not show.** How often the stronger model passes: it is one try a task.
- **What it should cost,** guessed from the ceilings of the first study, where a try with the tool wrote about 5,000 output tokens on a part of the tool the model knew: about 25,000, and likely more here.

## What the fresh reader found, before any try

Written on 2026-11-13. A fresh reader was sent one request of this kind, for T03 in variant 2, in a directory of its own that is not kept here. It said what the request asks before it opened the directory, then did the task, and then told what did not agree.

- **A shell call does not keep what an earlier one set.** The request gave one `export` for `PATH`, and each call of the reader's shell started fresh: without the `export` there was no `ast-grep` at all. **Mended.** The request now says: "A shell call may not keep what an earlier one set. If ast-grep is not found, put bin on your PATH again in that call." The 25 requests of this run and of the round had been made and not sent. They were made again.
- **`bin/ast-grep` is a script.** It runs the real program and writes each call down, and both lie outside the subject's directory. A subject that reads the script sees where the real program is, and could call it and leave no record. Not changed: the round's note says what becomes of such a try, and `keep.py` writes down each place outside its directory that a subject names.
- **The directory's path names the arm, the task and the variant.** So it does in every study. With a shell, a subject can also list the directories beside its own, where other subjects of the same round work at the same task in another variant. Not changed: `keep.py` writes down a climb out of the directory, and such a try is read for what it saw.
- **The request's line A asks "what the task asks you to find", and the task asks for a command.** The words are those of every study, and are not changed.
- **What the tool says of a wrong command.** A wrong value for `--items` is refused, with the right values and "a similar value exists: 'imports'". A wrong type is refused with no list of the types: the reader learned a type's name only from the names that a list prints. A wrong command that the tool takes ends with 0 and no warning.
- **The reader found `outline --help` by itself,** made 25 calls, 22 of them to `outline` on the code, and wrote `ast-grep outline --items imports --match '^"\./docket\.js"$' src`, which is right. It called its answer sure.
- **The code can be checked by eye:** 320 lines in seven files.
- **Nothing in the directory gives an answer away.** The task names each thing not to list, nearly in the words of the code, so what is left to find is the flags.

## What the test takes for granted

1. **The subject can run the tool.** `bin/ast-grep` runs ast-grep 0.51.1, and the request says how to reach it in each shell call.
2. **The subject can see the code,** and it is short enough to read whole.
3. **The subject knows which subcommand is wanted.** `task.md` says: "in the form `ast-grep outline ... src`".
4. **Each call the subject makes through `bin` is written down, and no other.** A call to another ast-grep leaves no record.
5. **The last answer is graded as it is written, on the top-level items it lists.** Each call is judged the same way, since 2026-11-13, and the self-check covers it.
6. **The subject stays in its directory.** The request says so, and `keep.py` writes down each sign that it did not.

## What came

Written on 2026-11-13, after the five tries were kept. Every answer and every call was read.

**With the tool in hand and no guide, the stronger model passed all five tasks, once each.**

| task | the answer | calls on the task's code | the first right one | output tokens | before the first right call |
|---|---|---|---|---|---|
| T01 | `--items structure --type class` | 7 | call 1 | 2,031 | 952 |
| T02 | `--items exports --type function --match '^latch$'` | 20, of which 2 refused | call 4 | 5,219 | 1,490 |
| T03 | `--items imports --view signatures --match '^"\./roster\.js"$'` | 8 | call 3 | 3,138 | 1,702 |
| T04 | `--items exports --type constant,variable` | 8 | call 3 | 4,435 | 1,810 |
| T06 | `--items structure --type function --match '^\s*(export\s+(default\s+)?)?(async\s+)?function\b'` | 13 | call 6 | 4,083 | 1,351 |

- **The check try was T01, and it held.** The harness wrote down the kind `bench-subject` and the six tools of that kind with the hand-back. The tool's record holds nine calls. `score.py` judged the seven on the task's code, five right and two not, and each judgement agrees with the items the command lists. No sign that the subject left its directory. The other four were sent after that.
- **Every subject asked for the help first.** Each one's first two calls are `ast-grep --version` and `ast-grep outline --help`. None was told that `outline` has a help of its own.
- **On T06 the stronger model ran the plain command, and then mended it.** Of all its calls, the fifth is `ast-grep outline --items structure --type function --view signatures src`, which lists the four arrow functions. Its next calls look closer, and from the eighth on it has the `--match`. It had read every file of the code first, as it did in all five tries. With the skill and no tool it wrote the plain command in 7 tries of 12, as `../2026-11-13-third-label-a` tells.
- **On T04 it wrote the reference answer,** with the types `constant` and `variable`. No text of the study's arms but the facts guide gives those names. The names of the types stand in what `outline` prints.
- **No task is at fault,** so all five go into the round as they are. The four answers and their calls were read when they were kept, and the round was sent then. This section was written and committed while the round ran.
- **What it cost.** 18,906 output tokens of the stronger model. The guess was 25,000.

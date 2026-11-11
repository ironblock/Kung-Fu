# The bench

The instrument for Kung Fu. It gives each task a cost of its own, and it counts what a subject tried before it was right.

The pilot gave one subject all 14 tasks at once. So no task had a cost, and nothing showed how many tries came before an answer. The bench fixes both. It measures nothing by itself: a study is still to be written down and run.

## How one run goes

One subject gets one task.

```sh
python3 ../pilot/build.py /path/to/ast-grep
python3 setup.py /path/to/ast-grep /a/work/directory 2026-11-11-check none T08
```

`setup.py` writes two things.

- **For the subject**, in the work directory, which is outside this repository: `task.md`, the code under `src`, and `bin/ast-grep`. That `ast-grep` writes down every call the subject makes and then runs the real program. With `--closed` the subject gets `task.md` alone, and can run nothing.
- **For the record**, under `runs/<run>/<arm>/<task>/`: `request.md`, the words to send, made before any subject sees them.

Send `request.md` to a subject. When the subject has finished:

```sh
python3 keep.py 2026-11-11-check none T08 --claude-code /path/to/the/subagent/record.jsonl
python3 score.py /path/to/ast-grep runs/2026-11-11-check
```

`keep.py` copies beside the request: the answer as the subject left it, its report word for word, every call it made to ast-grep, and the output tokens of each message it wrote. It keeps nothing unless the harness's record shows that the subject has finished.

`score.py` prints every answer and every line ast-grep said about it. The totals come last and cannot be printed alone.

## What the numbers are

- **Passed.** The answer in `answer.txt` matches exactly the expected pieces of code. `pilot/grade.py` says how that is judged.
- **Calls.** Each time the subject ran `ast-grep run` or `ast-grep scan` on the task's code. Each call is run again on `pilot/clean` and is one of three things. Refused: ast-grep would not run it. Not right: it ran, and matched something other than the expected code. Right: it matched exactly the expected code.
- **The first right call.** How many calls the subject made up to and including the first right one. A subject can make a right call and still hand in another answer. So this is not the verdict.
- **Output tokens.** Everything the subject wrote, its reasoning included, as the harness counts it.
- **Before the first right call.** The output tokens of every message the subject wrote before that call started. This is the cost Kung Fu is about: what a subject spends before it is first right.

A call that reads a file the subject made for itself cannot be run again here. It is counted apart. So is a call for help or for the version.

## What a number does not say

A cost says how much a subject spent. It does not say why. A subject spends a lot on a hard task, and as much on a task that cannot be done. So the bench also keeps two things the pilot lacked:

- **What the subject took the task to be.** Each request asks for one sentence, in the subject's own words. A subject that answered another question says so here.
- **Whose failure it is.** A person who has read the request, the answer and the calls writes one line in `whose.txt` beside the answer. It starts with `the subject's`, `the test's` or `not known`. `score.py --strict` fails while any failure is not sorted.

The reasoning itself is not kept: the harness's record stores it empty.

## What it reads

`keep.py --claude-code` reads the record that Claude Code keeps of a subagent. Each subject there also receives the harness's own instructions, about 62,800 tokens by its count, before the request. Another harness needs a reader of its own. The rest of the bench does not depend on the harness.

## Checking the bench itself

```sh
python3 selfcheck.py /path/to/ast-grep
```

It plays a subject by hand, with no model: three calls, the third one right, and a record of four messages around them. Then it keeps and scores the run, and compares what is printed with what must be so. It also checks that a subject that has not finished is not kept, and that `--strict` fails on a failure nobody has sorted.

## Not here yet

- **Variants of a task.** A subject passes a task when every one of k tries passes, over variants of the task and not one string repeated. The bench has one wording of each task.
- **A ceiling for each arm.** Before any pass rate is read, a stronger subject does every task with exactly what the arm's subject is given.
- **Any study.** None is written down yet.

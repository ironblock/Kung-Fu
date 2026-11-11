# The bench

The instrument for Kung Fu. It gives each task a cost of its own, and it counts what a subject tried before it was right.

The pilot gave one subject all 14 tasks at once. So no task had a cost, and nothing showed how many tries came before an answer. The bench fixes both. It measures nothing by itself: a study is still to be written down and run.

## How one run goes

One subject gets one task, in one variant of it.

```sh
python3 build.py /path/to/ast-grep
python3 setup.py /path/to/ast-grep /a/work/directory 2026-11-11-check none T08 --variant 1
```

`build.py` makes the variants: the same tasks with other names in them. Variant 0 is the pilot as it stands. In variant 1 the function `pair` is `join`, and so on through the code, the wording of each task and the reference answers. The build stops unless every reference answer still matches exactly the marked lines.

`setup.py` writes two things.

- **For the subject**, in the work directory, which is outside this repository: `task.md`, the code under `src`, and `bin/ast-grep`. That `ast-grep` writes down every call the subject makes and then runs the real program. With `--closed` the subject gets `task.md` alone, and can run nothing.
- **For the record**, under `runs/<run>/<arm>/<task>/v<variant>/`: `request.md`, the words to send, made before any subject sees them.

Send `request.md` to a subject. When the subject has finished:

```sh
python3 keep.py 2026-11-11-check none T08 --variant 1 --claude-code /path/to/the/subagent/record.jsonl
python3 score.py /path/to/ast-grep runs/2026-11-11-check
```

`keep.py` copies beside the request: the answer as the subject left it, its report word for word, every call it made to ast-grep, and the output tokens of each message it wrote. It keeps nothing unless the harness's record shows that the subject has finished.

`score.py` prints every answer and every line ast-grep said about it. The totals come last and cannot be printed alone.

## What the numbers are

- **Passed.** The answer in `answer.txt` matches exactly the expected pieces of code. `pilot/grade.py` says how that is judged. One answer is one try.
- **A task passed on every try.** A subject passes a task when each of its tries passed, and each try is on another variant. An answer learned by heart for one variant names things the next variant does not have. The share of single tries that passed is printed beside it.
- **Calls.** Each time the subject ran `ast-grep run` or `ast-grep scan` on the task's code. Each call is run again on the code of its variant and is one of three things. Refused: ast-grep would not run it. Not right: it ran, and matched something other than the expected code. Right: it matched exactly the expected code.
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

`keep.py --claude-code` reads the record that Claude Code keeps of a subagent. Each subject there also receives the harness's own instructions before the request: more than 60,000 tokens, by its count. Another harness needs a reader of its own. The rest of the bench does not depend on the harness.

## Checking the bench itself

```sh
python3 selfcheck.py /path/to/ast-grep
```

It plays a subject by hand, with no model: three calls, the third one right, and a record of four messages around them. Then it keeps and scores the try, and compares what is printed with what must be so. On a second variant it hands in the answer that was right on the first, and checks that the try fails. It also checks that a subject that has not finished is not kept, and that `--strict` fails on a failure nobody has sorted.

## Not here yet

- **Variants of every task.** Six of the 14 tasks turn on a name of their own, and those have four variants. The other eight, such as every call to `console.log`, read the same in every variant. A variant changes names only: never what a task asks.
- **A ceiling for each arm.** Before any pass rate is read, a stronger subject does every task with exactly what the arm's subject is given.
- **Any study.** None is written down yet.

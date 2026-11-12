# The bench

The instrument for Kung Fu. It gives each task a cost of its own, and it counts what a subject tried before it was right.

The pilot gave one subject all 14 tasks at once. So no task had a cost, and nothing showed how many tries came before an answer. The bench fixes both. It measures nothing by itself: a study says what is compared.

## What is here

- `sets/` holds sets of tasks. `sets/first` is the set of the first study. With no set named, a task is one of the pilot's 14, in `../pilot`. `setup.py` and `build.py` take `--set`.
- `guides/` holds what an arm of a study gives its subject besides the task.
- `studies/` holds each study, written down before it runs. `studies/first.md` and `studies/second.md` have run, and each says what came.
- `runs/` holds every run: its note, and for each try the request, the answer, the report, the calls and the record.

## How one run goes

One subject gets one task, in one variant of it.

```sh
python3 build.py /path/to/ast-grep
python3 setup.py /path/to/ast-grep /a/work/directory 2026-11-11-check none T08 --variant 1
```

`build.py` makes the variants: the same tasks with other names in them. Variant 0 is the pilot as it stands. In variant 1 the function `pair` is `join`, and so on through the code, the wording of each task and the reference answers. The build stops unless every reference answer still matches exactly the marked lines.

`setup.py` writes two things.

- **For the subject**, in the work directory, which is outside this repository: `task.md`, the code under `src`, and `bin/ast-grep`. That `ast-grep` writes down every call the subject makes and then runs the real program. Code that the subject pipes in is written down with the call. With `--closed` the subject gets `task.md` alone, and can run nothing.
- **For the record**, under `runs/<run>/<arm>/<task>/v<variant>/`: `request.md`, the words to send, made before any subject sees them.

Send `request.md` to a subject. When the subject has finished:

```sh
python3 keep.py 2026-11-11-check none T08 --variant 1 --claude-code /path/to/the/subagent/record.jsonl
python3 score.py /path/to/ast-grep runs/2026-11-11-check
```

`keep.py` copies beside the request: the answer as the subject left it, its report word for word, every call it made to ast-grep, and the output tokens of each message it wrote. It keeps nothing unless the harness's record shows that the subject has finished, and that the request it received is `request.md`, word for word. It also writes down each sign that the subject left its directory.

`score.py` prints every answer and every line ast-grep said about it. The totals come last and cannot be printed alone.

```sh
python3 compare.py /path/to/ast-grep runs/2026-11-11-first
```

`compare.py` sets the arms of a run side by side, after the tries have been read. For each group of tasks the set names, it adds up what each arm spent before it was first right, and says of each pair of arms whether one spent half of the other or less. It says "shown" only when the sum and the median agree. A try that never made a right call counts for all it wrote.

Subjects with no tool make no call, so their arms are compared by whether each answer passed, try against try. `compare.py` then gives one of three answers: a difference of a quarter of the pairs is shown, there is no difference that large, or it cannot tell. Its own first lines say how each is reached.

## The subject, and what it is handed

A subject should be handed what the task needs and nothing more. In the first study each subject was a general subagent of Claude Code, and was handed 52 tools: a shell, its files, and 46 others. Fifty of the 90 called one of the others.

Two kinds of subject are defined in `.claude/agents` of this repository:

- `bench-subject` has a shell and its files: `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep`.
- `bench-subject-closed` can read and write files: `Read`, `Write`. It can run nothing.

`setup.py --subject KIND` writes down which kind a try is for, and `keep.py` then keeps the try only from a subject of that kind. Claude Code writes beside each record what kind of subagent it was and every tool it was handed. `keep.py` puts both in `record.json`, and `score.py` prints them.

Claude Code reads a new directory of definitions when a session starts. No subject of either kind has run yet.

## A whole run, in Claude Code

```sh
python3 claude_code.py 2026-11-11-first --records /path/to/the/session/subagents \
    --wait 540 --model-starts claude-haiku --model-as "a Haiku model" --remove-work
```

`claude_code.py` finds each try's record by the request the subject was sent, waits for the subjects to finish, checks which model each record names, keeps every finished try through `keep.py`, prints each sign that a subject left its directory, and removes the directory of each subject it has kept. The harness runs 20 subagents at once, so a run starts in groups, and each group should hold every arm.

## What the numbers are

- **Passed.** The answer in `answer.txt` matches exactly the expected pieces of code. `pilot/grade.py` says how that is judged. One answer is one try.
- **A task passed on every try.** A subject passes a task when each of its tries passed, and each try is on another variant. An answer learned by heart for one variant names things the next variant does not have. The share of single tries that passed is printed beside it.
- **Calls.** Each time the subject ran `ast-grep run` or `ast-grep scan` on the task's code: on `src`, on a file under it, or on the directory that holds it. Each call is one of three things. Refused: ast-grep ended it with an error when the subject made it. Not right: it ran, and matched something other than the expected code. Right: it matched exactly the expected code. To see what a call matched, it is run again on the code of its variant.
- **The first right call.** How many calls the subject made up to and including the first right one. A subject can make a right call and still hand in another answer. So this is not the verdict.
- **Output tokens.** Everything the subject wrote, its reasoning included, as the harness counts it.
- **Before the first right call.** The output tokens of every message the subject wrote before that call started. This is the cost Kung Fu is about: what a subject spends before it is first right.

Three kinds of call are no try at the task's code, and are counted apart, with how many of them ast-grep refused:

- a call for help or for the version;
- a call that names a file or directory of the subject's own, in place of `src`;
- a call with `--stdin`, which searches code that the subject piped in.

A subject uses the last two to learn how the tool behaves. In one run a subject piped a line of code in 57 times, each time with a rule that named one kind of node. Counted as tries at the task, those made 63 calls of 5.

## Did the subject stay in its directory?

The request tells the subject to work in its directory only, and to make any file of its own there. Nothing holds it there. In this harness the subject works on a machine that also has the answers, the guides and the other subjects' work, and the harness's own instructions point every subject at one shared directory for temporary files.

So `keep.py` reads every call the subject made to one of its tools, and writes down each sign that it left:

- a full path that exists on the machine and is not in the subject's directory;
- a word that climbs with `..`, or starts from the home directory;
- a shell command that does not start with `cd` to the subject's directory;
- a search for files, or in files, with no place named.

`score.py` prints each sign beside the try. A sign is not a breach: a reader judges it. A shell command can also go where its words do not say. So a try with no sign is not proven clean.

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

It plays a subject by hand, with no model: three calls on the task's code, the third one right, and a record of four messages around them. Beside them it makes calls for help, on files of its own and on code it pipes in, and its record holds four signs that it left its directory. Then it keeps and scores the try, and compares what is printed with what must be so. On a second variant it hands in the answer that was right on the first, and checks that the try fails. It also checks that a subject that has not finished is not kept, and that `--strict` fails on a failure nobody has sorted.

## Not here yet

- **Variants of every task.** Six of the pilot's 14 tasks turn on a name of their own, and those have four variants. The other eight, such as every call to `console.log`, read the same in every variant. In the set `first`, seven of the ten tasks are worded with a name of their own. A variant changes names only: never what a task asks.
- **A ceiling with a guide in hand.** Each ceiling so far gave the stronger subject the task, the code and the tool, and no guide. That is the least any arm gives. It does not show what a guide does to a stronger subject.
- **A finding.** The first study has run: `runs/2026-11-11-first`. No arm spent half of what another spent, and every arm passed every task. One study of one model on ten tasks is data, and it is not a finding. The second study has run too: `runs/2026-11-12-second-a`, `-b` and `-c`. By its own rule it cannot tell whether the three facts raise how often a command is right.
- **A subject with a shell and its files only, seen to work.** The two kinds are defined, and the bench keeps a try only from the kind it is for. The kind with no shell ran in the second study and its ceilings: 390 subjects. Every list of tools that the harness wrote down for one is `Read`, `Write` and the hand-back. The kind with a shell has not run.

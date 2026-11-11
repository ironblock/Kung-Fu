# Pilot: writing ast-grep queries

A local, unpublished pilot for Kung Fu. It asks one question: when a model writes an
`ast-grep` command from a description, with no way to run it, is the command right?

## What is here

- `tasks.md`: 14 tasks. Each describes some code and asks for one command that finds it.
- `marked/`: the code the commands run against. A marker ends each line where an
  expected match starts. The markers are the ground truth, placed by hand. A subject
  never sees this code.
- `reference/answers.txt`: one correct answer per task.
- `build.py`: strips the markers into `clean/`, runs the reference answers, stops unless
  they start on exactly the marked lines, and writes `oracle.json`.
- `grade.py`: runs an answers file and compares exact spans. A match on the right line
  that is the wrong piece of code does not pass. A command a shell would read
  differently (a `$` in double quotes, a pipe) is refused.
- `passes/`: the answers from the first pass of each arm.

```sh
python3 build.py /path/to/ast-grep
python3 grade.py /path/to/ast-grep passes/none.txt
```

## The first pass (2026-11-10, ast-grep 0.51.1, one pass per arm)

| arm | what the subject had | result |
|---|---|---|
| ceiling | a stronger model, the code, and ast-grep to run | 14 of 14 |
| none | the tasks only | 11 of 14 |
| help | the tasks and `ast-grep --help` text | 12 of 14 |
| skill | the tasks and the published ast-grep skill | 12 of 14 |

The three closed-book arms ran on the harness's Haiku model. Which Haiku version served them was not checked. They failed the same tasks:

- **T08** (the second argument of a call): all three wrote a rule made only of
  `nthChild` or `follows`. ast-grep refuses a rule with no positive part.
- **T14** (the last argument is `done`): all three wrote `finish($$$ARGS, done)`.
  `$$$` takes as little as it can and never backs up, so `finish(done, done)` is missed.
- **T09** (a `var` with exactly one variable): `var $A = $B` also matches
  `var a = 1, b = 2`. The two arms that passed had written the semicolon.

Neither the help text nor the published skill corrected T08 or T14.

The ceiling run could execute ast-grep, and reported what it took to get there: 236
runs in all. Most tasks took 0 to 2 tries before the answer it kept. The exceptions are
the same traps:

- **T08**: 12 tries, 9 of them failures. Seven were refused with "Rule must specify a
  set of AST kinds to match".
- **T09**: 3 tries. The first, `var $NAME = $VALUE`, also matched the two-variable line.
- **T11**: `print($$$BEFORE, file=$TARGET, $$$AFTER)` matched one line of three. This is
  the `$$$` trap again, in Python.

So the stronger model holds the same wrong beliefs. Being able to run the tool is what
let it recover, at the cost of those tries.

## What the ceiling run could not decide from the wording

None of these changes a result on this code. Each is a place where a task says less
than it should, so each is a way a future version of the code could make a correct
answer look wrong.

- Tasks with no language tag (T01 to T09, T13, T14) do not say whether the same thing in
  a `.ts` or `.py` file counts. They mean the JavaScript files.
- T09: does `var {a, b} = o;` declare one variable? Is the head of a `for (var i = 0; …)`
  a `var` statement?
- T07: does a quoted key (`"key": 1`) or the short form `{ key }` count?
- T10: "match from the `def` keyword" rules nothing out, and `async def` starts at `async`.
- T03, T04: do generator declarations (`function*`) count?
- T01, T03, T05, T08, T14: do optional calls (`f?.()`) and tagged templates count?
- T02: "the same text" is compared as structure, so `f( 1 ) == f(1)` matches.
- T06: the example shows a semicolon, and the matched field ends before it.

## What this does not show

- One pass per arm. A difference of one task between arms is not a finding.
- The author of the tasks knew which traps to set. Two of the three are traps the
  author fell into while writing the reference answers.
- The `finish(done, done)` case and several decoys were added after the passes ran,
  on a reviewer's advice, without looking at the answers. The first version of the
  grader compared only the line a match starts on, and would have scored higher.
- Nothing here measures reasoning before the answer. This harness reports total tokens
  per subject, which are mostly fixed overhead.

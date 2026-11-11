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
| help | the tasks and `ast-grep --help` text | 11 of 14 |
| skill | the tasks and the published ast-grep skill: `SKILL.md` and `references/rule_reference.md` | 11 of 14 |

The three closed-book arms ran on the harness's Haiku model. Which Haiku version served them was not checked. They failed the same three tasks:

- **T08** (the second argument of a call): all three wrote a rule made only of
  `nthChild` or `follows`. ast-grep refuses a rule with no positive part.
- **T14** (the last argument is `done`): all three wrote `finish($$$ARGS, done)`.
  `$$$` stops at the first argument that fits what comes next in the pattern, and
  never tries again. So `finish(done, done)` is missed.
- **T09** (a `var` with exactly one variable): all three wrote a pattern, and each
  pattern is wrong in one direction. `var $A = $B` matches more than it reads as: it
  also finds `var a = 1, b = 2`. `var $A = $V;` matches less: it does not find a
  statement that ends with no semicolon.

So the help text and the published skill made no difference that this pass can show.

The skill does carry the fact that T08 needs. Its reference file says that "at least
one 'positive' key (e.g., `kind`, `pattern`) must be present". The subject was given
that file, was told to read it, and wrote a rule with no such key. One sentence among
297 lines did not prevent the mistake. The file does not say that `nthChild` is not
such a key.

The ceiling run could execute ast-grep, and reported what it took to get there: 236
runs in all. Most tasks took 0 to 2 tries before the answer it kept. The exceptions are
the same traps:

- **T08**: 12 tries, 9 of them failures. Seven were refused with "Rule must specify a
  set of AST kinds to match".
- **T09**: 3 tries. The first, `var $NAME = $VALUE`, also matched the two-variable line.
- **T11**: `print($$$BEFORE, file=$TARGET, $$$AFTER)` matched one line of three. This is
  a second behaviour of `$$$`, and not the one in T14. A `$$$` at the start of a list
  can match nothing. But a comma written before a `$$$` must be in the code, so
  `print(x, file=f)`, with nothing after `file=f`, is not found.

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
- A `var` statement with no semicolon was added on 2026-11-11, also after the passes
  ran. A second reader of this pilot saw that every `var` statement in the code ended
  with one. No answer was changed. Before it, the help and skill arms scored 12 of 14,
  and that one task was the whole difference between the arms. A missing line of test
  code had made it.
- The first version of this guide named one behaviour of `$$$` where there are two, and
  said the published skill did not hold the fact that T08 needs. It does.
- Nothing here measures reasoning before the answer. This harness reports total tokens
  per subject, which are mostly fixed overhead.

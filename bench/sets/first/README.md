# The task set of the first study

Ten tasks about JavaScript code, for ast-grep 0.51.1. Every file under `src` counts, and each task says what counts and what does not.

| tasks | what they turn on |
|---|---|
| T01, T02 | a part of something, found by its place: the last parameter, the first element |
| T03, T04 | a list with a fixed first or last member, and any number of others |
| T05, T06 | a statement of one exact shape, with or without a semicolon |
| T07 to T10 | none of these. They are the control |

The first six turn on the three facts of the guide in `../../guides/facts`, two tasks to a fact. None of them is a task of the pilot.

## Who wrote it, and from what

A fresh agent wrote the tasks, the code and the reference answers on 2026-11-11. It was given one line about each task: what the task should ask for, and which cases the code must hold. It was told not to read the guide, the study, the pilot's tasks or any kept run. The harness's record of it shows the files it opened: `bench/sets.py`, `bench/variants.py`, `bench/build.py`, `pilot/build.py`, `pilot/grade.py`, and its own. The harness also put this repository's `AGENTS.md` in front of it, which holds no task and no fact about ast-grep.

The lines it was given were written by the author of the guide. So the two are kept apart by one step, not by two.

## What the author checked

- `build.py` passes in all four variants: 70 expected matches.
- For T01 to T06, the command a newcomer would write first does not pass: it is refused, or matches too much, or misses a marked line.
- For T07 to T10, the plain command passes.

## What the wordings do not settle

None of these cases is in the code, so none changes a result. Each is a way that other code could make a right answer look wrong.

- T01, T09: whether `function*` counts as a function declaration.
- T02: an array that starts with a hole, as `[, 2]`.
- T05: a `let` that takes one name out of an object, and a `let` in the head of a `for`.
- T06: `return undefined;` and `return (total);`.
- T07: `herald["announce"]()`.
- T08: single quotes, and an import with no semicolon.
- T10: `export class X extends Y`, and `extends` followed by a call.

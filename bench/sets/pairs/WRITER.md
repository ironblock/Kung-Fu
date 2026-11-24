# For the writer of this set

You are asked to write tasks for a bench. Read this note to its end before you do anything else. It says what to write, from what, and what you may open.

## What the bench does with a task

A subject, which is a model, is put in a directory. It holds `src`, some JavaScript, and the tool `ast-grep` 0.51.1. The subject is given one task: write one command of the form `ast-grep outline ... src` that lists exactly the top-level items the task describes. The answer is graded on which top-level items it lists: every one the task describes, once each, and nothing else. How the items are shown does not matter.

## What you write: pairs

A pair is two tasks about one body of code, built on one behaviour of `outline`.

- **One behaviour:** one thing the tool lists in a way that someone using it for the first time does not expect.
- **Two asks,** with different items expected. Neither says how the tool lists anything, and neither names an option of the tool. Each is said in JavaScript's own words.
- **One body of code** for both, under its own `src`. It holds items that make a first guess wrong for each ask.
- **The pair turns on the behaviour.** A subject that knows the behaviour can answer both. A subject that only copies the answer to one ask fails the other.

`bench/sets/pair-example` is one such pair, as an example of the form: read its `README.md`, its `tasks.md`, its code and its answers. Do not reuse its code, its asks or its commands.

## The behaviours are not yours to choose

They come from the makers of the tool. Their first JavaScript test for `outline` is a body of code and the 21 lines they expect from it. The code is in `MAKERS/src/makers.js` and the lines are in `MAKERS/expected.txt`. Their second and third tests are in `MAKERS/second-and-third.txt`. MAKERS is a directory outside this repository, and you are told where it is when you are started. The file is `crates/outline/tests/javascript_outline_rules.rs` of ast-grep at 0.51.1, and the tool at 0.51.1 lists what the makers expect.

Read as rows, in the makers' order, their tests show this:

| row | in the makers' code | how it is listed |
|---|---|---|
| 1 | `import fs from 'fs'` | a module item named `'fs'`, with its quotes |
| 2 | `export { localHelper };` | one module item named `exports`. `localHelper` itself is listed as not exported |
| 3 | `export { readFile as read } from './io.js'` and `export * from './all.js'` | a module item named by the path |
| 4 | `const makeThing = () => ({})` | a function |
| 5 | `let state;` and `const LOCAL = 1` | a variable, and a constant |
| 6 | a `const` and a function declared inside a callback | not listed |
| 7 | `get value() {}` in a class | a method named `value` |
| 8 | `static version = 1` and `#secret = 2` in a class | fields. The private one keeps its `#` |
| 9 | `constructor(name) {}` | a member of a type of its own, `constructor` |
| 10 | a class with a decorator on the line above it | its signature is the line of the declaration, and not the line of the decorator |

**The rule.** Every row is a candidate. Take them in order and try each in good faith. A row is kept when two asks can be written for it and every check below passes. A row is dropped only when you can say what stops it, and you write that down with the commands that show it. You do not judge which rows matter or which are interesting.

One thing may stop a row, and it is a fair reason: the bench grades top-level items only. Members of a class are not items of their own. A row about members can be kept only if two asks about top-level items turn on it.

## What you may open, and what you may not

You learn the tool from three sources and no other: the text of `ast-grep outline --help` and `ast-grep --help`, the binary run on code of your own in a scratch directory outside this repository, and the makers' files in MAKERS.

In this repository you may open: this note; everything under `bench/sets/pairs` and `bench/sets/pair-example`; and, to understand what the build says, `bench/build.py`, `bench/sets.py`, `bench/variants.py`, `pilot/build.py` and `pilot/grade.py`.

Open nothing else here: no guide, no study, no kept run, no check, no other set, no other README, not `AGENTS.md`, and not the history of the repository. Some of those hold answers to tasks like yours, or say what a subject is told about the tool, and a set written by someone who has read them is worth less. Do not search the web. If you open a file outside this list, by mistake or because you had to, say so in your record.

## The files

Row *r* has the body `P0r` (row 10: `P10`) and the tasks `T(2r-1)` and `T(2r)`: row 1 has `P01`, `T01`, `T02`; row 7 has `P07`, `T13`, `T14`. A row that is dropped leaves its numbers unused.

- **`marked/P0r/src/*.js`** is the code. Two to four files, 50 to 120 lines in all, about one small thing a program might do. At the end of each line where an expected item starts, put a marker: `// @T01`, or `// @T01 @T02` when both asks expect it. The markers are the truth the build holds the reference answers to, so place them by reading the code and not by running a command.
- **`tasks.md`** has one line for each task: `T01. An \`ast-grep outline\` command that lists ...`. Say which items count and which do not, in JavaScript's words. An example taken from the code may help a reader, and is allowed.
- **`reference/answers.txt`** has one line for each task: `T01: ast-grep outline ... src`. It is one command that lists exactly the marked items.
- **`set.json`**: add each kept body to `bodies`, as `"P01": ["T01", "T02"]`. Leave `names` empty. Names that change from variant to variant are added later by someone else. So do not let a reference answer lean on a name in the code, unless the ask is about that name.
- **`README.md`** is your record. See below.

Each ask expects two to eight items.

## The checks

Run the build from the root of the repository. BINARY is the tool, and you are told where it is.

`python3 bench/build.py BINARY --set pairs`

It stops, and says why, unless all of these hold:

1. **The reference answer of each task starts on exactly the marked lines.**
2. **The copy check, both ways.** The reference answer of one ask, handed in for the other, fails.
3. **No plain command passes a task.** A plain command is `ast-grep outline src` with at most one `--type` that names one kind of item the body holds, and at most one `--match` that is one word of the task's wording found in the code. The build tries every one of them.
4. **The tool parses every file.**

`built/pairs/0/pairs.json` then holds what each check tried and found.

Three more are yours:

5. **No wording says how the tool lists a thing, or names an option.**
6. **Each wording has one reading.** Read each as someone who knows JavaScript and has never seen the tool. If it can be taken two ways, word it again. Another reader will do this after you.
7. **A first user's first command is wrong for each ask.** Write down the command you think a first user would write, and what it lists. This is a judgement, and check 3 is the part of it that the build can hold you to.

## Your record

Write `bench/sets/pairs/README.md`, in plain words, with:

- **For each row, in order:** kept or dropped.
- **For a kept row:** the behaviour in one sentence; what each ask expects, item by item; the first command a first user would write for each ask and what it lists; the reference answers; and anything about the pair that a later reader should know, such as a second behaviour that an ask also needs.
- **For a dropped row:** what stops it, and the commands that show it.
- **What you opened and ran:** every file of this repository you opened, and how you learned what you know of the tool.
- **What you are not sure of.**

When you are done, the build passes, and your last message says in a few lines which rows are kept, which are dropped and why, and what you are not sure of.

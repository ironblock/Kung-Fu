# The outline set

Six tasks about JavaScript code, for `ast-grep outline` in ast-grep 0.51.1. An answer is one command of the form `ast-grep outline ... src`. It is graded on the top-level items it lists. Every file under `src` counts, and each task says what counts and what does not.

| task | what it asks for | what it turns on |
|---|---|---|
| T01 | every top-level class declaration, exported or not | Given a directory, `outline` lists only what is exported. `--items structure` or `--items all` lists the rest. |
| T02 | every exported function declaration named exactly `seal` | `--match` is a regex. It is tried on the name and on the first source line, and it may match anywhere in either. |
| T03 | every `import` from the module `"./ledger.js"` | Imports are listed only with `--items imports` or `--items all`. The name of an import is its path with the quotes. With `all`, a re-export from the same path has the same name. |
| T04 | every `export const` and every `export let` | A `let` has the type `variable` and a `const` has the type `constant`. `--type variable` leaves every `const` out. |
| T05 | every `export {...}` list and every re-export | Each one is an item of its own, of type `module`, and is listed among the exports. |
| T06 | every top-level function declaration, exported or not | A `const` or `let` that holds an arrow function has the type `function` when it is not exported. So `--type function` lists more than function declarations. |

The six behaviours are different. Two tasks need more than their own:

- T06 also needs what T01 turns on, because its items are not all exported.
- T03 is answered with a `--match`. A subject that does not know what T02 turns on can fail T03 for T02's reason.

T02 and T03 turn on a name, and the name changes from variant to variant. T01, T04, T05 and T06 turn on no name. Their wordings change from variant to variant only in the examples. Their reference answers are the same string in all four variants.

## Who wrote it, and from what

A fresh agent of Claude Code, the stronger model, wrote the tasks, the code and the reference answers on 2026-11-12. It was given the layout of a set, how an answer is graded, and what makes a task good. It was given no task and no behaviour to build on. It chose the six behaviours itself, after trying the tool.

It learned `ast-grep outline` from two sources only: the text of `ast-grep outline --help`, and running the 0.51.1 binary on JavaScript it wrote in a scratch directory outside the repository. It was told not to read any guide, any study, any kept run, the pilot's tasks, or the guides to the repository, the bench and the pilot. It read none of them. It did not use the network.

The files it opened outside this set are these: `bench/sets.py`, `bench/variants.py`, `bench/build.py`, `pilot/build.py`, `pilot/grade.py`, and in `bench/sets/first` the files `tasks.md`, `set.json`, `README.md` and `reference/answers.txt`. It listed the names of the files in `bench/sets/first/marked/src` and opened none of them. It ran `bench/build.py`. It called `score.judged` from `bench/score.py` and did not open that file. It printed the repository's `.gitignore`, to see that what the build leaves behind is not kept. The harness also put this repository's `AGENTS.md` in front of it, which holds no task and no fact about `outline`.

## What the author checked

Every check ran with ast-grep 0.51.1, through `score.judged`, on all four variants. Every command below got the same verdict and the same counts in all four.

- `build.py` passes in all four variants: 57 expected items. T01 has 8, T02 has 3, T03 has 5, T04 has 13, T05 has 9, T06 has 19.
- Each reference answer passes its own task.
- No reference answer passes another task. All 30 pairs fail.
- All 28 built files parse as JavaScript modules (`node --check`).
- For each task, the command a newcomer would write first does not pass. Other plausible wrong commands do not pass either. They are listed below. "Misses 4" means 4 expected items were not listed. "4 too many" means 4 items were listed that are not expected.

**T01.** The first command is `ast-grep outline --type class src`. It misses 4: the classes that are not exported.

- `ast-grep outline --items exports --type class src` and `ast-grep outline --type class --view expanded src`: each misses the same 4. The view does not change which items are listed.
- `ast-grep outline --items structure src`: 54 too many.
- `ast-grep outline --items structure --match class src`: 4 too many. They are `className`, `classify` and the two class expressions.
- `ast-grep outline --items structure --match '^class' src`: misses the 4 exported classes, and 2 too many.
- These also pass: `--items all --type class`, and `--items structure --match '^(export (default )?)?class '`.

**T02.** The first command is `ast-grep outline --match seal src`. 6 too many: `sealAll`, `unseal`, `stamp(seal, date)`, the constant whose value calls `seal`, the re-export and the list.

- `ast-grep outline --type function --match seal src`: 3 too many.
- `ast-grep outline --match '\bseal\b' src`: 4 too many. With `--type function`: 1 too many, the function with the parameter.
- `ast-grep outline --match '^seal' src`: 1 too many, `sealAll`.
- `ast-grep outline --items structure --type function --match '^seal$' src`: 1 too many, the `seal` that has no `export` in front of it.
- These also pass: `--match '^seal$'` with no `--type`, and `--match 'function seal\('`.

**T03.** The first command is `ast-grep outline --items imports --match ledger src`. 5 too many. With no `--items`, `ast-grep outline --match ledger src` misses all 5 and lists a re-export.

- `--items imports --match '\./ledger\.js'`: 2 too many, `"../ledger.js"` and `"./ledger.json"`.
- `--items imports --match '^\./ledger\.js$'`: misses all 5. The name has the quotes in it.
- `--items imports --match 'from "\./ledger\.js"'`: misses 1, `import "./ledger.js";`.
- `--items imports --match '^import.*"\./ledger\.js"'`: misses 1, the import written over several lines. Its first source line, as `outline` has it, is its last line.
- `--items all --match '^"\./ledger\.js"$'`: 1 too many, the re-export.
- `--items all --match '"\./ledger\.js"'`: 3 too many: the re-export, the string and the call.
- These also pass: `--items imports --match '"\./ledger\.js"'`, and the same with the dots not escaped.

**T04.** The first command is `ast-grep outline --type variable src`. It misses 10: every `const`.

- `ast-grep outline --type constant src`: misses 3, every `let`.
- `ast-grep outline --type const,let src`: refused. ast-grep says "Error: Unknown outline symbol type \`const\`".
- `ast-grep outline src`: 25 too many.
- `ast-grep outline --items structure --type variable,constant src`: 9 too many, the ones that are not exported.
- `ast-grep outline --type variable,constant,function src`: 12 too many, the exported function declarations. An exported arrow function has the type `constant`.
- `ast-grep outline --match 'const|let' src`: 1 too many, the function `letterhead`.
- This also passes: `--match '^export (const|let) '`.

**T05.** The first command is `ast-grep outline --items exports src`, or `ast-grep outline src`, which lists the same. 29 too many.

- `ast-grep outline --items all --type module src`: 15 too many, the imports.
- `ast-grep outline --type export src`: refused. ast-grep says "Error: Unknown outline symbol type \`export\`".
- `ast-grep outline --match '^export (\{|\*)' src`: misses 1, the re-export written over several lines.
- `ast-grep outline --match from src`: misses the 3 lists, and 2 too many.
- These also pass: `--items structure --type module`, and `--match '^exports$|^"'`.

**T06.** The first command is `ast-grep outline --type function src`. It misses 7: the function declarations that are not exported.

- `ast-grep outline --items structure --type function src`: 4 too many. They are the arrow functions held in a `const` or a `let` that is not exported. `--items all` gives the same.
- `ast-grep outline --items structure --match function src`: 2 too many, the two function expressions.
- `ast-grep outline --items structure --match '^(async )?function' src`: misses 12, the exported ones.
- These also pass: `--items structure --type function --match function`, and `--items structure --match '^(export (default )?)?(async )?function '` with no `--type`.

## What the wordings do not settle

None of these cases is in the code, so none changes a result. Each is a way that other code could make a right answer look wrong. Most of them are things that `outline` 0.51.1 does not list at all, whatever the command. A task cannot ask for those.

- All tasks: code written without semicolons. `outline` 0.51.1 does not list `export const x = 1` or `export { a }` when the semicolon is missing. Every statement in the code ends with one.
- T01: `export default class {...}` with no name. `outline` does not list it.
- T02 and T06: a generator, `function* walk() {...}`, exported or not, and `export default function () {...}` with no name. `outline` lists neither.
- T02: an exported `const` named `seal`. `--match '^seal$'` with no `--type` would list it.
- T03: a path in single quotes. The name of the import then has single quotes. The wording says the code has none.
- T04: `export let pending;` with no value, `export const a = 1, b = 2;` and `export var`. `outline` lists none of them. Also `export const { a, b } = c;`, which it lists as one item named `{ a, b }`.
- T05: `export default name;` and `export default {...};`. `outline` lists neither. The wording says there are two kinds of statement, and these would be a third.
- T06: an arrow function, not exported, whose first line holds the word `function`. `--match function` would list it, and the reference answer would not.

Three things about `outline` cannot be asked in a set of this form. The grader does not look at members, so no task turns on `--pub-members` or on a method. The view is not judged, so no task turns on `--view`. Every file counts for every task, so no task turns on `--globs` or `--lang`.

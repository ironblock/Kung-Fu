# Task

Write one `ast-grep` command. The code to search is under `src/`. Every file there is JavaScript, and every file counts.

Rules for the answer:

- One line in `answer.txt`, in the form `ast-grep outline ... src`.
- A single command, with `src` as the path to search. No pipes, no other programs, no rule files, nothing that rewrites code.
- It will be run with ast-grep 0.51.1, from the directory that contains `src`.
- It is graded on which top-level items it lists. It must list every item the task describes, once each, and nothing else. How the items are shown does not matter.

The task:

An `ast-grep outline` command that lists every class declaration at the top level of a file, whether it is exported or not: `class Pallet {...}`, `export class Crate {...}` and `export default class Depot {...}` all count, each with or without `extends`. Not counted: a class expression stored in a variable, such as `const Fragile = class FragileCrate extends Crate {};` or `export const Lidded = class extends Crate {...};`; a class declared inside a function; and anything that is not a class, whatever its name, such as the function `classify` or the constant `className`.

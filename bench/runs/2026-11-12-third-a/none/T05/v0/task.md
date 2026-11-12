# Task

Write one `ast-grep` command. The code to search is under `src/`. Every file there is JavaScript, and every file counts.

Rules for the answer:

- One line in `answer.txt`, in the form `ast-grep outline ... src`.
- A single command, with `src` as the path to search. No pipes, no other programs, no rule files, nothing that rewrites code.
- It will be run with ast-grep 0.51.1, from the directory that contains `src`.
- It is graded on which top-level items it lists. It must list every item the task describes, once each, and nothing else. How the items are shown does not matter.

The task:

An `ast-grep outline` command that lists every `export` statement that declares nothing itself. There are two kinds: a bare list of names, such as `export { weigh as measure, limit };`, and a re-export from another module, such as `export * from "./scales.js";`, `export * as routes from "./routes.js";` or `export { Crate, ColdCrate } from "./crates.js";`. Either kind counts the same when it is written over several lines. Not counted: an `export` or `export default` in front of a declaration (a function, a class, a `const` or a `let`); and `import` statements.

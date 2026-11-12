# Task

Write one `ast-grep` command. The code to search is under `src/`. Every file there is JavaScript, and every file counts.

Rules for the answer:

- One line in `answer.txt`, in the form `ast-grep outline ... src`.
- A single command, with `src` as the path to search. No pipes, no other programs, no rule files, nothing that rewrites code.
- It will be run with ast-grep 0.51.1, from the directory that contains `src`.
- It is graded on which top-level items it lists. It must list every item the task describes, once each, and nothing else. How the items are shown does not matter.

The task:

An `ast-grep outline` command that lists every exported function declaration named exactly `fasten`: a top-level `function fasten(...) {...}` with `export` or `export default` in front of it, with or without `async`. Not counted: a function whose name is longer, such as `fastenAll` or `unfasten`; a function that takes `fasten` as a parameter, such as `export function stamp(fasten, date) {...}`; a constant whose value calls it, such as `export const sample = fasten(blank);`; a re-export that names it, such as `export { fasten as close } from "./labels.js";`; a `function fasten(...) {...}` with no `export` in front of it, even when an `export {...}` list further down the file names it; and a method named `fasten` in a class.

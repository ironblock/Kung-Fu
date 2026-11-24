# Task

Write one `ast-grep` command. The code to search is under `src/`. Every file there is JavaScript, and every file counts.

Rules for the answer:

- One line in `answer.txt`, in the form `ast-grep outline ... src`.
- A single command, with `src` as the path to search. No pipes, no other programs, no rule files, nothing that rewrites code.
- It will be run with ast-grep 0.51.1, from the directory that contains `src`.
- It is graded on which top-level items it lists. It must list every item the task describes, once each, and nothing else. How the items are shown does not matter.

The task:

An `ast-grep outline` command that lists every exported top-level variable: a `const` or a `let` with `export` in front of it, such as `export const MAX_STACK = 6;` or `export let activeRoute = DEFAULT_ROUTE;`. Every one of them declares a single name and gives it a value, and it counts whatever that value is: a number, a string, an array, an object, a call, an arrow function, a function expression or a class expression. Not counted: a `const` or a `let` with no `export` in front of it, even when an `export {...}` list names it; an exported function declaration or class declaration; an `export {...}` list; and a re-export from another module.

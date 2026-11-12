# Task

Write one `ast-grep` command. The code to search is under `src/`. Every file there is JavaScript, and every file counts.

Rules for the answer:

- One line in `answer.txt`, in the form `ast-grep outline ... src`.
- A single command, with `src` as the path to search. No pipes, no other programs, no rule files, nothing that rewrites code.
- It will be run with ast-grep 0.51.1, from the directory that contains `src`.
- It is graded on which top-level items it lists. It must list every item the task describes, once each, and nothing else. How the items are shown does not matter.

The task:

An `ast-grep outline` command that lists every function declaration at the top level of a file, whether it is exported or not: `function stretch(a, b) {...}`, `async function fetchRoute(id) {...}`, `export function reroute(route, blocked) {...}`, `export async function plan(from, to) {...}` and `export default function bolt(...) {...}` all count. Not counted: an arrow function stored in a variable, exported or not, such as `const sidestep = (route, stop) => [...route, stop];`, `let onChange = () => {};` or `export const nearest = (stops, from) => {...};`; a function expression stored in a variable, such as `const legacyPlan = function (route) {...};`; a function declared inside another function; a method of a class; and classes.

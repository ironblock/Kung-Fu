# Task

Write one `ast-grep` command. The code to search is under `src/`. Every file there is JavaScript, and every file counts.

Rules for the answer:

- One line in `answer.txt`, in the form `ast-grep run ...` or `ast-grep scan --inline-rules '...' ...`.
- A single command, with `src` as the path to search. No pipes, no other programs, no rule files, nothing that rewrites code.
- It will be run with ast-grep 0.51.1, from the directory that contains `src`.
- It is graded on what it matches. It must match every piece of code the task describes, once each, and nothing else.

The task:

Every `throw` statement anywhere inside a function declaration named `probe`, at any depth: directly in its body, inside nested blocks (`if`, `for`, `try` and `catch`), and inside arrow functions or other functions written within it. A declaration of `probe` nested in another function counts like one at top level. Match the whole `throw` statement, from `throw` to its semicolon. Not counted: a `throw` in any other function, including `probeAll` and `review`, which only calls `probe`; a `throw` in `nightShift` that is outside the `probe` nested there; a `throw` at top level; a `throw` in a method named `probe` of a class or of an object; and a `throw` in the function expression `function probe(order) {...}` assigned to `strict`, which is not a declaration.

# Task

Write one `ast-grep` command. The code to search is under `src/`. Every file there is JavaScript, and every file counts.

Rules for the answer:

- One line in `answer.txt`, in the form `ast-grep run ...` or `ast-grep scan --inline-rules '...' ...`.
- A single command, with `src` as the path to search. No pipes, no other programs, no rule files, nothing that rewrites code.
- It will be run with ast-grep 0.51.1, from the directory that contains `src`.
- It is graded on what it matches. It must match every piece of code the task describes, once each, and nothing else.

The task:

Every `import` statement that imports from the module `"./pigment.js"`, that exact path and no other. It counts whatever it brings in: a default, names in braces, `* as` a namespace, a mix of these, or nothing at all (`import "./pigment.js";`). Match the whole statement, from `import` to its semicolon. Not counted: an import from any other path, however close, such as `"./pigments.js"`, `"./pigment.json"`, `"./pigment.jsx"`, `"./pigment"`, `"../pigment.js"`, `"./lib/pigment.js"` or `"pigment.js"`; `require("./pigment.js")`; the call `import("./pigment.js")`; `export ... from "./pigment.js"`; and the plain string `"./pigment.js"` assigned to a variable.

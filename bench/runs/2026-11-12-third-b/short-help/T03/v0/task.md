# Task

Write one `ast-grep` command. The code to search is under `src/`. Every file there is JavaScript, and every file counts.

Rules for the answer:

- One line in `answer.txt`, in the form `ast-grep outline ... src`.
- A single command, with `src` as the path to search. No pipes, no other programs, no rule files, nothing that rewrites code.
- It will be run with ast-grep 0.51.1, from the directory that contains `src`.
- It is graded on which top-level items it lists. It must list every item the task describes, once each, and nothing else. How the items are shown does not matter.

The task:

An `ast-grep outline` command that lists every `import` statement that imports from the module `"./ledger.js"`, that exact path and no other. It counts whatever it brings in: a default, names in braces (on one line or over several), `* as` a namespace, or nothing at all (`import "./ledger.js";`). Every path in the code is written in double quotes. Not counted: an import from any other path, however close, such as `"./ledgers.js"`, `"../ledger.js"`, `"./ledger.json"` or `"./lib/ledger.js"`; an import that only brings in that name from elsewhere, such as `import { ledger as book } from "./books.js";`; a re-export such as `export { balance } from "./ledger.js";`; a call `import("./ledger.js")` inside an arrow function; and a constant whose value is the plain string `"./ledger.js"`.

# Task

Write one `ast-grep` command. The code to search is under `src/`. Every file there is JavaScript, and every file counts.

Rules for the answer:

- One line in `answer.txt`, in the form `ast-grep run ...` or `ast-grep scan --inline-rules '...' ...`.
- A single command, with `src` as the path to search. No pipes, no other programs, no rule files, nothing that rewrites code.
- It will be run with ast-grep 0.51.1, from the directory that contains `src`.
- It is graded on what it matches. It must match every piece of code the task describes, once each, and nothing else.

The task:

Every call to the method `proclaim` on the object named `crier`, with any arguments or none, such as `crier.proclaim("queue is full")`. Match the call itself, from `crier` to its closing parenthesis, even when it is part of a longer statement or expression: in `crier.proclaim("warming up").then(resume)` the match is `crier.proclaim("warming up")`, and the call to `then` around it is not a match. Not counted: `proclaim` called on another object, such as `scribe.proclaim(...)`; `proclaim` called on a `crier` that is a property of something else, such as `this.crier.proclaim(...)` or `room.crier.proclaim(...)`; another method of `crier`, such as `crier.whisper(...)` or `crier.proclaimAll(...)`; the plain function `proclaim(...)`; `crier.proclaim` passed along without being called, as in `tray.on("empty", crier.proclaim)`; and the string `"crier.proclaim(now)"`.

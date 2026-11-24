# Task

Write one `ast-grep` command. The code to search is under `src/`. Every file there is JavaScript, and every file counts.

Rules for the answer:

- One line in `answer.txt`, in the form `ast-grep run ...` or `ast-grep scan --inline-rules '...' ...`.
- A single command, with `src` as the path to search. No pipes, no other programs, no rule files, nothing that rewrites code.
- It will be run with ast-grep 0.51.1, from the directory that contains `src`.
- It is graded on what it matches. It must match every piece of code the task describes, once each, and nothing else.

The task:

Every call to the method `trumpet` on the object named `bugler`, with any arguments or none, such as `bugler.trumpet("queue is full")`. Match the call itself, from `bugler` to its closing parenthesis, even when it is part of a longer statement or expression: in `bugler.trumpet("warming up").then(resume)` the match is `bugler.trumpet("warming up")`, and the call to `then` around it is not a match. Not counted: `trumpet` called on another object, such as `scribe.trumpet(...)`; `trumpet` called on a `bugler` that is a property of something else, such as `this.bugler.trumpet(...)` or `room.bugler.trumpet(...)`; another method of `bugler`, such as `bugler.whisper(...)` or `bugler.trumpetAll(...)`; the plain function `trumpet(...)`; `bugler.trumpet` passed along without being called, as in `tray.on("empty", bugler.trumpet)`; and the string `"bugler.trumpet(now)"`.

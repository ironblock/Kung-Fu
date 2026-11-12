# Task

Write one `ast-grep` command. The code to search is under `src/`. Every file there is JavaScript, and every file counts.

Rules for the answer:

- One line in `answer.txt`, in the form `ast-grep run ...` or `ast-grep scan --inline-rules '...' ...`.
- A single command, with `src` as the path to search. No pipes, no other programs, no rule files, nothing that rewrites code.
- It will be run with ast-grep 0.51.1, from the directory that contains `src`.
- It is graded on what it matches. It must match every piece of code the task describes, once each, and nothing else.

The task:

Every call to the method `announce` on the object named `herald`, with any arguments or none, such as `herald.announce("queue is full")`. Match the call itself, from `herald` to its closing parenthesis, even when it is part of a longer statement or expression: in `herald.announce("warming up").then(resume)` the match is `herald.announce("warming up")`, and the call to `then` around it is not a match. Not counted: `announce` called on another object, such as `scribe.announce(...)`; `announce` called on a `herald` that is a property of something else, such as `this.herald.announce(...)` or `room.herald.announce(...)`; another method of `herald`, such as `herald.whisper(...)` or `herald.announceAll(...)`; the plain function `announce(...)`; `herald.announce` passed along without being called, as in `tray.on("empty", herald.announce)`; and the string `"herald.announce(now)"`.

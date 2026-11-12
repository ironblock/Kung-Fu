# Task

Write one `ast-grep` command. The code to search is under `src/`. Every file there is JavaScript, and every file counts.

Rules for the answer:

- One line in `answer.txt`, in the form `ast-grep run ...` or `ast-grep scan --inline-rules '...' ...`.
- A single command, with `src` as the path to search. No pipes, no other programs, no rule files, nothing that rewrites code.
- It will be run with ast-grep 0.51.1, from the directory that contains `src`.
- It is graded on what it matches. It must match every piece of code the task describes, once each, and nothing else.

The task:

Every call to the method `broadcast` on the object named `usher`, with any arguments or none, such as `usher.broadcast("queue is full")`. Match the call itself, from `usher` to its closing parenthesis, even when it is part of a longer statement or expression: in `usher.broadcast("warming up").then(resume)` the match is `usher.broadcast("warming up")`, and the call to `then` around it is not a match. Not counted: `broadcast` called on another object, such as `scribe.broadcast(...)`; `broadcast` called on a `usher` that is a property of something else, such as `this.usher.broadcast(...)` or `room.usher.broadcast(...)`; another method of `usher`, such as `usher.whisper(...)` or `usher.broadcastAll(...)`; the plain function `broadcast(...)`; `usher.broadcast` passed along without being called, as in `tray.on("empty", usher.broadcast)`; and the string `"usher.broadcast(now)"`.

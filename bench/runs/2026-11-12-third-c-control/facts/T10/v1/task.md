# Task

Write one `ast-grep` command. The code to search is under `src/`. Every file there is JavaScript, and every file counts.

Rules for the answer:

- One line in `answer.txt`, in the form `ast-grep run ...` or `ast-grep scan --inline-rules '...' ...`.
- A single command, with `src` as the path to search. No pipes, no other programs, no rule files, nothing that rewrites code.
- It will be run with ast-grep 0.51.1, from the directory that contains `src`.
- It is graded on what it matches. It must match every piece of code the task describes, once each, and nothing else.

The task:

Every class declaration that extends another class, such as `class Circle extends Shape {...}`. The class it extends may be written as a plain name or as a dotted name such as `Widgets.Base`, the declaration may be at top level or inside a function, and `extends` may be on a line of its own. Match the whole declaration, from `class` to its closing brace. Not counted: a class declaration with no `extends` of its own, even when its body has the word in a string (as in `Plain`) or holds a class expression that extends (as in `Registry`); a class expression assigned to a variable, even one that extends, such as `const Mixed = class extends Shape {}` or `const Named = class Inner extends Shape {}`; a function such as `function Legacy(name) {...}`; and the string `"class Poster extends Shape {}"`.

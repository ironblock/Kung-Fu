# Tasks

Write one `ast-grep` command for each task. The code to search is under `src/`: JavaScript files (`.js`), TypeScript files (`.ts`) and Python files (`.py`).

Rules for an answer:

- One line per task in `answers.txt`, in the form `T01: ast-grep run ...` or `T01: ast-grep scan --inline-rules '...' ...`.
- A single command, with `src` as the path to search. No pipes, no other programs, no rule files, nothing that rewrites code.
- It will be run with ast-grep 0.51.1, from the directory that contains `src`.
- It is graded on what it matches. It must match every piece of code the task describes, once each, and nothing else.

T01. Every call to `console.log`, with any number of arguments, including none.

T02. Every `==` comparison (loose equality, not `===`) whose left and right sides are the same text, such as `x == x`.

T03. Every call to `fetch` that is anywhere inside the function declaration named `load`: at any depth, including inside nested blocks and nested arrow functions. Calls to `fetch` elsewhere do not count.

T04. Every function declaration (the `function name(...) { ... }` form, including `async function`; not arrow functions, not function expressions, not methods) that has no `return` statement anywhere inside it. A `return` inside a nested function or callback counts as being inside it.

T05. Every call whose callee is the plain identifier `alpha` or the plain identifier `beta`, with any arguments. `obj.alpha()` and `alphabet()` do not count.

T06. Every field declared in a class body with an initial value, such as `count = 0;` inside `class C { ... }`. Methods, and assignments such as `this.count = 1`, do not count.

T07. Every property in an object literal whose key is exactly `key`, such as the `key: 1` in `{ key: 1 }`. Match the property itself (key and value), not the whole object. Keys such as `key2` or `monkey` do not count.

T08. The second argument of every call to the plain function `pair` that has at least two arguments. Match the argument itself, not the call.

T09. Every `var` statement that declares exactly one variable and gives it a value, such as `var a = 1;`. Not `let` or `const`. Not `var a;`. Not `var a = 1, b = 2;`.

T10. (Python) Every function definition (`def`), including methods, that has no decorator. Match from the `def` keyword.

T11. (Python) Every call to `print` that passes a keyword argument named `file`, such as `print(x, file=f)`, wherever that argument sits among the others.

T12. (TypeScript) Every `interface` declaration named exactly `Stage`, whether or not it is exported and whether or not it extends other interfaces. `StageList` does not count.

T13. Every `await` expression that is not inside a `try` statement. An `await` in the `try` block, in `catch`, or in `finally` is inside the `try` statement.

T14. Every call to the plain function `finish` whose last argument is the identifier `done`, such as `finish(done)` or `finish(1, 2, done)`. `queue.finish(done)` does not count.

A. The task asks for one `ast-grep outline` command that lists only exported top-level function declarations named exactly `latch` (with or without `async`, and including `export default`), excluding look-alikes such as `latchAll`, parameters named `latch`, `const` values that call it, re-exports, non-exported functions, and class methods.

B. sure

The answer is in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/rows/T02/v1/answer.txt. Its single line is:
ast-grep outline --items exports --type function --match '^latch$' src

Running it returns three items: src/sorting.js (async), src/labels.js, and src/wax.js (default export). It omits the non-exported `latch` in src/tools.js, which is only re-exported by name. Nothing under src was changed. The bin directory was put on PATH in each call.

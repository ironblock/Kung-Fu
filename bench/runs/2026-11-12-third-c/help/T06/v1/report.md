A. The task asks for one ast-grep outline command over src/ that lists every top-level function declaration (exported, default-exported, or not, including async) while excluding arrow functions and function expressions stored in variables, nested functions, class methods, and classes.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/help/T06/v1/answer.txt: `ast-grep outline --items all --type function src`. The --items all flag is needed because the default for a directory is "exports", which would drop non-exported functions. The --type function filter is the part I could not verify: I do not know whether outline classifies `const x = () => ...` as a "function" symbol, which would wrongly include arrow functions.

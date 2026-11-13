A. The task asks for one ast-grep outline command that lists every top-level function declaration in src (exported or not, including export default function and async function), while excluding arrow functions and function expressions stored in variables, nested functions, class methods, and classes.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/facts/T06/v1/answer.txt:
ast-grep outline --items structure --type function --match 'function' src

This lists 19 items across 7 files, which matches my manual check of the source. The `--match 'function'` filter removes the non-exported arrow functions (onChange, bypass, lazyBook, round), which otherwise have type function.

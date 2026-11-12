A. The task asks for one ast-grep outline command that lists only top-level exported function declarations named exactly `fasten` (with or without `async`, with `export` or `export default`), excluding longer names, parameters named fasten, consts, re-exports, non-exported functions, and class methods.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/short-help/T02/v3/answer.txt:
ast-grep outline --items exports --type function --match '^fasten$' src

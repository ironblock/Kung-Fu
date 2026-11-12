A. The task asks for one ast-grep outline command that lists only top-level exported function declarations named exactly `latch` (with optional export default and async), excluding longer names, parameters named latch, consts calling latch, re-exports, non-exported functions, and class methods.

B. unsure

Answer written to /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/bench-work/2026-11-12-third-c/help/T02/v1/answer.txt:
ast-grep outline --items exports --match 'function latch\(' src

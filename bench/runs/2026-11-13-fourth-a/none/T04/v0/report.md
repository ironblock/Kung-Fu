A. The task asks for one ast-grep outline command over src that lists exactly the exported top-level const and let variables (MAX_STACK, Lidded, LABEL_SIZES, sample, VERSION, colours, DEFAULT_ROUTE, activeRoute, lastError, nearest, byLength, sorted, bins), excluding non-exported declarations, exported functions and classes, export lists, and re-exports.
B. sure

Answer written to /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/bench-work/2026-11-13-fourth-a/none/T04/v0/answer.txt:
ast-grep outline --items exports --type constant,variable src

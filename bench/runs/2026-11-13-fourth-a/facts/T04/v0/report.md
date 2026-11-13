A. The task asks for one ast-grep outline command over src that lists exactly the exported top-level const and let variables (any value kind), and nothing else.
B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/facts/T04/v0/answer.txt:
ast-grep outline --items exports --type constant,variable src

Verified with ast-grep 0.51.1: it lists 13 items (MAX_STACK, Lidded, VERSION, LABEL_SIZES, sample, DEFAULT_ROUTE, activeRoute, lastError, nearest, byLength, bins, sorted, colours), matching a grep of every top-level export const/let line in src. Exported functions, classes, export lists and re-exports are excluded by the type filter, and non-exported consts are excluded by the exports filter.

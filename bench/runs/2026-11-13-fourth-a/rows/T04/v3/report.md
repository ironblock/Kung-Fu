A. The task asks for one `ast-grep outline` command that lists every exported top-level `const` or `let` in `src/`, whatever its value, and nothing else.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/rows/T04/v3/answer.txt:
ast-grep outline --items exports --type constant,variable src

Check: the JSON output of that command lists 13 items (DEFAULT_ROUTE, openBay, lastError, nearest, byLength, bins, sorted, VERSION, LABEL_SIZES, sample, colours, MAX_HEAP, Lidded), which matches the exported const/let declarations I found by reading src/ directly.

A. The task asks for one ast-grep outline command that lists every exported top-level const or let with a value (any kind of value, including arrow functions and class expressions), and excludes non-exported consts and lets, exported functions and classes, export lists, and re-exports.

B. sure

answer.txt is written at /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/facts/T04/v3/answer.txt with the line:
ast-grep outline --items exports --match '\b(const|let)\b' src

The output lists 13 items: VERSION, colours, openBay, lastError, DEFAULT_ROUTE, nearest, byLength, LABEL_SIZES, sample, sorted, bins, MAX_HEAP, Lidded. I checked this against a manual read of every file under src. Nothing under src was changed.

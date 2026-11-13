A. The task asks for one ast-grep outline command that lists every exported top-level const or let declaring a single name with a value (arrow functions, function/class expressions, and so on count), and excludes non-exported declarations, exported functions and classes, export lists, and re-exports.

B. sure

answer.txt is at /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/none/T04/v1/answer.txt and contains: ast-grep outline --items exports --type constant,variable src

Running it under ast-grep 0.51.1 lists 13 items, which match a manual grep of the exported top-level const/let lines: colours, DEFAULT_ROUTE, currentLane, lastError, nearest, byLength, bins, sorted, VERSION, LABEL_SIZES, sample, MAX_PILE, Lidded. Nothing under src was changed.

A. The task asks for one ast-grep outline command that lists every exported top-level const or let with a single declared name and a value (including arrow functions, function expressions, class expressions and calls), and excludes non-exported declarations, exported functions and classes, export lists and re-exports.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-third-shell/none/T04/v0/answer.txt:
ast-grep outline --items all --view signatures --match '^export (const|let) ' src

It lists 13 items: MAX_STACK, Lidded, DEFAULT_ROUTE, activeRoute, lastError, nearest, byLength, VERSION, LABEL_SIZES, sample, colours, bins, sorted. I checked the output by hand against the source. Nothing under src was changed.

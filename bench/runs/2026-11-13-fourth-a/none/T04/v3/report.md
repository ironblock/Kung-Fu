A. The task asks for one ast-grep outline command that lists every exported top-level const or let that has a value (including class expressions, arrow functions and function expressions), and excludes non-exported variables, exported functions and classes, export lists and re-exports.
B. sure

The answer is written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/none/T04/v3/answer.txt and reads: ast-grep outline --items exports --type constant,variable src

Running it lists 12 items, matching my manual check of the source: MAX_HEAP, Lidded (crates.js); VERSION (index.js); LABEL_SIZES, sample (labels.js); DEFAULT_ROUTE, openBay, lastError, nearest, byLength (routes.js); bins, sorted (sorting.js); colours (wax.js).

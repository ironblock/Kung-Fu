A. The task asks for one ast-grep outline command that lists every exported top-level const or let with a value (any kind of value, including arrow functions, function expressions and class expressions), and nothing else.
B. sure

The answer is written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/rows/T04/v1/answer.txt:
ast-grep outline --items exports --type constant,variable src

It lists 13 items: DEFAULT_ROUTE, currentLane, lastError, nearest, byLength (routes.js); bins, sorted (sorting.js); VERSION (index.js); LABEL_SIZES, sample (labels.js); colours (wax.js); MAX_PILE, Lidded (crates.js). I checked the JSON output: every exported function and class in the outline is a declaration, so the type filter excludes only those. The export-list entries show up as type "module" and are excluded. Nothing under src was changed.

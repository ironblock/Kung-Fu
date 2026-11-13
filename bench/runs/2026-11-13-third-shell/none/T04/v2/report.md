A. The task asks for one `ast-grep outline` command that lists every exported top-level `const` or `let` declaration in src/ (single name, any value kind), and nothing else.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-third-shell/none/T04/v2/answer.txt:
ast-grep outline --items exports --type constant,variable src

It lists 13 items, which I checked against a manual grep of the source: MAX_TIER, Lidded (crates.js); colours (wax.js); LABEL_SIZES, sample (labels.js); VERSION (index.js); bins, sorted (sorting.js); DEFAULT_ROUTE, chosenTrack, lastError, nearest, byLength (routes.js).

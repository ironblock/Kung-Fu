A. The task asks for one ast-grep outline command over src/ that lists every top-level function declaration (exported, default-exported, async or not) and nothing else, excluding arrow functions and function expressions held in variables, nested functions, methods and classes.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/rows/T06/v1/answer.txt:
ast-grep outline --items structure --type function --match function src

Checked by running it: 19 items, matching the 19 function declarations I counted by reading the files (crates.js: classify; index.js: open; labels.js: pad, latch, latchAll, unlatch, stamp; routes.js: spacing, fetchRoute, plan, reroute, watch; sorting.js: byWeight, latch; tools.js: latch, weigh; wax.js: letterhead, melt, latch). Without --match, --type function also lists the non-exported arrows bypass, onChange, lazyBook and round; the --match function filter removes them because their signatures contain no "function". Nothing under src was changed.

A. The task asks for one ast-grep outline command that lists every top-level function declaration in src (exported or not, including async and default exports) while excluding arrow functions and function expressions stored in variables, nested functions, class methods, and classes.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/facts/T06/v0/answer.txt:
ast-grep outline --items structure --type function --match '^\s*(export\s+)?(default\s+)?(async\s+)?function\b' src

It lists 19 items: routes.js (distance, fetchRoute, plan, reroute, watch), sorting.js (byWeight, seal), index.js (open), labels.js (pad, seal, sealAll, unseal, stamp), wax.js (letterhead, melt, seal), tools.js (seal, weigh), crates.js (classify). The --type function filter alone also pulls in non-exported arrows (onChange, detour, lazyBook, round), and the regex removes them. The function expressions legacyPlan and byLength are typed as constants, so they are already excluded. Nothing under src was changed.

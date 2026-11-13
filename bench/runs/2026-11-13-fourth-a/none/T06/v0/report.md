A. The task asks for one ast-grep outline command, run over src, that lists every top-level function declaration (exported or not, async or default-exported included) and excludes arrow functions and function expressions stored in variables, nested functions, class methods, and classes.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/none/T06/v0/answer.txt:
ast-grep outline --items structure --type function --match 'function ' src

Verified output lists 19 items: wax.js (letterhead, melt, seal), routes.js (distance, fetchRoute, plan, reroute, watch), sorting.js (byWeight, seal), index.js (open), labels.js (pad, seal, sealAll, unseal, stamp), tools.js (seal, weigh), crates.js (classify). Each matches a hand check of the source. Arrow consts (onChange, detour, lazyBook, round) are excluded by the --match filter. Note: the default --items for a directory is "exports", so --items structure is required. Nothing under src was changed.

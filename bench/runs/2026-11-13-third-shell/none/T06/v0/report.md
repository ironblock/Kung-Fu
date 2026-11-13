A. The task asks for one ast-grep outline command over src/ that lists only top-level function declarations (exported, default-exported, or not, including async), and excludes arrow or function-expression variables, nested functions, class methods, and classes.
B. sure

answer.txt is at /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-third-shell/none/T06/v0/answer.txt and contains:
ast-grep outline --items all --type function --match '^(export )?(default )?(async )?function ' src

Running it from the v0 directory lists 19 declarations, which match my manual check of the source: distance, fetchRoute, plan, reroute, watch (routes.js); byWeight, seal (sorting.js); open (index.js); pad, seal, sealAll, unseal, stamp (labels.js); letterhead, melt, seal default export (wax.js); seal, weigh (tools.js); classify (crates.js). Without the --match regex, --type function also picks up arrow-function variables (onChange, detour, lazyBook, round), so the regex is needed to drop them.

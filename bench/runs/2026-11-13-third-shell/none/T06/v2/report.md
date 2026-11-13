A. The task asks for one ast-grep outline command that lists every top-level function declaration in src (exported or not, including async and export default) while excluding arrow functions and function expressions stored in variables, nested functions, class methods, and classes.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-third-shell/none/T06/v2/answer.txt:
ast-grep outline --items all --type function --match '^(export (default )?)?(async )?function\b' src

Verified with ast-grep 0.51.1: it lists 19 items (routes.js: stretch, fetchRoute, plan, reroute, watch; wax.js: letterhead, melt, bolt; sorting.js: byWeight, bolt; index.js: open; tools.js: bolt, weigh; labels.js: pad, bolt, boltAll, unbolt, stamp; crates.js: classify). This matches a manual read of all seven files. Nothing under src was changed.

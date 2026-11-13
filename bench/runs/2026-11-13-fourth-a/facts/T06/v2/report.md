A. The task asks for one ast-grep outline command that lists every top-level function declaration in src (exported or not, including async and default exports), and excludes arrow functions and function expressions stored in variables, nested functions, class methods, and classes.

B. sure

The answer is written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/facts/T06/v2/answer.txt as one line:

ast-grep outline --items structure --type function --match 'function [A-Za-z_$]' src

It lists 19 items across the seven files: routes.js (stretch, fetchRoute, plan, reroute, watch), sorting.js (byWeight, bolt), index.js (open), labels.js (pad, bolt, boltAll, unbolt, stamp), wax.js (letterhead, melt, bolt), tools.js (bolt, weigh), and crates.js (classify). The regex requires a name directly after "function", which drops the anonymous `function (` expressions (legacyPlan, byLength). Without it, the output also includes arrow functions such as sidestep, nearest, onChange, lazyBook, and round. Nothing under src was changed.

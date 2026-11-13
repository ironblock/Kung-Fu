A. The task asks for one ast-grep outline command that lists every top-level function declaration in src (exported, default-exported, or not, including async), and excludes arrow functions and function expressions stored in variables, nested functions, class methods, and classes.
B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/none/T06/v3/answer.txt:
ast-grep outline --items structure --type function --match 'function\s+[A-Za-z_$][\w$]*\s*\(' src

It runs cleanly under ast-grep 0.51.1 and lists 19 items, which I cross-checked against a grep of every top-level "function" line in src: classify, mileage, fetchRoute, plan, reroute, watch, byWeight, fasten (sorting), pad, fasten (labels), fastenAll, unfasten, stamp, open, letterhead, melt, fasten (default export in wax.js), fasten (tools), weigh. The regex drops the arrow functions (onChange, shortcut, lazyBook, round) and the anonymous function expressions (legacyPlan, byLength), since "function" is not followed by a name. Nothing under src was changed.

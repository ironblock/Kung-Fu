A. The task asks for one ast-grep outline command that lists every top-level function declaration (exported, default-exported, async or not) and excludes arrow functions and function expressions stored in variables, nested functions, methods, and classes.

B. sure

The answer is written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/rows/T06/v2/answer.txt:
ast-grep outline --items structure --type function --match '^(export )?(default )?(async )?function\b' src

It lists 19 items across all 7 files: stretch, fetchRoute, plan, reroute, watch, byWeight, bolt (sorting.js), open, pad, bolt, boltAll, unbolt, stamp, letterhead, melt, bolt (wax.js, export default), bolt, weigh, classify. The `--type function` filter alone also picks up unexported arrows (onChange, sidestep, lazyBook, round), which the regex on the first source line removes. I cross-checked the result against the AST kinds from the JSON output.

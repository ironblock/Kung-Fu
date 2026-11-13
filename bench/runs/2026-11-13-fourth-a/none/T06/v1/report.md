A. The task asks for one ast-grep outline command that lists every top-level function declaration in src (exported or not, including async and default exports) and excludes arrow functions and function expressions stored in variables, nested functions, methods, and classes.

B. sure

The answer is in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/none/T06/v1/answer.txt:
ast-grep outline --items structure --type function --match '^(export )?(default )?(async )?function\b' src

It returns the 19 top-level function declarations across the seven files, and none of the arrow functions, function expressions, or the nested `swap` in routes.js. I checked the JSON output for astKind and cross-checked against a grep of the source.

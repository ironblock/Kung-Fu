A. The task asks for one `ast-grep outline` command that lists every top-level function declaration in `src` (exported or not, including async and default exports) while excluding arrow functions, function expressions, nested functions, methods and classes.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/facts/T06/v3/answer.txt: `ast-grep outline --items structure --type function --match '^(export )?(default )?(async )?function\b' src`. The `--type function` filter alone would also keep `const f = () => 1` (fact 3), so the anchored `--match` on the first line is what removes arrow functions and expressions. I could not run it to confirm that `--match` tests the full source line including the `export` keyword.

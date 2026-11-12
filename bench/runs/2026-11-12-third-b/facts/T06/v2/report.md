A. The task asks for one `ast-grep outline` command, run over `src`, that lists every top-level function declaration (exported or not, async or default-exported included) and excludes arrow functions stored in variables, function expressions stored in variables, nested functions, class methods, and classes.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/facts/T06/v2/answer.txt: `ast-grep outline --items structure --type function --match '^(export )?(default )?(async )?function\b' src`. I could not run it. The `--type function` filter alone would also keep `const f = () => 1` (per facts item 3), so the regex on the first line is what drops arrow functions. That regex assumes the first line begins with the declaration keywords, which I have not verified.

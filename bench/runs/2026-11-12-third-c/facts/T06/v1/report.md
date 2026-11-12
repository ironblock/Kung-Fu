A. The task asks for one `ast-grep outline` command that lists only top-level function declarations (exported or not, including async and export default) in `src`, excluding arrow functions and function expressions stored in variables, nested functions, methods, and classes.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/facts/T06/v1/answer.txt:
ast-grep outline --items structure --type function --match '^(export )?(default )?(async )?function\b' src

Reasoning: `--items structure` includes non-exported items (facts 2). `--type function` alone would also keep `const f = () => 1` (fact 3), so the `--match` regex anchors on the start of the first line to require a `function` declaration keyword. Uncertainty: I assumed the item's first line begins with the `export`/`async`/`default` prefix, so the `^` anchor works as intended; I could not verify this against src or by running ast-grep.

A. The task asks for one `ast-grep outline` command that lists every top-level function declaration in `src` (exported or not, async or default-exported included), while excluding arrow functions and function expressions stored in variables, nested functions, class methods, and classes.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/facts/T06/v1/answer.txt: `ast-grep outline --items structure --type function --match '^((export|default|async) )*function\b' src`. The `--type function` filter alone would also pick up `const f = () => 1` items, so the regex on the first line is what excludes them. The uncertainty is whether `--match` tests the first line separately from the name, since `^` anchoring depends on that. I could not run ast-grep to check.

A. Write one `ast-grep outline` command over `src` that lists every top-level function declaration (exported or not, including async and default exports) and nothing else, excluding arrow functions, function expressions, nested functions, methods and classes.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/facts/T06/v1/answer.txt:
ast-grep outline --items structure --type function --match '^((export )?(default )?(async )?function)\b' src

Why unsure: I could not run ast-grep or see `src`. The command relies on facts.md (structure lists exported and non-exported items; `--type function` also catches arrow functions, so the regex must filter them). It assumes the first line of an exported declaration starts with `export`, and that `--match` anchors `^` to the start of that line, neither of which I verified.

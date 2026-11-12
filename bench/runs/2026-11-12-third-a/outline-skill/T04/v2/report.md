A. Find every exported top-level `const` or `let` in `src/` (JavaScript) with one `ast-grep outline` command, excluding non-exported declarations, exported functions and classes, `export {...}` lists, and re-exports.

B. guess

The command written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/outline-skill/T04/v2/answer.txt is: `ast-grep outline --items exports --match '^export (const|let) ' src`. It is unverified: I could not run ast-grep or see `src`. It assumes the `exports` view includes exported variables and that the match regex runs against a signature that keeps the leading `export` keyword. The SKILL.md documents neither detail for variables. A `--type variable` filter was the alternative I rejected because the variable type name is not documented.

A. The task asks for one ast-grep outline command that lists only top-level, exported function declarations named exactly `latch` (async or not, with export or export default), and excludes longer names, latch used as a parameter, const initializers, re-exports, non-exported declarations, and class methods.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/outline-skill/T02/v1/answer.txt:
ast-grep outline --items exports --type function --match '^latch$' src

Why unsure: I could not check how ast-grep 0.51.1 treats `--items exports`. If a function declared without `export` but named in a later `export {...}` list counts as an export, this command would wrongly include it, and no documented flag separates the two cases. The `^latch$` anchor on --match handles the name-only exclusions.

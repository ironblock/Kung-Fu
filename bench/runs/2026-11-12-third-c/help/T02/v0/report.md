A. The task asks for one ast-grep outline command (run from the directory containing src) that lists only top-level exported function declarations named exactly `seal`, with optional `default` and `async`, and excludes longer names, `seal` used as a parameter or in a constant, re-exports, non-exported `seal` functions, and class methods.

B. unsure

The answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/help/T02/v0/answer.txt is:
ast-grep outline --items exports --match '^export\s+(default\s+)?(async\s+)?function\s+seal\s*\(' src

I could not see src or run ast-grep, so this is untested. It relies on --match being applied to first source lines (as help.txt describes), so the `export` prefix filters out the non-exported `seal` declaration even when an `export {...}` list names it.

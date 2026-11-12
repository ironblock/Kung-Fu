A. The task asks for one ast-grep outline command that lists only top-level exported function declarations named exactly `seal` (with optional default and async), excluding longer names, parameters named seal, constants, re-exports, non-exported functions, and class methods.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/outline-skill/T02/v0/answer.txt: `ast-grep outline --items structure --type function --match '^export (default )?(async )?function seal\b' src`

Reason for the guess: I could not run ast-grep, and the SKILL.md does not say whether the outline signature text includes the `export` keyword. I chose `--items structure` over `--items exports` because `exports` probably also surfaces the `export {...}` list case that the task excludes. The regex relies on the signature starting with `export`, which is unverified.

A. The task asks for one ast-grep outline command that lists only exported top-level function declarations named exactly `seal` (with or without `export default` or `async`), excluding longer names, parameters named seal, consts, re-exports, non-exported declarations, and class methods.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/short-help/T02/v0/answer.txt: `ast-grep outline --lang javascript --items exports --type function --match '^seal$' src`. Main uncertainty: `--items exports` may still include a non-exported `function seal` that is named in a later `export {...}` list, which the task excludes. I could not test against src, and I did not verify the exact symbol-type label used for function declarations.

A. The task asks for one ast-grep outline command that lists only exported top-level function declarations named exactly `bolt` (with or without async, and with export or export default), excluding look-alikes such as longer names, bolt as a parameter, constants calling bolt, re-exports, non-exported functions, and class methods.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/facts/T02/v2/answer.txt: `ast-grep outline --type function --match '^bolt$' src`

Reasoning: I used the default mode, since facts.md says a directory lists only exported items. `--type function` drops constants, and `^bolt$` is anchored so it matches only the exact name. The unresolved risk is the case of `function bolt(...)` with no export in front but named in a later `export {...}` list. I could not confirm whether default outline mode counts that as exported, and the task says it must not be listed. I also could not run the command.

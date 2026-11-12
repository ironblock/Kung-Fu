A. The task asks for one `ast-grep outline` command, run from the directory containing `src`, that lists only exported top-level function declarations named exactly `seal` (with or without `async`, `export` or `export default`), excluding longer names, parameters, constants, re-exports, non-exported functions, and class methods.

B. guess

The answer is written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/names/T02/v0/answer.txt as: `ast-grep outline --lang javascript --type function --match '^seal$' --items export src`. The flags.txt file lists only option names, not their accepted values, so the `--type function` and `--items export` values and the `--match` regex semantics are guesses; I could not verify them against ast-grep 0.51.1 or the code.

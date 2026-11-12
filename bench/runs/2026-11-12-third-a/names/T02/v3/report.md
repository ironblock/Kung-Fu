A. Write one ast-grep outline command over src/ that lists only exported top-level function declarations named exactly `fasten` (optionally async, with export or export default), excluding look-alike names, parameters, constants, re-exports, non-exported functions, and class methods.
B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/names/T02/v3/answer.txt:
ast-grep outline --lang javascript --type function --match '^fasten$' src

Why it is a guess: flags.txt lists only flag names, not their values or semantics. I could not confirm that `--type function` excludes class methods, that `--match` matches the item name, or that there is a way to require `export`. The command also does not filter for export, so it may include non-exported `function fasten` declarations. The `--lang javascript` value is also unverified.

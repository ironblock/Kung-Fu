A. The task asks for one `ast-grep outline` command that lists every top-level exported `const`/`let` variable under `src` (any value type), excluding non-exported declarations, `export {...}` lists, exported function/class declarations, and re-exports.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/short-help/T04/v2/answer.txt: `ast-grep outline --items exports --type variable src`. The short-help text does not name the symbol-type values for variables, so `variable` and the use of `--items exports` are unverified guesses, and I could not test them.

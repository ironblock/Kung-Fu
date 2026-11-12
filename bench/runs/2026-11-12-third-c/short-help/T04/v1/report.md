A. The task asks for one single-line `ast-grep outline ... src` command that lists only top-level exported `const`/`let` variable declarations under `src/` (any initializer counts), excluding non-exported variables, exported functions/classes, `export {...}` lists, and re-exports.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/short-help/T04/v1/answer.txt: `ast-grep outline --items exports --type variable src`. I could not verify the symbol-type names or how `--items exports` treats `export {...}` lists, and I could not see `src`, so the `--type variable` filter may miss arrow-function or class-expression initializers that ast-grep classifies differently.

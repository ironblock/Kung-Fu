A. The task asks for one ast-grep 0.51.1 `outline` command, run on `src`, that lists only exported top-level `const`/`let` variable declarations (not unexported ones, exported functions or classes, `export {...}` lists, or re-exports).

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/names/T04/v0/answer.txt: `ast-grep outline --lang javascript --pub-members --type variable src`. I could not verify the flag semantics: flags.txt only lists option names with no descriptions, and I could not run ast-grep or see `src`. The guess assumes `--pub-members` restricts to exported items and `--type variable` restricts to variable declarations, which may not be how 0.51.1 behaves.

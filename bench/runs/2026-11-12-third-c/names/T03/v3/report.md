A. The task asks for one `ast-grep outline` command over `src` that lists only the top-level `import` statements whose source is exactly `"./manifest.js"`, excluding look-alike paths, other-module named imports, re-exports, dynamic imports and string constants.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/names/T03/v3/answer.txt: `ast-grep outline --match '^import\b[\s\S]*"\./manifest\.js"' src`. Unverified: I could not run ast-grep or see `src`, and the flags list only shows option names, not what `--match` tests against or whether imports appear in outline output at all.

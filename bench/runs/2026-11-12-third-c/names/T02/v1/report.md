A. The task asks for one `ast-grep outline` command over `src` that lists only top-level exported function declarations named exactly `latch` (with or without `export default` and `async`), excluding longer names, parameters named `latch`, consts, re-exports, non-exported declarations, and class methods.

B. guess

The answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/names/T02/v1/answer.txt is: `ast-grep outline --type function --match '^latch$' --pub-members src`. flags.txt only lists option names with no descriptions, so I could not confirm what --type, --match, or --pub-members do, and I could not confirm that any of them filters on export status.

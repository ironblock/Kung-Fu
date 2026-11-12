A. The task asks for one ast-grep 0.51.1 outline command over src that lists only the exported top-level const and let variables (not functions, classes, export lists, or re-exports), and I wrote it to answer.txt.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/facts/T04/v0/answer.txt: `ast-grep outline --match 'export (const|let) ' src`

Reasoning: a directory outline already lists only exported items (fact 2), and --type cannot separate an exported `const f = () => 1` (type function) from an exported function declaration (also function), so I filtered on the first line with --match instead. Unanchored, so a JSDoc comment before the declaration would not hide it. Not verified by running; I could not see src.

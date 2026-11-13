A. The task asks for one ast-grep outline command that lists every top-level exported `const` or `let` declaration with a single name and an initializer (any value, including arrows, function and class expressions), while excluding non-exported variables, export lists, function and class declarations, and re-exports.
B. sure

The command, written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-third-shell/none/T04/v1/answer.txt:
ast-grep outline --items all --match '^export (const|let) ' src

It returns 13 items: VERSION, colours, DEFAULT_ROUTE, currentLane, lastError, nearest, byLength, LABEL_SIZES, sample, bins, sorted, MAX_PILE, Lidded. I cross-checked this against a plain grep of the `export` lines in src. Nothing under src was changed.

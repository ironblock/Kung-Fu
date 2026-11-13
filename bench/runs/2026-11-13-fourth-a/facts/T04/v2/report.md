A. The task asks for one `ast-grep outline ... src` command that lists exactly the exported top-level `const`/`let` declarations with a single name and a value (13 items: MAX_TIER, Lidded, VERSION, LABEL_SIZES, sample, DEFAULT_ROUTE, chosenTrack, lastError, nearest, byLength, bins, sorted, colours), excluding unexported ones, exported functions and classes, `export {...}` lists, and re-exports.
B. sure

The answer is written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/facts/T04/v2/answer.txt and reads: `ast-grep outline --items exports --match '^export (const|let) ' src`. I ran it with ast-grep 0.51.1 and it returned the 13 expected names, matching my manual count of the source files.

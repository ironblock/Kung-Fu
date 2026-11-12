A. The task asks for one `ast-grep outline` command over `src` that lists every top-level import from exactly `"./roster.js"` (default, braces on one or several lines, namespace, or bare) and excludes look-alike paths, re-exports, dynamic imports, and string constants.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/facts/T03/v1/answer.txt: `ast-grep outline --items imports --match '"\./roster\.js"' src`. Caveat: `--match` only checks an item's name or first line, so a multi-line brace import whose path is on a later line may be missed. The facts do not say what name an import item carries, so I could not verify this.

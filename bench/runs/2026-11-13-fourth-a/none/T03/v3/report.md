A. The task asks for one ast-grep outline command that lists every import statement importing from exactly "./manifest.js" in src (default, named, namespace, side-effect, and multi-line forms), excluding look-alike paths, other modules' names, re-exports, dynamic imports and string constants.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/none/T03/v3/answer.txt:
ast-grep outline --items imports --match '"\./manifest\.js"' src

Verified with ast-grep 0.51.1. It lists 5 items, one per file: routes.js (* as), index.js (bare import), labels.js (braces), tools.js (multi-line braces), crates.js (default).

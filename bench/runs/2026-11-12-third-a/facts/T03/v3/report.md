A. Find every top-level import statement whose source is exactly "./manifest.js" (in any form: default, braces single or multi-line, namespace, or bare) and list each once, excluding look-alike paths, other modules' imports, re-exports, dynamic imports and string constants.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/facts/T03/v3/answer.txt: `ast-grep outline --items imports --match '"\./manifest\.js"' src`. Known weakness: --match only tests an item's name or first line, so a multi-line braced import whose "./manifest.js" sits on a later line may be missed unless the item name is the module path. I could not verify this without the code or ast-grep.

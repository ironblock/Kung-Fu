A. Find every top-level `import` statement in `src` that imports from exactly `"./docket.js"` (default, braces, namespace, or bare import) and list those imports with one ast-grep outline command.
B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/facts/T03/v2/answer.txt:
ast-grep outline --items imports --type module --match '"\./docket\.js"' src

Why it is a guess: `--match` only sees an item's name or first line. A multi-line `import {` ... `} from "./docket.js";` has its path on a later line, so this command probably misses those, and I could not test it. The `--type module` and quoted-regex parts are meant to exclude the listed decoys, but I could not confirm that either.

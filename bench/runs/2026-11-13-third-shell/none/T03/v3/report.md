A. The task asks for one ast-grep outline command that lists every top-level import statement importing from exactly "./manifest.js" (default, braced names on one or several lines, namespace, or bare), and excludes look-alike paths, re-exports, dynamic imports, and string constants.

B. sure

The answer is written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-third-shell/none/T03/v3/answer.txt as one line:
ast-grep outline --items imports --view signatures --match '"\./manifest\.js"' src

Running it lists 5 imports, matching a manual read of the code: crates.js (default), index.js (bare), labels.js (braced), routes.js (namespace), and tools.js (multi-line braces; shown by its closing line `} from "./manifest.js";`).

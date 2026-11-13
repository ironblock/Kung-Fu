A. The task asks for one `ast-grep outline` command that lists every import statement from exactly `"./manifest.js"` (default, braced names, namespace, or bare side-effect import), and excludes re-exports, dynamic imports, and look-alike paths.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/rows/T03/v3/answer.txt:
ast-grep outline --items imports --match '^"\./manifest\.js"$' src

Running it returns five imports: src/routes.js (namespace), src/index.js (bare), src/labels.js (braces), src/tools.js (multi-line braces), src/crates.js (default).

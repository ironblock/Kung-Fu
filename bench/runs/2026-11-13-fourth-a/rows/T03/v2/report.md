A. Find the one ast-grep outline command that lists every import statement whose source is exactly "./docket.js" (default, braced names on one or several lines, namespace, or bare), and skip re-exports, dynamic import() calls, constants, and other paths.
B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/rows/T03/v2/answer.txt:
ast-grep outline --items imports --match '^"\./docket\.js"$' src

It lists 5 items: routes.js (namespace import), index.js (bare import), labels.js (braced), tools.js (multi-line braced), crates.js (default). Re-exports in index.js, the import() in tools.js, and the other-path imports are not listed.

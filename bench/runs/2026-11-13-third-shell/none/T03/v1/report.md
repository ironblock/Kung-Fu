A. Find the one ast-grep outline command that lists exactly the top-level import statements whose source is the exact string "./roster.js" across src/ (five of them: crates.js, index.js, labels.js, routes.js, tools.js), and no re-exports, dynamic imports, constants or other paths.
B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-third-shell/none/T03/v1/answer.txt:
ast-grep outline --items imports --match '^"\./roster\.js"$' src

Verified with ast-grep 0.51.1 from the work directory: it returns the five expected imports, one each, and none of the excluded forms.

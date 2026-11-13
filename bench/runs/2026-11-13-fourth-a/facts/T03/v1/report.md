A. The task asks for one ast-grep outline command that lists exactly the import statements from the module "./roster.js" (exact path) under src, counting default, braced, namespace, and bare imports, but not re-exports, dynamic imports, other paths, or other names.
B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/facts/T03/v1/answer.txt:
ast-grep outline --items imports --match '^"\./roster\.js"$' src

Running it returns five imports, one each in crates.js (default), tools.js (multi-line braces), labels.js (braces), index.js (bare), and routes.js (* as). This matches a manual grep of src, where the excluded cases (./rosters.js, ../roster.js, ./roster.json, ./lib/roster.js, ./books.js, the export-from in index.js, the dynamic import and the const string in tools.js) are all filtered out.

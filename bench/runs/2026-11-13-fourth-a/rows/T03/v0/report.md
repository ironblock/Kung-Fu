A. The task asks for one ast-grep outline command that lists exactly the import statements whose source is the exact string "./ledger.js" (default, named, namespace, bare, and multi-line forms count; re-exports, dynamic imports, other paths, and other modules' names do not).

B. sure

answer.txt (/tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/rows/T03/v0/answer.txt) contains:
ast-grep outline --items imports --match '^"\./ledger\.js"$' src

The command lists 5 imports, one per file: crates.js (default), index.js (bare), labels.js (named), routes.js (namespace), tools.js (multi-line named). I checked this against a manual read of every file in src.

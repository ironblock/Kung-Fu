A. The task asks for one ast-grep outline command that lists each import statement whose source is exactly "./ledger.js" (default, braced names, namespace, or bare side-effect import), and excludes look-alike paths, other-module imports, re-exports, dynamic import() calls, and string constants.

B. sure

Answer written to /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/bench-work/2026-11-13-fourth-a/facts/T03/v0/answer.txt:
ast-grep outline --items imports --match '^"\./ledger\.js"$' src

Running it returns 5 imports: crates.js (default), labels.js (named), routes.js (namespace), index.js (bare import), tools.js (multi-line named).

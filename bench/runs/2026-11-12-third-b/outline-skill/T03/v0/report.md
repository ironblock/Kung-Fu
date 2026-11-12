A. The task asks for one ast-grep outline command, run from the directory containing src, that lists only the top-level import statements whose module path is exactly "./ledger.js" (double-quoted, with the default, braced, namespace, or bare forms counted), and excludes look-alike paths, other modules' imports, re-exports, dynamic imports, and plain string constants.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/outline-skill/T03/v0/answer.txt:
ast-grep outline --items imports --match '"\./ledger\.js"' src

Reasoning: --items imports limits results to import items, which drops the string constant, the dynamic import(), and the export-from re-export. The regex requires the opening quote, "./ledger.js" and the closing quote, so "./ledgers.js", "../ledger.js", "./ledger.json" and "./lib/ledger.js" do not match. Unsure because I could not run ast-grep or view src, and I am assuming --match tests the import signature text, which includes the quoted path, and that re-exports are classed under exports rather than imports.

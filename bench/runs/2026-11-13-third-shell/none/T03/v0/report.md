A. Find every top-level import statement that imports from exactly "./ledger.js" in src/, and write it as one ast-grep outline command.
B. sure

The command in answer.txt (/tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-third-shell/none/T03/v0/answer.txt) is: ast-grep outline --items imports --match '"\./ledger\.js"' src

It lists 5 items: routes.js (namespace import), tools.js (multi-line named import), index.js (side-effect import), labels.js (named import), and crates.js (default import). It excludes the look-alike paths, the aliased import from books.js, the re-export, the import() call, and the string constant.

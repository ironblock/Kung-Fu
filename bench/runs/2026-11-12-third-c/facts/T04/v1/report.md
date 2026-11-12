A. The task asks for one ast-grep 0.51.1 outline command over src that lists every exported top-level const or let declaration (with a value of any kind, including arrow functions and class expressions), and excludes unexported ones, exported function and class declarations, export lists, and re-exports.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/facts/T04/v1/answer.txt:
ast-grep outline --type function,constant,variable --match 'export (const|let) ' src

Unsure because I could not run ast-grep or see src. The command relies on the first line of each item containing "export const" or "export let" (the --match regex is unanchored), and on arrow/function-expression consts being typed as function and other consts as constant, as facts.md states.

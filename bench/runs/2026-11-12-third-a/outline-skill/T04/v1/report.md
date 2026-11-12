A. The task asks for one ast-grep outline command, run from the directory containing src, that lists only the exported top-level const/let variables in src (each with a value of any kind) and excludes non-exported variables, exported functions and classes, export lists, and re-exports.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/outline-skill/T04/v1/answer.txt: `ast-grep outline --items structure --match '^export (const|let) ' src`. I could not run it or see src, so the --match regex assumes the item signature starts with the literal "export const"/"export let", and that structure mode lists exported variables. The SKILL.md does not list a variable type for --type, so I did not use it.

A. The task asks for one ast-grep 0.51.1 outline command that lists every exported top-level const or let declaration in src (any value type), and excludes non-exported variables, export lists, exported functions/classes, and re-exports.

B. guess

Answer written to /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/bench-work/2026-11-12-third-b/help/T04/v3/answer.txt:
ast-grep outline --items exports --no-ignore hidden --no-ignore dot --no-ignore vcs --match 'export (const|let) ' src

Reason for the guess: I could not see src or test ast-grep, and I did not know the symbol-type names the outline uses for variables, so I filtered with --match on the text "export const"/"export let" rather than --type. This depends on the signature or first source line containing that text. The --no-ignore flags are there so hidden and ignored files are not skipped.

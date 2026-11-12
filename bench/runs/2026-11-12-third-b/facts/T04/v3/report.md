A. The task asks for one ast-grep 0.51.1 outline command over src that lists every exported top-level `const` or `let` variable (any value, including arrow functions, function expressions and class expressions), and excludes non-exported declarations, export lists, exported function and class declarations, and re-exports.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/facts/T04/v3/answer.txt: `ast-grep outline --match '^export (const|let) ' src`

Reasoning and risk: the directory default already lists only exported items, and the regex anchors on the first line so that only items starting with `export const` or `export let` match. This leaves out exported function and class declarations, which start with `export function` or `export class`. The main uncertainty is whether the first line that --match checks includes the leading `export` keyword for exported items. If it does not, the regex would return nothing. I could not run the command to confirm.

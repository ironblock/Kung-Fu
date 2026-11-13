A. The task asks for one ast-grep outline command over src that lists only the exported top-level function declarations named exactly `bolt` (with or without async, and with export or export default), skipping longer names, parameters, consts, re-exports, non-exported functions, and class methods.

B. sure

The answer is written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-third-shell/none/T02/v2/answer.txt as:
ast-grep outline --items exports --type function --match '^bolt$' src

Running it returns exactly three items: src/labels.js (export function bolt), src/sorting.js (export async function bolt), and src/wax.js (export default function bolt). The non-exported bolt in src/tools.js and the Crate.bolt method are excluded. Nothing under src was changed.

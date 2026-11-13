A. The task asks for one ast-grep outline command that lists only the exported top-level function declarations named exactly `seal` (with or without `async`, and including `export default`), excluding longer names, parameters, constants, re-exports, non-exported functions, and class methods.
B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-third-shell/none/T02/v0/answer.txt:
ast-grep outline --items exports --type function --match '^seal$' src

Running it returns exactly three items: src/wax.js (export default function seal), src/labels.js (export function seal), and src/sorting.js (export async function seal). The non-exported seal in src/tools.js is excluded.

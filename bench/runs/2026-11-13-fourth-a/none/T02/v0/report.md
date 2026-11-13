A. The task asks for one ast-grep outline command over src/ that lists only the exported top-level function declarations named exactly `seal` (with optional export default and async), excluding longer names, parameters named seal, const initializers, re-exports, non-exported functions, and class methods.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/none/T02/v0/answer.txt:
ast-grep outline --items exports --type function --match '^export (default )?(async )?function seal\(' src

Verified with ast-grep 0.51.1. It returns three items: src/labels.js (export function seal), src/sorting.js (export async function seal), and src/wax.js (export default function seal). It excludes tools.js seal (not exported directly, only via an export list), the crates.js method, and the index.js re-export.

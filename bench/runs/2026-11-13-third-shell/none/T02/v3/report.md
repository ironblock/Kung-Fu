A. The task asks for one ast-grep outline command, run from the directory containing src, that lists only the exported top-level function declarations named exactly `fasten` (with or without `async`, with `export` or `export default`), excluding look-alikes such as fastenAll, unfasten, stamp's parameter, constants, re-exports, the non-exported function in tools.js, and the class method.
B. sure

The answer is in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-third-shell/none/T02/v3/answer.txt and contains:
ast-grep outline --type function --match '\bfasten\(' src

Running it lists three items: src/wax.js (export default function fasten), src/sorting.js (export async function fasten), and src/labels.js (export function fasten).

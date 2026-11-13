A. The task asks for one ast-grep outline command that lists only the exported top-level function declarations named exactly `latch` (with or without `export default` or `async`), excluding look-alikes such as longer names, parameters, calls, re-exports, non-exported declarations, and class methods.

B. sure

answer.txt is at /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-third-shell/none/T02/v1/answer.txt and contains:
ast-grep outline --items exports --type function --match '^latch$' src

Running it yields exactly three items: src/labels.js (export function latch), src/sorting.js (export async function latch), and src/wax.js (export default function latch). The non-exported latch in src/tools.js, the re-export in src/index.js, and the class method in src/crates.js are excluded.

A. The task asks for one ast-grep outline command that lists only the exported top-level function declarations named exactly `latch`, excluding lookalikes such as latchAll, parameters named latch, constants, re-exports, non-exported declarations, and class methods.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/none/T02/v1/answer.txt:
ast-grep outline --items exports --type function --match '^latch$' src

Verified with ast-grep 0.51.1 from the directory containing src. It lists exactly three items: src/wax.js (export default function latch), src/sorting.js (export async function latch), and src/labels.js (export function latch). The non-exported latch in src/tools.js is correctly excluded. Nothing under src was changed.

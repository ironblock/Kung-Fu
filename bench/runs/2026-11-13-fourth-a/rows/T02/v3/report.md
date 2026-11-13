A. The task asks for one ast-grep outline command that lists only the exported function declarations named exactly `fasten` in src (with or without async, export or export default), excluding look-alikes such as fastenAll, parameters, constants, re-exports, non-exported declarations, and class methods.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/rows/T02/v3/answer.txt:
ast-grep outline --items exports --type function --match '^fasten$' src

Verified with ast-grep 0.51.1 from the directory containing src: it lists exactly three items, src/labels.js (export function fasten), src/sorting.js (export async function fasten), and src/wax.js (export default function fasten). The non-exported function fasten in src/tools.js is not listed, and neither are the re-export in src/index.js or the class method in src/crates.js.

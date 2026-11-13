A. The task asks for one ast-grep outline command that lists exactly the exported top-level function declarations named bolt (with or without async, export or export default), excluding look-alikes such as boltAll, parameters named bolt, constants calling bolt, re-exports, non-exported functions and class methods.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/rows/T02/v2/answer.txt:
ast-grep outline --items exports --type function --match '^bolt$' src

Running it lists three items: src/labels.js (export function bolt), src/sorting.js (export async function bolt), and src/wax.js (export default function bolt). The non-exported bolt in src/tools.js, which is only named in an export list, is not listed.

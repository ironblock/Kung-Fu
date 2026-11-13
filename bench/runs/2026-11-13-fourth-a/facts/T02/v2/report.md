A. The task asks for one ast-grep outline command over src that lists exactly the exported top-level function declarations named `bolt` (with or without async, and including `export default`), excluding look-alikes such as methods, parameters, constants, re-exports, and non-exported functions.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/facts/T02/v2/answer.txt:
ast-grep outline --items exports --type function --match '^bolt$' src

It lists three items: src/labels.js (export function bolt), src/sorting.js (export async function bolt), and src/wax.js (export default function bolt). It skips the non-exported bolt in src/tools.js, the class method in src/crates.js, and the re-export and constant cases.

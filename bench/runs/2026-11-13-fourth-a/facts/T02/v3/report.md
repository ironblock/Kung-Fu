A. The task asks for one ast-grep outline command that lists only exported top-level function declarations named exactly `fasten` (with or without async, export or export default), excluding look-alikes such as non-exported functions, methods, constants, parameters and re-exports.
B. sure

answer.txt contains: ast-grep outline --type function --match '^fasten$' src

I ran it from the directory containing src. It lists three items: src/sorting.js (export async function fasten), src/labels.js (export function fasten) and src/wax.js (export default function fasten). It leaves out src/tools.js, where fasten is not exported directly, and the class method in src/crates.js. The file path is /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/facts/T02/v3/answer.txt.

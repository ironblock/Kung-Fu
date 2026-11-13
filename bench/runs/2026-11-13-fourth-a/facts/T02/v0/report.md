A. The task asks for one ast-grep outline command that lists only exported top-level function declarations named exactly `seal` (with or without async, and with export or export default), and excludes look-alikes such as sealAll, unseal, parameters named seal, constants, re-exports, non-exported functions, and class methods.
B. sure

answer.txt (/tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/facts/T02/v0/answer.txt) contains:
ast-grep outline --type function --match '^seal$' src

Its output lists src/sorting.js (export async function seal), src/labels.js (export function seal), and src/wax.js (export default function seal). It omits src/tools.js, whose seal is not exported directly (only named in an export list). Nothing under src was changed.

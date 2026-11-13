A. The task asks for one ast-grep outline command that lists only top-level exported function declarations named exactly `latch` (with or without async, and with or without default) and excludes look-alikes such as latchAll, parameters, consts, re-exports, unexported functions and class methods.
B. sure

The command written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/facts/T02/v1/answer.txt is:
ast-grep outline --type function --match '^latch$' src

On the run, it listed src/wax.js (export default function latch), src/labels.js (export function latch) and src/sorting.js (export async function latch). It correctly left out src/tools.js, where latch is declared without export and only named in a later export list. Nothing under src was changed.

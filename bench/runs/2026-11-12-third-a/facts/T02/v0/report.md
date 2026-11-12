A. The task asks for one ast-grep 0.51.1 outline command over src that lists only exported top-level function declarations named exactly `seal` (with or without async, export or export default), excluding look-alikes such as sealAll, parameters named seal, constants, re-exports, non-exported functions, and class methods.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/facts/T02/v0/answer.txt:
ast-grep outline --type function --match 'function seal\(' src

Why this form: a directory run already lists only exported items, so no --items flag is used (--items structure would add non-exported items). I matched on the first line instead of the name, because `^seal$` on the name would also catch `export const seal = () => ...`, which facts say is a function. Risk: the first-line match relies on the declaration being written as `function seal(` with no space before the parenthesis, and it is untested since I could not run the command.

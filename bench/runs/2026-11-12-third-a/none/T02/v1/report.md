A. The task asks for one single-line `ast-grep outline ... src` command that lists only exported top-level function declarations named exactly `latch` (with or without `async`, and with `export` or `export default`), excluding the look-alike cases the task lists.

B. guess

Written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/none/T02/v1/answer.txt:
ast-grep outline --pattern 'export function latch($$$ARGS) { $$$BODY }' --strictness ast src

Caveats: I could not verify this. I am not aware that ast-grep 0.51.1 has an `outline` subcommand, so the command form may itself be wrong. The `--strictness ast` choice is meant to let the one pattern also match `export async function latch` and `export default function latch`, since anonymous keywords are ignored in that mode. I could not confirm that behaviour or the flag's availability in 0.51.1.

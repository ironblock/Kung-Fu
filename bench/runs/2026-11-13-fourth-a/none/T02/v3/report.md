A. The task asks for one ast-grep outline command over src/ that lists exactly the exported function declarations named `fasten` (with or without `async`, and with `export` or `export default`), excluding longer names, parameters, constants, re-exports, non-exported functions, and class methods.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/none/T02/v3/answer.txt:
ast-grep outline --items exports --type function --match '^fasten$' src

Verified with ast-grep 0.51.1. It lists three items: src/wax.js (export default function fasten), src/sorting.js (export async function fasten), and src/labels.js (export function fasten). It excludes src/tools.js (non-exported fasten), the Crate.fasten method in src/crates.js, and fastenAll, unfasten, stamp, and the re-export in src/index.js.

A. The task asks for one ast-grep outline command over src that lists only exported top-level function declarations named exactly `bolt` (with optional `export default` and `async`), excluding longer names, parameters, constants, re-exports, non-exported functions and class methods.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/none/T02/v2/answer.txt:

ast-grep outline --items all --type function --match '^export (default )?(async )?function bolt\(' src

It returns three items: src/labels.js (export function bolt), src/sorting.js (export async function bolt), and src/wax.js (export default function bolt). The non-exported `function bolt` in src/tools.js is excluded by the regex, which anchors on `export`. No files under src were changed.

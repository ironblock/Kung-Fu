A. The task asks for one ast-grep outline command, run from the directory containing src, that lists every exported top-level const or let that declares a single name with a value, and excludes non-exported declarations, export lists, exported functions and classes, and re-exports.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/none/T04/v1/answer.txt:
ast-grep outline --inline-rules '{"id":"exported-vars","language":"javascript","rule":{"any":[{"pattern":"export const $NAME = $VALUE"},{"pattern":"export let $NAME = $VALUE"}]}}' src

Caveats: I do not know of an `outline` subcommand in ast-grep 0.51.1 (I believe it has run, scan, new, lsp, test), and I could not test anything. The `--inline-rules` flag is also a guess for that version. The pattern form is the part I am more confident in.

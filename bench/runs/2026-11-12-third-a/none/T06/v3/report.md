A. Write one single-line ast-grep outline command, run from the directory containing src, that lists only function declarations sitting at the top level of each JavaScript file (exported or not, including export default function), and excludes arrow functions, function expressions, nested functions, methods and classes.

B. guess

Wrote /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/none/T06/v3/answer.txt containing:
ast-grep outline --inline-rules '{id: top-level-functions, language: javascript, rule: {kind: function_declaration, any: [{inside: {kind: program}}, {inside: {kind: export_statement, inside: {kind: program}}}]}}' src

Caveats: I could not verify this against ast-grep 0.51.1 or the src tree. I am not certain that an `outline` subcommand exists in that version or that it accepts `--inline-rules`; the flag choice is an assumption. The rule logic relies on ast-grep's default stopBy for `inside` (direct parent only), so a function_declaration whose direct parent is program, or whose direct parent is an export_statement that sits directly under program, is matched; nested functions are excluded.

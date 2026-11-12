A. The task asks for one ast-grep outline command, run from the directory containing src, that lists only top-level exported function declarations named exactly `fasten` (with export or export default, optionally async), excluding longer names, parameters, constants, re-exports, non-exported declarations, and class methods.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/none/T02/v3/answer.txt:
ast-grep outline --inline-rules '{"id":"fasten","language":"javascript","rule":{"all":[{"kind":"function_declaration"},{"has":{"field":"name","regex":"^fasten$"}},{"inside":{"kind":"export_statement","stopBy":"neighbor"}}]}}' src

Caveats: I could not see src or run ast-grep, and I am not certain `ast-grep outline` or `--inline-rules` exists in 0.51.1 (the task forbids rule files, so inline rules were my only option). The "top-level" constraint is only approximated by requiring the function's direct parent to be an export_statement; I did not add an explicit program-parent check.

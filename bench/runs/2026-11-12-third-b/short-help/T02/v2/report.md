A. The task asks for one ast-grep outline command, run from the directory containing src, that lists only top-level exported function declarations named exactly `bolt` (with or without async, with export or export default), excluding longer names, parameters, consts, re-exports, non-exported functions, and class methods.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/short-help/T02/v2/answer.txt:
ast-grep outline --lang javascript --items exports --type function --match '^bolt$' src

Why unsure: the short-help lists the flags but not what --match tests (item name or signature text), nor whether --items exports would also include a non-exported `function bolt` named in a later `export {...}` list. I did not verify against src or ast-grep 0.51.1.

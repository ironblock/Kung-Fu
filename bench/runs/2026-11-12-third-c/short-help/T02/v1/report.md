A. The task asks for one ast-grep outline command, run from the directory containing src, that lists only top-level exported function declarations named exactly `latch` (with or without async, export or export default), excluding longer names, parameters named latch, constants, re-exports, non-exported functions, and class methods.

B. guess

The command written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/short-help/T02/v1/answer.txt is: ast-grep outline --items exports --type function --match '^latch$' src. I could not run it or see src, and the short-help lists --type values only as "comma-separated symbol types" without naming "function". I also could not confirm that --match tests the item name rather than the signature, or that --items exports leaves out a plain `function latch` that an `export {...}` list names.

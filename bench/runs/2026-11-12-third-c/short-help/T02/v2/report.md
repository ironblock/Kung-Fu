A. The task asks for one ast-grep outline command, run from the directory containing src, that lists only exported top-level function declarations named exactly `bolt` (with or without export default and async), excluding longer names, parameters named bolt, constants, re-exports, non-exported functions, and class methods.

B. unsure

The answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/short-help/T02/v2/answer.txt is: ast-grep outline --items exports --type function --match '^bolt$' src

Uncertainty: I could not run ast-grep or see src. The choice of --items exports relies on my reading of the help text, which does not say whether a non-exported `function bolt` that appears in a later `export {...}` list would be counted as exported by this mode. The --type function and --match '^bolt$' parts should exclude the other non-matching cases, but whether --match tests the bare name or a decorated label is also unverified.

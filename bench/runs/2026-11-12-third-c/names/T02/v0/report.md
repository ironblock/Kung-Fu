A. The task asks for one ast-grep outline command, run from the directory containing src, that lists only top-level exported function declarations named exactly `seal` (with or without async, export or export default), excluding longer names, parameters named seal, consts calling seal, re-exports, non-exported functions, and class methods.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/names/T02/v0/answer.txt: `ast-grep outline --lang javascript --type function --match '^seal$' src`. I could not verify the flag semantics (flags.txt lists only option names, not their behavior), and the command has no way to enforce the `export` requirement, so it likely over-matches non-exported `function seal` declarations and may not filter by export at all.

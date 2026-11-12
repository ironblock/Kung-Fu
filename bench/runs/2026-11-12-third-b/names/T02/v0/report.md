A. The task asks for one ast-grep 0.51.1 outline command over src/ that lists only top-level, exported function declarations named exactly `seal` (with or without async, export or export default), excluding longer names, parameters named seal, constants, re-exports, non-exported declarations, and class methods.

B. guess

The answer is written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/names/T02/v0/answer.txt as: ast-grep outline --lang javascript --no-ignore hidden --items function --match '^export (default )?(async )?function seal\(' src

I could not verify the flag semantics. flags.txt lists only option names, not their meanings, and I could not see src or run ast-grep. The --match regex may not match outline item text as I assumed, and --items may not filter by export status.

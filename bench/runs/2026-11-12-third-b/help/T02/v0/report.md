A. The task asks for one ast-grep outline command that lists only top-level exported function declarations named exactly `seal` (with or without async, export or export default), excluding longer names, parameters named seal, constants, re-exports, non-exported declarations, and class methods.

B. unsure

The answer written to /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/bench-work/2026-11-12-third-b/help/T02/v0/answer.txt is:
ast-grep outline --items exports --type function --match '^seal$' --no-ignore hidden --no-ignore dot --no-ignore vcs src

A. Write one ast-grep command, run from the directory containing src, that matches every direct call to `broadcast` on a bare `usher` identifier (from `usher` through the closing parenthesis) and nothing else.
B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-c/facts/T07/v3/answer.txt:
ast-grep run --pattern 'usher.broadcast($$$A)' --lang js src

Reasoning: the pattern is a call whose callee is the member expression `usher.broadcast`. Because `usher` must be a bare identifier, `this.usher.broadcast(...)` and `room.usher.broadcast(...)` do not match. `scribe.broadcast(...)`, `usher.broadcastAll(...)`, the plain `broadcast(...)`, and an uncalled `usher.broadcast` reference also do not match. `$$$A` matches zero or more arguments, so `usher.broadcast()` matches. The match ends at the call's closing parenthesis, so `.then(...)` wrapping it is excluded. `--lang js` is used so that files without a .js extension under src are searched too.

Unverified: I could not run ast-grep, so the command is untested. Two points are uncertain. First, optional-chaining calls (`usher?.broadcast(...)`) may or may not match this pattern in 0.51.1, and the facts file does not cover them. Second, I am not sure whether `run --lang` in 0.51.1 searches files regardless of extension.

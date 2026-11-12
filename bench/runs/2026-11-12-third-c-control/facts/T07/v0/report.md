A. The task asks for one ast-grep command that matches every call to `announce` on an object named `herald` (only a bare `herald` identifier, not `this.herald` or `room.herald`), matching from `herald` through the closing parenthesis, and excluding other objects, other methods, bare function calls, uncalled references, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c-control/facts/T07/v0/answer.txt:
ast-grep run --lang js --pattern 'herald.announce($$$ARGS)' src

Reasoning and caveats: the pattern matches a call whose callee is a member expression with object identifier `herald`, so `this.herald.announce(...)` and `room.herald.announce(...)` should not match, and zero-argument calls are covered by `$$$ARGS`. I could not run ast-grep or inspect src, so I could not verify it. Two risks: ast-grep may skip files whose extension it does not map to JavaScript when `--lang` is given (the task says every file counts), and optional-chaining calls (`herald?.announce(...)`) may or may not match. The facts.md content concerns `ast-grep outline` and was not relevant to this pattern-matching task.

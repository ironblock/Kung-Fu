A. The task asks for one ast-grep command that matches every direct call to `usher.broadcast(...)` (with any arguments, including none) under `src`, excluding calls on other objects or on a nested `usher`, bare references, and the plain function.
B. unsure

Written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a-control/facts/T07/v3/answer.txt: `ast-grep run --lang javascript --pattern 'usher.broadcast($$$ARGS)' src`

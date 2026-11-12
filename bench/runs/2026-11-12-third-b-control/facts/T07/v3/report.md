A. Write one ast-grep command that matches every call of `broadcast` on a bare `usher` identifier (any arguments, including none), excluding `this.usher`/`room.usher` receivers, other objects or methods, uncalled references, plain `broadcast(...)`, and strings, while covering every file under `src`.

B. unsure

The answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b-control/facts/T07/v3/answer.txt is: `ast-grep run --lang javascript --globs '**/*' --pattern 'usher.broadcast($$$ARGS)' src`. The pattern itself should give the right matches. The `--globs '**/*'` part is my guess at making sure files with non-.js extensions are searched too, and I could not verify that `--globs` exists in 0.51.1 or how it interacts with `--lang`. The facts.md file covers `ast-grep outline` and did not bear on this answer.

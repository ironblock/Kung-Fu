A. Write one ast-grep command that finds every call of `broadcast` on a bare identifier `usher` under `src/` (any arguments, including none), matching from `usher` through the closing parenthesis, while excluding other receivers, `this.usher`/`room.usher`, other methods, uncalled references, plain `broadcast(...)`, and strings.

B. unsure

Written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/skill/T07/v3/answer.txt:
ast-grep run --pattern 'usher.broadcast($$$)' --lang javascript src

Reasons for unsure: I could not run ast-grep, so this is untested. Two things I could not verify for 0.51.1: (1) whether `run --lang javascript` searches files whose extensions are not .js (the task says every file counts, so non-.js extensions may be present); (2) whether the pattern also catches optional-chain calls such as `usher?.broadcast(...)`, which it probably does not. I did not read anything under src/.

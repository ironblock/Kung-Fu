A. Find the first element of each array literal that is the sole argument of a plain `shelve(...)` call under `src/`, and output that element node (not the array or call) as the match.
B. unsure

The answer is written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-c/skill/T02/v2/answer.txt. I could not run ast-grep, so the rule is untested. The main risks are that the `nthChild` object form with `reverse: true` may not be supported in ast-grep 0.51.1, and that `inside` with default stopBy behaves as I expect.

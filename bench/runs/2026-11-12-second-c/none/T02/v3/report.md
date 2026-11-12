A. Write one ast-grep command that matches only the first element of an array literal that is the sole argument of a plain `corral(...)` call under src/, and nothing else.
B. guess

The command is in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-c/none/T02/v3/answer.txt. It is a scan with an inline JSON rule. I did not run it, since ast-grep is unavailable, and I did not inspect src/. Its matching relies on tree-sitter JavaScript node kinds and on relational stopBy defaults in ast-grep 0.51.1, which I did not verify.

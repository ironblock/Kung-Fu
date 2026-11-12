A. The task asks for one single-line ast-grep command (run against `src`, ast-grep 0.51.1) that matches the last parameter of every function declaration named `survey` with at least two parameters, matching the whole parameter (defaults, rest dots, destructuring) and excluding methods, function expressions, arrows, and nested functions.

B. unsure

The command is written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/facts/T01/v3/answer.txt. I did not run it, since ast-grep is unavailable here and I did not inspect `src`. The main risks are the stopBy/nthChild relational behaviour in 0.51.1 and whether the `any` of parameter kinds covers every parameter form.

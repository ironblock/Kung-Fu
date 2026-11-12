A. The task asks for one ast-grep 0.51.1 outline command that lists every top-level class declaration in src/ (exported, default-exported, or not, with or without extends), excluding class expressions stored in variables, classes nested in functions, and non-class names.
B. sure

The answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/facts/T01/v3/answer.txt is: ast-grep outline --items structure --type class src

This rests on facts.md items 2 and 3: --items structure lists exported and non-exported items, and --type class keeps only class items, while a non-arrow const such as a class expression is typed as a constant and so is excluded. I did not run the command, since src is not visible here.

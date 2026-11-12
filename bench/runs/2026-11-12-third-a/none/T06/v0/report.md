A. The task asks for one ast-grep outline command, run from the directory containing src, that lists every top-level JavaScript function declaration (exported, default-exported, or not, sync or async) and excludes arrow functions and function expressions stored in variables, nested functions, class methods, and classes.

B. guess

Written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/none/T06/v0/answer.txt: `ast-grep outline --lang js --pattern 'function $NAME($$$ARGS) { $$$BODY }' src`

Caveats: I could not verify this. I am not confident `outline` is a real ast-grep 0.51.1 subcommand (I know of run, scan, and related commands). The pattern matches function declarations at any depth, so nested functions are probably included, which the task excludes. I could not find a single-pattern way to restrict matches to the top level. I did not check the src tree, and I did not run anything.

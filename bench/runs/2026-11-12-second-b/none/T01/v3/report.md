A. The task asks for one ast-grep command that matches only the last parameter of each function declaration named `survey` with at least two parameters, wherever it is declared, and nothing else.
B. unsure

The answer is in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/none/T01/v3/answer.txt:
ast-grep run --pattern 'function survey($A, $$$B, $LAST) { $$$BODY }' --lang javascript src

Notes on the uncertainty: the `src` directory did not exist in the task directory, so I could not test the pattern. The "at least two parameters" constraint comes from requiring a leading `$A` plus a trailing `$LAST`. `--lang javascript` is my guess at how to make every file count regardless of extension, and I am not certain 0.51.1 `run` honours that for non-JS extensions.

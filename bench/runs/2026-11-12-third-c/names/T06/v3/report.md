A. The task asks for one ast-grep outline command, run from the directory containing src, that lists only top-level function declarations (exported, default-exported, or not, and async included) while excluding arrow functions and function expressions stored in variables, nested functions, class methods, and classes.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/names/T06/v3/answer.txt: `ast-grep outline --type function src`. I could not verify the flag or its value names. flags.txt lists only option names with no value lists, and I had no ast-grep or source to check against, so `--type function` is a guess. `--items` with a tree-sitter kind such as `function_declaration` is an equally plausible alternative.

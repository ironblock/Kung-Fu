A. The task asks for one ast-grep outline command, run from the directory containing src, that lists only top-level function declarations (exported, default-exported, or not, including async), and excludes arrow functions and function expressions stored in variables, nested functions, class methods, and classes.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/short-help/T06/v2/answer.txt: `ast-grep outline --items all --type function src`. I could not verify the `--type function` value name or whether arrow-function variables are also classified as "function" by the outline extractor, since I could not run ast-grep or see src.

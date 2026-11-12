A. The task asks for one ast-grep outline command, run from the directory containing src, that lists every top-level function declaration in the JavaScript files under src (exported, default-exported, or async), excluding arrow functions and function expressions stored in variables, nested functions, class methods, and classes.

B. guess

The answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/names/T06/v3/answer.txt is: ast-grep outline -l js --type function --no-ignore hidden src

Reason for uncertainty: flags.txt only lists option names, not their accepted values, so I could not confirm that --type takes "function" or that "hidden" is a valid --no-ignore value for ast-grep 0.51.1. I also could not inspect src to check whether any files are gitignored or hidden, so the --no-ignore choice is a guess.

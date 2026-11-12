A. The task asks for one ast-grep outline command, run from the directory containing src, that lists every top-level function declaration in src (exported or not, including export default function and async functions) while excluding arrow functions, function expressions, nested functions, class methods, and classes.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/short-help/T06/v0/answer.txt:
ast-grep outline --lang javascript --items all --type function --no-ignore hidden --no-ignore dot --no-ignore exclude --no-ignore global --no-ignore parent --no-ignore vcs src

Uncertainty: I could not inspect src or test the command. The --type function filter assumes ast-grep 0.51.1 classifies only function declarations as type "function" and not const arrow functions. If it does not, the command will over-list and the answer is wrong. The --items all and --no-ignore flags are there so that non-exported and ignored files are included, which I inferred from the task wording.

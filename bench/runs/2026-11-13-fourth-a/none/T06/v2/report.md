A. The task asks for one ast-grep outline command that lists every top-level function declaration in src (exported, default-exported, or not, including async), and excludes arrow functions and function expressions stored in variables, nested functions, class methods, and classes.

B. sure

/tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/bench-work/2026-11-13-fourth-a/none/T06/v2/answer.txt contains:
ast-grep outline --items structure --type function --match '\bfunction\b' --view names src

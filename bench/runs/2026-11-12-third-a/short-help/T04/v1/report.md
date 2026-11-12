A. The task asks for one ast-grep outline command (run from the directory containing src, with ast-grep 0.51.1) that lists only exported top-level const/let variables in src, including those whose values are arrow functions, function expressions or class expressions, and excluding unexported variables, export lists, exported function/class declarations and re-exports.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/short-help/T04/v1/answer.txt:
ast-grep outline -l javascript --items exports --type variable src

Why it is a guess: the short help only lists the --type and --items options and does not name the symbol type that outline uses for variables. I could not check whether "variable" is the right value, or whether arrow/function/class-valued consts are reported under that type rather than as functions or classes. I also could not verify that --items exports leaves out non-exported consts. The -l javascript flag is there to cover the "every file counts" requirement.

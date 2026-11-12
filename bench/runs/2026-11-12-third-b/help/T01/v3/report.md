A. The task asks for one ast-grep outline command, run from the directory containing src, that lists every top-level class declaration in the JavaScript files under src (exported, default-exported, or not) and excludes class expressions, classes nested in functions, and non-class names.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/help/T01/v3/answer.txt:
ast-grep outline --items structure --type class -l javascript --no-ignore hidden --no-ignore dot --no-ignore vcs --no-ignore exclude --no-ignore global --no-ignore parent src

Reasoning: --items structure is used because the default "exports" for a directory would miss non-exported classes, and "all" could double-count exports. --type class restricts output to classes. The --no-ignore flags are there so that every file counts, including hidden or ignored ones. I could not run ast-grep, so the flag behavior and the handling of class expressions are from the help text only.

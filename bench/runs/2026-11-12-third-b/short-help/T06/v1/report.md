A. The task asks for one ast-grep 0.51.1 outline command, run from the directory containing src, that lists every top-level function declaration in the JavaScript files under src (exported or not, including async and default exports) and excludes arrow functions, function expressions, nested functions, class methods, and classes.

B. unsure

The answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/short-help/T06/v1/answer.txt is: ast-grep outline --lang javascript --items all --type function --no-ignore hidden --no-ignore exclude --no-ignore vcs src

The uncertain part is the --type value "function". I could not confirm from short-help.txt which symbol-type name ast-grep uses for function declarations, and I could not run ast-grep to check. The --no-ignore flags are there so that files hidden or excluded by ignore rules are still searched, since the task says every file counts.

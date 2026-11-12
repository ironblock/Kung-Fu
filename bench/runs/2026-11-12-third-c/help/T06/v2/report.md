A. The task asks for one ast-grep outline command, run from the directory containing src, that lists only top-level function declarations (exported or not, including export default and async forms) and excludes arrow functions, function expressions, nested functions, class methods and classes, with each item listed once and every file under src included.

B. unsure

The command written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/help/T06/v2/answer.txt is:
ast-grep outline -l javascript --items structure --type function --no-ignore hidden --no-ignore dot --no-ignore vcs --no-ignore exclude --no-ignore global --no-ignore parent --follow src

Why unsure: I could not see src or run ast-grep, so I checked only against help.txt. --items structure is used because the default "exports" for a directory would drop non-exported functions, and structure should avoid duplicates that all could create. The --no-ignore flags and --follow are there so that hidden, ignored or symlinked files are not skipped. I am not certain the symbol type name is "function", or that --type function excludes arrow functions stored in variables, since those may be typed as variables.

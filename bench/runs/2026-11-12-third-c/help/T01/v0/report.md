A. The task asks for one ast-grep 0.51.1 outline command, run from the directory containing src, that lists every top-level class declaration in the JavaScript files under src (exported, default-exported, or not, with or without extends) while excluding class expressions bound to variables, classes nested in functions, and non-class names.

B. unsure

Written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/help/T01/v0/answer.txt:
ast-grep outline --lang js --items structure --type class --no-ignore hidden --no-ignore dot --no-ignore vcs --follow src

Reasoning: --items defaults to "exports" when a directory is given, so it is set to "structure" to get locally defined top-level items. --type class restricts the output to classes. The --no-ignore flags and --follow are there because the task says every file counts. I could not run ast-grep or see src, so I have not confirmed that exports appear once each, that the class-expression variables are left out, or that the default-export form is classified as a class.

A. The task asks for one ast-grep command, run from the directory containing src, that matches every class declaration with an extends clause (plain or dotted base, top-level or nested, extends on its own line), matching each whole declaration once, and excludes class expressions, extends-less declarations, functions, and the string literal.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/skill/T10/v2/answer.txt:
ast-grep run --pattern 'class $N extends $B { $$$ }' --lang javascript src

Reason for unsure: I could not run ast-grep, so this is untested. The pattern relies on ast-grep parsing a program-level class pattern as class_declaration, which should exclude class expressions and extends-less classes whose bodies contain extending expressions. I did not add flags for hidden or gitignored files, in case the "every file counts" note points to such files.

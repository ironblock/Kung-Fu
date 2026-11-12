A. The task asks for one ast-grep command, run from the directory containing src, that matches every class declaration with its own extends clause (plain or dotted base, top level or nested in a function, extends on its own line) and nothing else, excluding class expressions, classes without extends, functions, and strings.
B. unsure

The answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/none/T10/v1/answer.txt is:
ast-grep run --pattern 'class $C extends $B { $$$ }' --lang js src

I could not run ast-grep to test it. The reasoning is that the pattern parses as a class_declaration, so class expressions are excluded by kind, and $B matches a dotted member expression or a plain identifier. The main uncertainty is whether the pattern parses as class_declaration in ast-grep 0.51.1's JavaScript grammar and whether an anonymous default-export class is handled as the task expects.

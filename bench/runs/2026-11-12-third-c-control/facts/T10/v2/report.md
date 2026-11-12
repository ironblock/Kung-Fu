A. The task asks for one ast-grep run or scan command, run from the directory containing src, that matches every JavaScript class declaration with an extends clause (plain or dotted superclass, top level or nested in a function, extends on its own line) and nothing else, excluding class expressions, classes without extends, functions and strings.

B. unsure

The answer is written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c-control/facts/T10/v2/answer.txt. Its single line is: ast-grep run --lang javascript --pattern 'class $NAME extends $SUPER { $$$BODY }' src

Unsure because I could not run ast-grep or see src. The pattern should match only class_declaration nodes, since class expressions parse as a different node kind. The open risk is whether --lang javascript filters out files with non-.js extensions in 0.51.1.

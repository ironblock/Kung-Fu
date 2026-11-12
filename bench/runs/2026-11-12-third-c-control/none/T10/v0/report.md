A. The task asks for one ast-grep 0.51.1 command, run from the directory containing src, that matches every class declaration with an extends clause (plain or dotted base, top-level or nested, extends on its own line) and nothing else, such as class expressions, classes without extends, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c-control/none/T10/v0/answer.txt:
ast-grep run --lang javascript --pattern 'class $NAME extends $BASE { $$$BODY }' src

Reasoning: the pattern's root is a class declaration, so class expressions assigned to variables are not matched. $BASE matches a dotted name as one node. Whitespace and newlines do not matter to the parser, so extends on its own line still matches. Unsure because I could not inspect src or run ast-grep. Also, I did not confirm that --lang filters files by extension in 0.51.1, so any file with an unusual extension could be skipped. "Every file counts" may point to that risk.

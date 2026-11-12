A. The task asks for one ast-grep 0.51.1 command, run from the directory containing src, that matches every class declaration with an extends clause (plain or dotted base, top level or nested, extends on its own line) and nothing else, excluding class expressions, classes without extends, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c-control/none/T10/v3/answer.txt:
ast-grep run --pattern 'class $NAME extends $BASE { $$$BODY }' --lang js --globs '**/*' src

Reasoning: the pattern is a class_declaration kind, so class expressions and strings do not match, and the required extends excludes plain classes. $BASE matches a dotted member expression as a single node, and whitespace is ignored structurally, so extends on its own line still matches. The --globs '**/*' flag is there so that files with unusual extensions are searched too. I could not see src, and I did not verify the --globs flag against 0.51.1, so that part is the main uncertainty.

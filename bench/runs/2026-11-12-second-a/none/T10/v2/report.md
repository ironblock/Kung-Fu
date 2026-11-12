A. Write one ast-grep command, searched over src/, that matches every class declaration with an extends clause (plain or dotted superclass, top-level or nested, extends possibly on its own line) and nothing else, such as class expressions, plain classes, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/none/T10/v2/answer.txt:
ast-grep run --pattern 'class $C extends $B { $$$ }' --lang js src

Why unsure: the src directory is not in the task directory, so I could not inspect the files. The pattern relies on tree-sitter matching class_declaration nodes only, so class expressions and strings are excluded, and $B matches a dotted member expression. The open risk is that `--lang js` filters files by extension, so any JavaScript file with an unusual extension (the task says every file counts) would be skipped. I did not verify this against ast-grep 0.51.1.

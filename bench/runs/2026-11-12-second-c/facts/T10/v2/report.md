A. The task asks for one ast-grep command, run from the directory containing src, that matches every JavaScript class declaration with an `extends` clause (plain or dotted base, top level or nested, `extends` on its own line) and nothing else, such as class expressions, `Plain`/`Registry`-style declarations without their own extends, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-c/facts/T10/v2/answer.txt:
ast-grep scan --inline-rules '{id: extends-decl, language: javascript, rule: {kind: class_declaration, has: {kind: class_heritage}}}' src

Reasoning: a class declaration's extends clause is a `class_heritage` child, and class expressions have kind `class`, so this rule excludes them. Uncertainty: I did not inspect src (it is not in the working directory and I was limited to that directory), so I could not confirm that the grammar names the node `class_heritage` in ast-grep 0.51.1, or that files with unusual extensions (the task says every file counts) are picked up by the language filter.

A. The task asks for one ast-grep command, run from the directory containing src, that matches every JavaScript class declaration which has its own extends clause (plain or dotted base name, at any nesting, extends on its own line), and nothing else: not class expressions, not declarations without their own extends, not strings or functions.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/skill/T10/v2/answer.txt:
ast-grep scan --inline-rules '{id: class-extends, language: javascript, rule: {kind: class_declaration, has: {kind: class_heritage}}}' src

Why unsure: I could not run ast-grep, so this is from memory of the tree-sitter-javascript grammar (class_declaration with a class_heritage child). The reasoning is that a default (neighbor) stopBy on has only checks direct children, so nested class expressions inside the body are excluded. Two things I could not verify: that ast-grep 0.51.1 uses the node name class_heritage, and that scan's extension-based file filtering includes every file under src. The second matters because the task says every file counts, and scan has no --lang option to force the language on files with unusual extensions.

A. The task asks for one ast-grep command, run on src/ with ast-grep 0.51.1, that matches every class declaration with its own `extends` clause (plain or dotted superclass, top-level or nested, `extends` on its own line) and the whole declaration, while excluding class expressions, extends-less classes, functions and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-c/skill/T10/v2/answer.txt:
ast-grep scan --inline-rules '{id: extends-class, language: javascript, rule: {kind: class_declaration, has: {kind: class_heritage}}}' src

Reasoning: in tree-sitter-javascript a `class_declaration` has a direct `class_heritage` child only when it has its own `extends`. The default `has` stopBy (neighbor) checks direct children only, so classes nested in a body or class expressions inside are not matched. Dotted names and line breaks don't matter since the heritage node is the same either way. Uncertainties: I could not run ast-grep or list src/ to check for files with unusual extensions (ast-grep language-based file filtering may skip them) or gitignored files, and the command was not tested against the fixtures.

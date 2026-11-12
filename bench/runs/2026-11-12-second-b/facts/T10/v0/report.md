A. Find every class declaration under src/ that has its own extends clause (plain or dotted base name, top-level or nested, extends on its own line), returning each whole declaration once, while excluding class expressions, extends-less declarations that only contain such a class expression, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/facts/T10/v0/answer.txt:
ast-grep scan --inline-rules '{id: class-extends, language: JavaScript, rule: {kind: class_declaration, has: {kind: class_heritage, stopBy: neighbor}}}' --no-ignore hidden src

Uncertainty: I could not run ast-grep. The kind-based rule follows fact 1. stopBy: neighbor is meant to stop the has search at direct children, so a nested class expression inside Registry's body is not counted. I am not certain 0.51.1 supports stopBy on has, nor that --no-ignore hidden is a valid flag there. I also did not verify the tree-sitter node name class_heritage for that version.

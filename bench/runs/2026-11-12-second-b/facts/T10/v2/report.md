A. The task asks for one ast-grep command that matches every class declaration with its own `extends` clause (plain or dotted base, top level or nested, extends on its own line), excluding class expressions, plain classes, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/facts/T10/v2/answer.txt:
ast-grep scan --inline-rules '{id: extends-decl, language: javascript, rule: {kind: class_declaration, has: {kind: class_heritage, stopBy: neighbor}}}' src

Reasoning: `class_declaration` excludes `class_expression` (so `const Mixed = class extends ...` is skipped). The `class_heritage` node is the direct child of a class declaration holding `extends`, and `stopBy: neighbor` keeps `has` from seeing a nested class expression's heritage (the Registry case). I could not run ast-grep, so the node kind names (tree-sitter-javascript) and whether `stopBy` is supported in 0.51.1 are unverified.

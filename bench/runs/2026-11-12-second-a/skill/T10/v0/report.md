A. Find every JavaScript class declaration under src/ that has its own `extends` clause (plain or dotted superclass, at any nesting level, `extends` may wrap lines), matching each from `class` to its closing brace, while excluding class expressions, classes without their own `extends`, and text inside strings or functions.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/skill/T10/v0/answer.txt:
ast-grep scan --no-ignore hidden --no-ignore dot --no-ignore vcs --no-ignore exclude --inline-rules '{id: extends-class, language: javascript, rule: {kind: class_declaration, has: {kind: class_heritage}}}' src

Why this shape: `class_declaration` is the tree-sitter kind for declarations, and class expressions use the distinct kind `class`, so `const Mixed = class extends Shape {}` is excluded. `has` with the default `neighbor` stopBy only checks direct children, so the `class_heritage` (the `extends` clause) must belong to that declaration. A nested class expression inside `Registry` is therefore not counted. The `class_heritage` kind name and the `--no-ignore` value names are from memory; I could not run ast-grep 0.51.1 to confirm them. The `--no-ignore` flags are there to cover the "every file counts" hint (hidden or ignored files). If 0.51.1 rejects any of them, drop them and keep the rest.

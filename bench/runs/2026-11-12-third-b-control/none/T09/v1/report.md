A. Write one ast-grep command that matches every `throw` statement located anywhere inside a function declaration named `vet` (at any depth, including inside nested functions), and nothing else.
B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b-control/none/T09/v1/answer.txt:
ast-grep scan --inline-rules '{id: vet-throw, language: javascript, rule: {kind: throw_statement, inside: {kind: function_declaration, has: {kind: identifier, regex: "^vet$"}, stopBy: end}}}' src

Reasoning: `run --pattern` cannot express the ancestor condition, so this uses `scan` with an inline rule. `stopBy: end` lets `inside` look at every ancestor, not just the parent. `has` with the default neighbor stop only sees direct children of the function, so the only identifier it finds is the declaration's name, not calls to `vet` in the body. Method definitions and function expressions are different node kinds, so they are excluded. Not verified: I could not run ast-grep 0.51.1 here, so the `stopBy` and `kind`-based `has` behaviour in that version is from memory.

A. Find every `throw` statement (from `throw` to its semicolon) that sits anywhere inside a function declaration named exactly `audit`, at any depth and at any nesting level, while excluding throws in other functions, methods, function expressions, and top-level code.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a-control/facts/T09/v0/answer.txt:
ast-grep scan --inline-rules '{id: audit-throw, language: javascript, rule: {kind: throw_statement, inside: {kind: function_declaration, has: {field: name, regex: ^audit$}, stopBy: end}}}' src

Not verified: I could not run ast-grep, and I did not check the 0.51.1 support for `stopBy` or `has` with `field` in inline rules. The facts file only covers `outline`, so it gave no help with this command.

A. Find every `throw` statement (whole statement, `throw` to semicolon) under `src/` that sits anywhere inside a function declaration named `probe`, at any depth, while excluding throws in other functions, top-level throws, methods named `probe`, and the `function probe` expression.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/facts/T09/v2/answer.txt:
ast-grep scan --inline-rules '{id: probe-throw, language: javascript, rule: {kind: throw_statement, inside: {kind: function_declaration, stopBy: end, has: {kind: identifier, nthChild: 1, regex: "^probe$"}}}}' src

Reasoning: `stopBy: end` makes `inside` search all ancestors, not just the parent. The `has` clause matches the function's name identifier as its first direct named child. The `kind` constraints exclude function expressions and method definitions. I could not run ast-grep, so this is unverified. The main risks are whether ast-grep 0.51.1 accepts `stopBy` in this form and whether `nthChild` on the name identifier behaves as expected.

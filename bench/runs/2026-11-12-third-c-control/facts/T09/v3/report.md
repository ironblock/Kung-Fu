A. Find every `throw` statement (from `throw` to its semicolon) that sits anywhere inside a function declaration named `sift`, at any depth, excluding methods, function expressions, and throws outside `sift`, and write it as one ast-grep command in answer.txt.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c-control/facts/T09/v3/answer.txt:
ast-grep scan --inline-rules '{id: sift-throw, language: javascript, rule: {kind: throw_statement, inside: {kind: function_declaration, has: {field: name, regex: "^sift$"}, stopBy: end}}}' src

Reasoning: `inside` with `stopBy: end` matches a throw at any depth below a function_declaration, including nested blocks and nested functions. `has` with `field: name` restricts the declaration to the name `sift`. Method definitions and function expressions have different node kinds, so they are excluded. I could not run ast-grep, and facts.md did not cover relational rules or the `field` option, so the `has`/`field` and `stopBy` syntax in 0.51.1 is unverified.

A. Write a single ast-grep command that matches every `throw` statement located anywhere inside a function declaration named `probe` (at any depth, including inside nested functions), and excludes throws in other functions, methods named `probe`, function expressions, and top-level code.

B. unsure

The command written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a-control/none/T09/v2/answer.txt is:
ast-grep scan --inline-rules '{id: throw-in-probe, language: javascript, rule: {kind: throw_statement, inside: {kind: function_declaration, has: {field: name, kind: identifier, regex: "^probe$"}, stopBy: end}}}' src

Uncertainty: I could not test it, and I am not certain ast-grep 0.51.1 supports `field` inside `has`. If it does not, the rule would need a different way to pin the name to the declaration's name node.

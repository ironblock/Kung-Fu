A. Find every `throw` statement (from `throw` to its semicolon) under `src/` that sits anywhere inside a function declaration named `probe`, at any depth, while excluding throws in other functions, in methods named `probe`, and in the `function probe` expression.
B. unsure

The answer is written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-c/skill/T09/v2/answer.txt as one line:
ast-grep scan --inline-rules '{id: throw-in-probe, language: javascript, rule: {kind: throw_statement, inside: {kind: function_declaration, has: {field: name, regex: "^probe$"}, stopBy: end}}}' src

I could not run ast-grep, so this is unverified. The main uncertainties are that 0.51.1 accepts `field` inside `has` and that `--inline-rules` accepts flow-style YAML.

A. The task asks for one ast-grep command that matches only the last parameter of each function declaration named `survey` that has at least two parameters, at any nesting depth, excluding methods, expressions, arrows, and parameters of nested functions.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/skill/T01/v3/answer.txt:
ast-grep scan --inline-rules '{id: survey-last-param, language: javascript, rule: {inside: {kind: formal_parameters, stopBy: neighbor, inside: {kind: function_declaration, stopBy: neighbor, has: {field: name, regex: "^survey$"}}}, nthChild: {position: 1, reverse: true}, not: {nthChild: 1}}}' --no-ignore dot src

Why unsure: I could not run ast-grep, so this is unverified. Points I could not confirm for 0.51.1: that `nthChild` with `reverse` and `field` inside `has` are supported, that `stopBy: neighbor` on `inside` checks only the immediate parent as intended, and that `--no-ignore dot` is needed or harmless for the hidden-file and extension cases. Also, scan with `language: javascript` may skip files without a .js extension, which the task says must count.

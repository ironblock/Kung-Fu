A. The task asks for one ast-grep 0.51.1 command, written to answer.txt, that matches every `let` statement declaring exactly one variable with a value (with or without a semicolon) and nothing else.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-c/facts/T05/v0/answer.txt:
ast-grep scan --inline-rules '{id: single-let, language: javascript, rule: {pattern: "let $A = $B", not: {has: {kind: variable_declarator, nthChild: 2}}}}' src

Known weakness: `not: has` searches descendants, so a `let` whose value contains a multi-declarator `let` (for example, an arrow function body with `let a = 1, b = 2;`) would be wrongly excluded. I did not read src/ to check this, and I could not find a non-recursive way to restrict the check to direct declarators within the 0.51.1 facts. I did not run the command.

A. The task asks for one ast-grep command that matches every `let` statement declaring exactly one variable with a value (with or without a semicolon, at any depth, multi-line values included), and nothing else: no bare `let x;`, no multi-declarator `let` statements, no const/var, and no string containing "let".

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-11-first/skill/T05/v3/answer.txt:
ast-grep scan --inline-rules '{id: let-one, language: javascript, rule: {all: [{pattern: "let $N = $V"}, {not: {has: {kind: variable_declarator, nthChild: 2, stopBy: neighbor}}}]}}' src

Under ast-grep 0.51.1 this matches 8 statements, all in src/t05.js (lines 3, 4, 16, 18, 25, 26, 32, 35), and no others. Only t05.js contains `let`. The plain pattern `let $N = $V` also catches `let first = 1, second = 2;`, and `let $N = $V;` misses the semicolon-less statements, so the nthChild exclusion is what makes the answer correct.

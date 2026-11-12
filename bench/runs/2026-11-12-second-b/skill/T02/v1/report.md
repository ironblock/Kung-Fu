A. Write one ast-grep 0.51.1 command that matches only the first element of an array literal that is the sole argument of a plain call to `stockpile(...)`, and nothing else.
B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/skill/T02/v1/answer.txt:
ast-grep scan --inline-rules '{id: first-stockpile-element, language: javascript, rule: {nthChild: 1, inside: {kind: array, all: [{nthChild: 1}, {nthChild: {position: 1, reverse: true}}], inside: {kind: arguments, inside: {kind: call_expression, has: {field: function, regex: "^stockpile$"}}}}}}' src

Why unsure: I could not run ast-grep, so this is checked by reasoning only. Two points are unverified for 0.51.1: that the `nthChild` object form accepts `reverse`, and that `field: function` works inside `has` on call_expression. Also, the rule matches the element node via nthChild and the sole-argument check uses first and last named child of the arguments; I did not test the edge case of comments inside the array.

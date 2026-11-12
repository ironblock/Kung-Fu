A. The task asks for one ast-grep command that matches only the last parameter of each function declaration named `survey` with at least two parameters, wherever it is declared, excluding methods, function expressions, arrow functions, and parameters of nested functions.
B. unsure

The answer is written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/none/T01/v3/answer.txt and reads:
ast-grep scan --inline-rules '{id: survey-last-param, language: javascript, rule: {all: [{pattern: "$LAST"}, {nthChild: {position: 1, reverse: true}}, {inside: {kind: formal_parameters, has: {nthChild: 2}, inside: {kind: function_declaration, has: {kind: identifier, regex: "^survey$"}}}}]}}' src

Unverified: I could not run ast-grep, and I did not inspect src. The rule relies on the `nthChild` object form with `reverse`, relational `inside` with default neighbor stopBy, and `has` with `nthChild`, and I am not certain all of these are supported in ast-grep 0.51.1.

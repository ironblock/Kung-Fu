A. Write one ast-grep command, runnable as ast-grep 0.51.1 from the directory containing src, that matches only the first element of each array literal that is the sole argument of a plain shelve(...) call.

B. unsure

The answer is in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/skill/T02/v2/answer.txt. It is one line:
ast-grep scan --inline-rules '{id: shelve-first-element, language: javascript, rule: {nthChild: 1, inside: {kind: array_expression, stopBy: neighbor, inside: {kind: arguments, stopBy: neighbor, inside: {pattern: "shelve([$$$])", stopBy: neighbor}}}}}' src

I could not run ast-grep, so this is untested. The logic: nthChild: 1 selects the first named child of an array; the chain of neighbor-scoped inside rules requires that array to be a direct child of an arguments node whose parent is a call matching shelve([$$$]), which enforces a single array argument to a plain shelve identifier. Main risks: whether pattern "shelve([$$$])" matches the call_expression node in 0.51.1, and whether stopBy: neighbor behaves as I expect for inside.

A. Find the second argument of every plain-function call `pair(...)` that has at least two arguments, matching the argument node itself rather than the call.
B. sure

answer.txt (/tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-11-check/none/T08/answer.txt) contains:
ast-grep scan --inline-rules '{id: pair-second-arg, language: js, rule: {any: [{kind: identifier}, {kind: number}, {kind: string}, {kind: call_expression}, {kind: object}], pattern: $B, inside: {pattern: "pair($A, $B, $$$)", stopBy: end}}}' src

It matches exactly the four expected arguments in src/app.js: `2` (line 87), `right` (line 92), `"second"` (line 96) and `compute(2)` (line 100). The inner `2` inside `compute(2)` is excluded, and the one-argument `pair(only)` is not matched.

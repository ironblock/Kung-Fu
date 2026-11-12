A. The task asks for one ast-grep command, run from the directory containing src, that matches every throw statement inside a function declaration named sift (at any depth, including nested declarations) and nothing else, such as throws in siftAll, review, nightShift outside sift, top-level code, methods named sift, or the function expression assigned to strict.

B. unsure

The answer is in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/skill/T09/v3/answer.txt:
ast-grep scan --inline-rules '{id: sift-throw, language: javascript, rule: {kind: throw_statement, inside: {kind: function_declaration, stopBy: end, has: {field: name, regex: "^sift$"}}}}' src

I could not run ast-grep, so this is unverified. The main risks are that the `field: name` form inside `has` is not accepted by ast-grep 0.51.1, and that generator declarations (function* sift) would be missed if the grammar gives them a different kind.

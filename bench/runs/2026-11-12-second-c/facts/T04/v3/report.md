A. Write one ast-grep 0.51.1 command that matches every JavaScript array literal under src/ whose last element is the bare identifier `capstone` (including nested, multi-line, and trailing-comma cases), and nothing else such as destructuring, strings, or member/spread forms.

B. unsure

The answer is in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-c/facts/T04/v3/answer.txt:
ast-grep scan --inline-rules '{id: capstone-last, language: javascript, rule: {any: [{pattern: "[capstone]"}, {pattern: "[capstone,]"}, {pattern: "[$$$A, capstone]"}, {pattern: "[$$$A, capstone,]"}]}}' src

Why unsure: I could not run ast-grep, so this is untested. It relies on pattern matching treating array literals by kind (so array_pattern destructuring is excluded) and on `[$$$A, capstone]` matching only when the identifier is the direct last element. I did not verify whether `[capstone]` also matches `[capstone,]`, which is harmless under `any` but untested.

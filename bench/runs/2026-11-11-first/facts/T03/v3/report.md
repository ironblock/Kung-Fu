A. Find every call to the plain function `haul` whose first argument is exactly the name `hamper`, matching each call from `haul` to its closing parenthesis and excluding declarations, method calls, other functions, and first arguments that only contain the word.
B. sure

answer.txt is at /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-11-first/facts/T03/v3/answer.txt. It contains: ast-grep scan --inline-rules '{id: haul, language: javascript, rule: {kind: call_expression, regex: "^haul\\(\\s*hamper\\s*[,)]"}}' src

Verified: it reports 7 matches in src/t03.js (the 7 intended calls, including the multi-line one) and nothing else.

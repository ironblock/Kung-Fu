A. Find the first element of each array literal that is the sole argument of a plain `stockpile(...)` call (not method calls, not multi-argument calls, not nested arrays) and match that element itself.

B. sure

The answer is in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-11-first/none/T02/v1/answer.txt. It is one line:
ast-grep scan --inline-rules '{"id":"a","language":"javascript","rule":{"any":[{"kind":"number"},{"kind":"string"},{"kind":"identifier"},{"kind":"call_expression"},{"kind":"object"},{"kind":"array"}],"nthChild":1,"inside":{"kind":"array","stopBy":"neighbor","inside":{"kind":"arguments","stopBy":"neighbor","inside":{"pattern":"stockpile([$$$A])","stopBy":"neighbor"}}}}}' src

Running it on src matches exactly the ten expected elements in src/t02.js (3, "north", pending, loadNext(), {id: 1}, [1, 2], solo, the first pending, depth, firstJob). Nothing else in src matches.

A. Find every call to `usher.broadcast(...)` on a plain identifier `usher` (any arguments, including none), matching from `usher` through the closing parenthesis, while excluding other receivers, other methods, bare calls, uncalled references, and strings.
B. sure

answer.txt (/tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-11-first/none/T07/v3/answer.txt) contains: ast-grep run --pattern 'usher.broadcast($$$)' src
It matches the 8 intended calls in src/t07.js (the 4-line multi-line call included), and nothing else.

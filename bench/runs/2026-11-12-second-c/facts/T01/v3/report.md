A. The task asks for one ast-grep command, run from the directory containing src, that matches only the last parameter of each function declaration named survey with at least two parameters, wherever it is declared, including the full default value, rest dots, or destructuring pattern.

B. unsure

I wrote the answer to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-c/facts/T01/v3/answer.txt. I did not read or run anything against src, and I could not test it because ast-grep is not available here. The command relies on kind-based matching of parameter nodes, nthChild with reverse, and stopBy: neighbor in relational rules, and I am not certain that 0.51.1 supports stopBy or the exact behavior of these rules.

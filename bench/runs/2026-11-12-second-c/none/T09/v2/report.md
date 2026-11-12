A. Write one ast-grep 0.51.1 command, run from the directory containing src, that matches every throw statement inside a function declaration named probe (at any depth, including nested functions and arrows), and nothing else.
B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-c/none/T09/v2/answer.txt:
ast-grep scan --inline-rules '{"id":"throw-in-probe","language":"javascript","rule":{"kind":"throw_statement","inside":{"pattern":"function probe($$$ARGS) { $$$BODY }","stopBy":"end"}}}' src

Reasoning: scan is needed because run cannot express an ancestor relation. The pattern "function probe(...) {...}" parses as a function declaration, so method_definition probe, the function expression assigned to strict, and probeAll/review are excluded. stopBy "end" makes the ancestor search reach any depth. Uncertainty: I could not test it (no ast-grep), and I am not sure that 0.51.1 accepts stopBy on inside or JSON-form inline rules.

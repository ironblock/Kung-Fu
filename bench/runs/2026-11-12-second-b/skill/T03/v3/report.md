A. The task asks for one single-line ast-grep command (run against src with ast-grep 0.51.1) that matches each plain call to haul whose first argument is exactly the identifier hamper, including calls with more arguments, and excludes other positions, methods, look-alike names, and the function declaration.

B. unsure

Answer written once to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/skill/T03/v3/answer.txt:
ast-grep scan --inline-rules '{id: haul-hamper, language: javascript, rule: {any: [{pattern: "haul(hamper)"}, {pattern: "haul(hamper, $$$)"}]}}' src

Reasoning: the two alternatives cover the bare call and the call with trailing arguments. Member calls (depot.haul), haulAll, haul(1, hamper), haul("hamper"), haul(hamper.id), haul(hampers), haul(wrap(hamper), 1) and the declaration are excluded by the pattern shape. Not run, since ast-grep is unavailable.

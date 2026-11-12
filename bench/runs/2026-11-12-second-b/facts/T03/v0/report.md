A. Write one ast-grep command that matches every plain `ferry(...)` call under `src/` whose first argument is exactly the identifier `carton`, matching only the call itself and not look-alikes such as `ferry(1, carton)`, `depot.ferry(carton)`, `ferryAll(carton)` or the function declaration.

B. sure

The answer was written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/facts/T03/v0/answer.txt as: ast-grep scan --inline-rules '{id: ferry-carton, language: javascript, rule: {any: [{pattern: "ferry(carton)"}, {pattern: "ferry(carton, $$$A)"}]}}' src

The two alternatives are needed because `$$$A` can match zero arguments but a comma written before it must be in the code (fact 2), so `ferry(carton)` needs its own pattern. I did not run the command, since ast-grep is not available here, and I did not read anything under `src/`.

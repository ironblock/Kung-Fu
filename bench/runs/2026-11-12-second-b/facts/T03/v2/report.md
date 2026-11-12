A. Write one ast-grep command that finds every call to plain `convey` whose first argument is exactly `satchel`, matching the whole call, and excludes method calls, other first arguments, other names, and the function declaration.

B. unsure

The answer is in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/facts/T03/v2/answer.txt. It is one line:
ast-grep scan --inline-rules '{id: convey-satchel, language: javascript, rule: {any: [{pattern: "convey(satchel)"}, {pattern: "convey(satchel, $$$A)"}]}}' src

Why it is shaped this way: a pattern `convey(satchel, $$$A)` misses `convey(satchel)` (fact 2), so the two arities are listed under `any`. Plain `convey(...)` patterns do not match `depot.convey(...)`, `conveyAll(...)`, or the `function convey` declaration. Not verified by running: I could not run ast-grep, and I did not inspect src/ because it is outside the allowed directory. Open risk: if some files in src/ use extensions that the javascript language does not cover, they would be skipped.

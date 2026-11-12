A. Write one ast-grep command that matches every call to the plain function `convey` whose first argument is exactly `satchel`, and nothing else (no method calls, no `satchel` inside other expressions, no declarations).

B. unsure

The answer is in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/none/T03/v2/answer.txt. It is one line:
ast-grep scan --inline-rules '{id: convey-satchel, language: js, rule: {any: [{pattern: "convey(satchel)"}, {pattern: "convey(satchel, $$$)"}]}}' src

I could not run ast-grep, so this is untested. Two patterns are needed because `convey(satchel, $$$)` requires a comma and so will not match the single-argument form.

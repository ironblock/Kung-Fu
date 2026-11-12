A. The task asks for one ast-grep command that matches every call to the plain function `shuttle` whose first argument is exactly the identifier `crate` (with zero or more arguments after it), and excludes method calls, other first arguments, other function names, and the function declaration.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/none/T03/v1/answer.txt:
ast-grep scan --inline-rules '{id: shuttle-crate, language: JavaScript, rule: {any: [{pattern: "shuttle(crate)"}, {pattern: "shuttle(crate, $$$ARGS)"}]}}' src

Caveat: I could not inspect src (outside the allowed directory), so I could not confirm that every file under src uses a .js/.mjs/.cjs/.jsx extension that ast-grep's JavaScript language picks up. Also unverified against ast-grep 0.51.1 itself: that `--inline-rules` and the `JavaScript` language name are accepted by that version.

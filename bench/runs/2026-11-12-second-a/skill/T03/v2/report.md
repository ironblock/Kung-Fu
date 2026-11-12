A. The task asks for one ast-grep command that matches every plain call `convey(...)` whose first argument is exactly the name `satchel`, excluding method calls, other function names, declarations, and first arguments that only contain the word.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/skill/T03/v2/answer.txt:
ast-grep scan --inline-rules "{id: convey-satchel, language: javascript, rule: {any: [{pattern: 'convey(satchel)'}, {pattern: 'convey(satchel, \$\$\$)'}]}}" src

Reasoning: two patterns are needed because `convey(satchel, $$$)` does not match the one-argument form (no comma). Plain identifier `convey` excludes `depot.convey(...)` and `conveyAll(...)`, and `function convey(...)` is not a call_expression. Uncertainties: I could not inspect src (it is not present in the working directory, so I could not check file extensions or hidden files), and I could not run ast-grep. The "every file counts" wording may hint at files without a .js extension; `scan` with `language: javascript` may skip those, so the command may need a flag I could not verify for ast-grep 0.51.1.

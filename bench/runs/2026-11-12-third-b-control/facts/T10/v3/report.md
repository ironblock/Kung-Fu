A. The task asks for one ast-grep run command that matches every named class declaration with an `extends` clause under src (plain or dotted superclass, top-level or nested, `extends` on its own line), excluding class expressions, classes without `extends`, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b-control/facts/T10/v3/answer.txt:
ast-grep run --lang js --pattern 'class $C extends $B { $$$ }' src

Reasoning: `$B` matches any single expression, so dotted names like `Widgets.Base` are covered. Class expressions parse as a different node kind, so they should not match. `--lang js` forces JavaScript parsing so files without a .js extension are searched too. Known gap: an anonymous `export default class extends Shape {}` has no name, so `$C` will not match it. I could not test this because ast-grep is not available here.

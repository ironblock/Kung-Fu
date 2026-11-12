A. The task asks for one ast-grep command that matches every class declaration with an `extends` clause under `src` (plain or dotted base, top-level or nested, `extends` on its own line), and excludes class expressions, classes without `extends`, functions, and strings.
B. unsure

The command, written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c-control/facts/T10/v1/answer.txt:
ast-grep run --pattern 'class $NAME extends $BASE { $$$BODY }' --lang js src

Why I think it works: the pattern's root is a class declaration, so class expressions should not match. Whitespace is ignored, so a line break before `extends` is fine. `$BASE` is a single-expression wildcard, so it matches `Widgets.Base`. I could not run it, so these are reasoned, not tested. The facts.md outline notes did not affect the answer.

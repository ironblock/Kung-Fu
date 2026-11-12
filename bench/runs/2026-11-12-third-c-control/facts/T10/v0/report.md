A. The task asks for one ast-grep command over src/ that matches every JavaScript class declaration with its own `extends` clause (plain or dotted base, any nesting, `extends` on its own line), and excludes bare class declarations, class expressions, functions, and strings.

B. unsure

The command written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c-control/facts/T10/v0/answer.txt is:
ast-grep run --lang javascript --pattern 'class $NAME extends $BASE { $$$BODY }' src

I could not run ast-grep or see src, so this is untested. The main unverified assumption is that a pattern parsed as a statement becomes a class_declaration node, so class expressions are not matched. Anonymous `export default class extends X {}` is not matched by this pattern, which I judged acceptable.

A. The task asks for one ast-grep command that matches every named class declaration with an `extends` clause (plain or dotted superclass, top level or nested, `extends` on its own line), whole declaration from `class` to closing brace, and excludes class expressions, classes without their own `extends`, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a-control/none/T10/v2/answer.txt:
ast-grep run --pattern 'class $NAME extends $BASE { $$$BODY }' --lang js src

Notes: `--lang js` is there because the task says every file is JavaScript and some may not have a .js extension. The pattern parses as a class_declaration, so class expressions are not matched and a Registry-style nested class expression does not count. Known gap: an unnamed `export default class extends Shape {}` would not match, since the pattern requires a name. I could not test this (no ast-grep, no src), so the answer is unverified.

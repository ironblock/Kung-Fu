A. The task asks for one ast-grep command, run from the directory containing src with ast-grep 0.51.1, that matches every named class declaration with an extends clause (plain or dotted superclass, top level or nested, extends on its own line), whole declaration, and excludes class expressions, classes without extends, function declarations, and the string literal.
B. unsure

Written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/none/T10/v3/answer.txt:
ast-grep run --pattern 'class $N extends $B { $$$ }' --lang js src

Reasoning: the pattern parses as a class_declaration, so class expressions in variable declarators (a different node kind) are not matched, and classes without an extends clause do not match. $B matches a single named node, so both Base and Widgets.Base match, and whitespace or line breaks between tokens do not matter. Not verified: ast-grep was not run (per the conditions). Known gaps: a nameless `export default class extends X {}` will not match because the pattern requires $N, and a non-name superclass such as `extends mixin(Base)` would also match since $B is unconstrained. I did not add a regex constraint on $B because the task only describes plain and dotted names.

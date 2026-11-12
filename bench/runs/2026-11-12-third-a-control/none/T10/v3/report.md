A. The task asks for one ast-grep command, run from the directory containing src, that matches every named JavaScript class declaration with an extends clause (plain or dotted superclass, at any nesting, extends possibly on its own line) and nothing else, such as class expressions, classes without extends, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a-control/none/T10/v3/answer.txt:
ast-grep run --pattern 'class $C extends $B { $$$ }' --lang js src

Reasoning: the pattern parses as a class_declaration, so class expressions (different tree-sitter kind) should not match, and classes with no extends clause cannot match. $B matches a plain identifier or a member expression such as Widgets.Base, and whitespace or newlines do not affect the match. Uncertain points, which I could not verify because ast-grep is not installed and I could not see src: whether --lang js makes run search files with non-.js extensions, and whether an anonymous "export default class extends X" should count (this pattern does not match it).

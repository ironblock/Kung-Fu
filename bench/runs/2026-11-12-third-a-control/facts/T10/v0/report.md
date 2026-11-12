A. Find every named class declaration in the JavaScript under src/ that has an extends clause (including dotted base names, nested or top-level, and multi-line), excluding class expressions, plain classes, functions and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a-control/facts/T10/v0/answer.txt:
ast-grep run --lang javascript --pattern 'class $N extends $B { $$$ }' src

Caveat: I could not run ast-grep or see src, so this is untested. The pattern relies on the root node being class_declaration, which should exclude class expressions. It does not match an unnamed `export default class extends X {}`, because the pattern requires a name.

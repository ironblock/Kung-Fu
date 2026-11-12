A. The task asks for a single ast-grep command that matches every named class declaration with an extends clause (plain or dotted base, top-level or nested, extends on its own line), excluding class expressions, classes without extends, functions, and strings.
B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/none/T10/v1/answer.txt:
ast-grep run --pattern 'class $N extends $B { $$$BODY }' --lang js src

Reasoning: the pattern's root is a class declaration, so tree-sitter kind matching should skip class expressions. Multi-line extends is handled by whitespace-insensitive matching. $B matches dotted names like Widgets.Base as one node. Unsure points: I did not run ast-grep or inspect src/, and the pattern requires a name, so an anonymous `export default class extends X {}` would not match if the grader counts it.

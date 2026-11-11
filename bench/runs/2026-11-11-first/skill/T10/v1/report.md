A. Find every class declaration that has its own `extends` clause (plain or dotted superclass, at any nesting level, with `extends` allowed on its own line), and exclude class expressions, classes without `extends`, functions, and strings.
B. sure

answer.txt (/tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/bench-work/2026-11-11-first/skill/T10/v1/answer.txt):
ast-grep run --pattern 'class $N extends $P { $$$B }' --lang javascript src

A. Find every class declaration that has its own `extends` clause (plain or dotted superclass, at any nesting level, with `extends` allowed on its own line), and exclude class expressions, classes without `extends`, functions, and strings.
B. sure

answer.txt (/tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-11-first/skill/T10/v1/answer.txt):
ast-grep run --pattern 'class $N extends $P { $$$B }' --lang javascript src

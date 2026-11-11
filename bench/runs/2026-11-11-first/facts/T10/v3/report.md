A. The task asks for one ast-grep command that matches every class declaration with its own `extends` clause under src (dotted base names, nested declarations, and `extends` on its own line included) and nothing else.
B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-11-first/facts/T10/v3/answer.txt:
ast-grep run --pattern 'class $N extends $B { $$$BODY }' --lang js src

It matches exactly 5 nodes, all in src/t10.js: Circle, Ring, Badge (Widgets.Base), Tower (extends on its own line), and Stamp (inside drawAll). It skips the expression-only and string cases.

A. Find every class declaration that has its own `extends` clause (plain or dotted base name, top level or nested in a function, `extends` may sit on its own line), matching each whole declaration from `class` to its closing brace, and excluding class expressions, classes without `extends`, functions, and strings.
B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-11-first/skill/T10/v2/answer.txt:
ast-grep run --pattern 'class $N extends $B { $$$ }' --lang javascript src

It matches the five intended declarations in src/t10.js: Circle, Ring, Badge (Widgets.Base), Tower (extends on its own line), and Stamp (inside a function). It skips Shape, Plain, Registry, the class expressions in Mixed and Named (and the one inside Registry), Legacy, and the string in poster.

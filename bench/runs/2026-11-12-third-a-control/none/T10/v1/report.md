A. The task asks for one ast-grep command that matches every named class declaration with an `extends` clause (superclass as plain or dotted name, at any nesting level, with `extends` possibly on its own line), matching each whole declaration once and excluding class expressions, classes without `extends`, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a-control/none/T10/v1/answer.txt:
ast-grep run --pattern 'class $C extends $B { $$$ }' --lang javascript src

Caveat: the pattern requires a class name, so an anonymous `export default class extends Shape {}` would not match if it parses as a class declaration. I could not check this against the code or run ast-grep.

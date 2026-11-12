A. The task asks for one ast-grep command that matches every named class declaration with an `extends` clause (plain or dotted superclass, at any nesting depth, with `extends` possibly on its own line), excluding class expressions, classes without `extends`, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b-control/none/T10/v2/answer.txt:
ast-grep run --pattern 'class $NAME extends $BASE { $$$BODY }' --lang js src

Reasoning, untested since ast-grep was unavailable: the pattern is parsed as a class declaration, so tree-sitter's class_declaration kind should exclude class expressions. Requiring a name excludes anonymous `class extends` expressions. `$BASE` as a single expression metavariable covers `Widgets.Base`, and whitespace is ignored so a line-broken `extends` still matches. `--lang js` is set so files are parsed as JavaScript regardless of extension.

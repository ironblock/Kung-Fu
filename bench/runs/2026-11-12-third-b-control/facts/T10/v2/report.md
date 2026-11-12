A. The task asks for one ast-grep command that matches every class declaration with an `extends` clause (plain or dotted superclass, top-level or nested, `extends` possibly on its own line) and excludes class expressions, plain classes, functions and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b-control/facts/T10/v2/answer.txt:
ast-grep run --pattern 'class $C extends $B { $$$ }' --lang js src

Reasoning, untested because ast-grep is unavailable: the pattern targets the class_declaration node, so class expressions (kind "class") and strings are excluded, and a dotted superclass fits `$B` as an expression. The main uncertainty is whether `--lang js` skips files whose extensions are not .js/.mjs/.cjs/.jsx, and whether hidden or ignored files under `src` are searched; I did not add `--no-ignore` flags because I could not verify their exact syntax for 0.51.1.

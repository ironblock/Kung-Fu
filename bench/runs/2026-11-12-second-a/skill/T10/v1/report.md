A. The task asks for one ast-grep command that matches every JavaScript class declaration with an `extends` clause (plain or dotted base name, top-level or nested, `extends` on its own line), matching the whole declaration, and excludes class expressions, classes without their own `extends`, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/skill/T10/v1/answer.txt:
ast-grep scan --inline-rules '{id: class-extends, language: javascript, rule: {all: [{kind: class_declaration}, {has: {kind: class_heritage, stopBy: neighbor}}]}}' --no-ignore hidden --no-ignore dot --no-ignore vcs --no-ignore exclude --no-ignore global --no-ignore parent src

Why unsure: I could not run ast-grep, so this is untested. The rule relies on the tree-sitter-javascript node names `class_declaration` and `class_heritage` (believed correct for 0.51.1). The `--no-ignore` values are from memory and may not all be accepted by 0.51.1; if that version rejects one, the command will error. Files whose extension ast-grep does not treat as JavaScript would be skipped, and I did not inspect src/ because the task directory did not include it.

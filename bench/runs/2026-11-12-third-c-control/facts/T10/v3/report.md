A. The task asks for one ast-grep command that matches every class declaration with an `extends` clause (plain or dotted base, top-level or nested, `extends` on its own line) and nothing else, such as class expressions, classes without their own `extends`, functions, and strings.

B. unsure

The command written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c-control/facts/T10/v3/answer.txt:
ast-grep scan --inline-rules '{id: class-extends, language: JavaScript, rule: {kind: class_declaration, has: {kind: class_heritage, stopBy: neighbor}}}' src

Uncertainties: I could not run ast-grep, so the rule is untested. I relied on tree-sitter JavaScript structure (class_declaration with a direct class_heritage child; class expressions are a different kind). The command does not force inclusion of files with non-.js extensions, which the task's "every file counts" might require; I did not verify whether scan with language JavaScript picks those up under 0.51.1.

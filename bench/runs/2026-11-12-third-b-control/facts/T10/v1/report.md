A. The task asks for one ast-grep command that matches every class declaration with its own `extends` clause (plain or dotted superclass, top-level or nested, `extends` on its own line), excluding class expressions, classes without `extends`, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b-control/facts/T10/v1/answer.txt:
ast-grep run --lang javascript --pattern 'class $C extends $B { $$$BODY }' src

Why unsure: I could not run ast-grep or see `src`, so this is reasoned from the task only. The pattern relies on class declarations and class expressions having different node kinds, and on `$B` matching a dotted member expression. I also could not confirm that `--lang javascript` makes the search cover files with non-.js extensions, which the task's "every file counts" hints at.

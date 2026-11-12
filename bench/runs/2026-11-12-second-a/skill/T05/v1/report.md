A. The task asks for one ast-grep command that matches every `let` statement declaring exactly one variable with a value (with or without semicolon, any value), and nothing else, searching `src`.
B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/skill/T05/v1/answer.txt:
ast-grep run --pattern 'let $NAME = $VALUE' --lang javascript src

Why unsure: I could not run ast-grep, so this is reasoned from the pattern semantics, not tested. Points I could not verify: (1) smart strictness should reject multi-declarator forms like `let a = 1, b = 2;` and `let spare, used = 3;`, but I did not confirm that; (2) `--lang` may restrict files by extension, and the task's "every file counts" hints that some files may have non-standard extensions or be ignored by default, which this command does not address; (3) `for (let i = 0; ...)` headers would also match, and the task does not say whether they count.

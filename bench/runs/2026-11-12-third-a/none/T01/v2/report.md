A. The task asks for one ast-grep outline command, run from the directory containing src, that lists only top-level class declarations (plain, exported, or export default, with or without extends) and excludes class expressions, nested classes, and non-class names.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/none/T01/v2/answer.txt:

ast-grep outline --lang js --no-ignore hidden --no-ignore vcs --inline-rules '{id: top-level-classes, language: JavaScript, rule: {kind: class_declaration, any: [{inside: {kind: program, stopBy: neighbor}}, {inside: {kind: export_statement, stopBy: neighbor}}]}}' src

Caveats: I could not verify this against ast-grep 0.51.1 or the src tree. I am not certain that an `outline` subcommand or the `--inline-rules` flag exists in that version. The `--no-ignore` flags were added to cover the "every file counts" hint, which I read as possibly meaning hidden or VCS-ignored files. The top-level logic relies on class_declaration nodes whose immediate parent is program or export_statement, with stopBy: neighbor restricting the check to the direct parent. Class expressions use class nodes, not class_declaration, so they are excluded.

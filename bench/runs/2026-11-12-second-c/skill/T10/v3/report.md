A. The task asks for one ast-grep command that matches every JavaScript class declaration with an `extends` clause (plain or dotted superclass, top-level or nested, `extends` on its own line), matching the whole declaration, and excluding class expressions, extends-free declarations, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-c/skill/T10/v3/answer.txt:
ast-grep scan --inline-rules 'id: extends-class, language: javascript, rule: {kind: class_declaration, has: {kind: class_heritage, stopBy: neighbor}}' src

Reasons for the uncertainty: I could not run ast-grep, so the command is untested. The node kind names (class_declaration, class_heritage) come from my recollection of tree-sitter-javascript, not from a checked parse. I also did not confirm that `scan` with a `language: javascript` rule reaches files whose extensions are not .js/.jsx/.mjs/.cjs. The task says "every file counts", which hints that some files have unusual extensions, and that is the main risk to the match count. I did not read the files under src/.

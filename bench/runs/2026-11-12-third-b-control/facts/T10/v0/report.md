A. The task asks for one ast-grep command that matches every class declaration with its own `extends` clause under `src` (plain or dotted base names, top-level or nested, `extends` on its own line), and excludes class expressions, classes without `extends`, functions, and strings.

B. unsure

The command, written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b-control/facts/T10/v0/answer.txt: ast-grep scan --inline-rules '{id: m, language: javascript, rule: {kind: class_declaration, has: {kind: class_heritage, stopBy: neighbor}}}' src

I could not run it. The `kind` names (class_declaration, class_heritage) and the `stopBy: neighbor` option are from memory of the tree-sitter JavaScript grammar and ast-grep 0.51.1, not checked. `facts.md` covers only `ast-grep outline`, so it did not help here.

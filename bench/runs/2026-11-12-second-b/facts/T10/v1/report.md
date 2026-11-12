A. The task asks for a single ast-grep command that matches every JavaScript class declaration with its own `extends` clause (plain or dotted base, top-level or nested, `extends` on its own line), matching each declaration whole, and excluding class expressions, extends-free declarations that merely mention extends, functions, and strings.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/facts/T10/v1/answer.txt:
ast-grep scan --inline-rules '{id: extends-class, language: javascript, rule: {kind: class_declaration, has: {kind: class_heritage, stopBy: neighbor}}}' src

Caveats: I did not inspect src (it was outside what I was allowed to read) and could not run ast-grep, so this is untested. The `stopBy: neighbor` option is what keeps an outer class without its own extends from matching when a nested class expression extends. Unverified risks: that `stopBy` is supported in 0.51.1, that the node kind is `class_heritage` in its grammar, and that `language: javascript` in an inline rule covers files whose extensions are not .js. The task's "every file counts" hint suggests the extension issue may matter.

A. Write one ast-grep command that matches every `throw` statement located anywhere inside a function declaration named `sift` (including nested blocks, arrow functions, and nested functions, and nested `sift` declarations), while excluding throws in other functions, class/object methods named `sift`, and the `function sift(order)` expression.
B. unsure

The command written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/skill/T09/v3/answer.txt is:
ast-grep scan --inline-rules '{id: sift-throw, language: javascript, rule: {kind: throw_statement, inside: {kind: function_declaration, has: {field: name, regex: "^sift$"}, stopBy: end}}}' src

I could not run ast-grep, so this is untested. The logic relies on `inside` with `stopBy: end` checking all ancestors, and on the `name` field of function_declaration being matched by an anchored regex. The grammar kinds `function_declaration` and `throw_statement` are from memory of tree-sitter-javascript; a function expression uses a different kind, so the `strict` case should be excluded.

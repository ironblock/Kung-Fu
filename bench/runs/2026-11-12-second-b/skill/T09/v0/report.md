A. Write one ast-grep command, run against src, that matches every throw statement inside a function declaration named audit (at any depth, including nested declarations and nested functions), and nothing else.
B. unsure

Notes: the src directory does not exist under the task directory, so I could not test the command against code. The answer was written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/skill/T09/v0/answer.txt as one line:
ast-grep scan --inline-rules '{id: audit-throw, language: javascript, rule: {kind: throw_statement, inside: {stopBy: end, any: [{kind: function_declaration, has: {field: name, regex: "^audit$"}}, {kind: generator_function_declaration, has: {field: name, regex: "^audit$"}}]}}}' src

Judgment calls: I included generator_function_declaration (function* audit) as a function declaration. I did not exclude a throw inside a method named audit that happens to sit inside an audit declaration, since the task is ambiguous there. scan only applies the javascript rule to files with JavaScript extensions, so a file with an unusual extension would be skipped.

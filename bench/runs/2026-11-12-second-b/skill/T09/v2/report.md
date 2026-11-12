A. Write one ast-grep command, run from the directory containing src, that matches every throw statement inside a function declaration named probe (at any depth, including nested declarations and nested functions) and nothing else.
B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/skill/T09/v2/answer.txt:
ast-grep scan --inline-rules 'id: probe-throws, language: javascript, rule: {kind: throw_statement, inside: {kind: function_declaration, stopBy: end, has: {field: name, regex: "^probe$"}}}' --no-ignore hidden --no-ignore dot --no-ignore vcs --no-ignore exclude --no-ignore global --no-ignore parent src

Not verified: ast-grep was not available, so the command was not run. The rule logic is from the rule reference. The --no-ignore values are included so that files excluded by ignore rules are still searched, since the task says every file counts. I did not confirm that these exact values are accepted by ast-grep 0.51.1. Also, function* probe (generator_function_declaration) is not matched because the task only mentions plain function declarations.

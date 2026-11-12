A. Find every `return` statement in src/ (JavaScript) that returns only a bare name, and write one ast-grep command that matches exactly those, excluding `return;`, non-name expressions, `this`, `null`, `true`, and arrow functions.
B. unsure

The command written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-c/facts/T06/v1/answer.txt is:
ast-grep scan --inline-rules '{id: bare-name-return, language: javascript, rule: {kind: return_statement, regex: "^return\\s+[A-Za-z_$][A-Za-z0-9_$]*;?$", not: {regex: "^return\\s+(this|null|true|false)\\b;?$"}}}' src

Why it is unsure: I could not inspect src/ or run ast-grep, so this is untested. It matches on the return statement's text rather than its syntax tree, which I chose because the facts file shows `has` searches may not reach only direct children. Known gaps: `return undefined;` and `return NaN;` are matched because they are identifiers; I kept them as names. A comment between `return` and the name would not match.

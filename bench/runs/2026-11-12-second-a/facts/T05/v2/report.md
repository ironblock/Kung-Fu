A. The task asks for one ast-grep command, run from the directory containing src, that matches every `let` statement declaring exactly one variable with a value (with or without a semicolon, at any depth) and nothing else, such as `let pending;`, multi-declarator lets, const/var, and the string "let mode = 1".

B. unsure

The answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/facts/T05/v2/answer.txt is:
ast-grep scan --inline-rules 'id: let-single, language: javascript, rule: {pattern: "let $A = $B", not: {has: {kind: variable_declarator, nthChild: 2}}}' src

I could not run ast-grep, so this is untested. It relies on fact 3 (a pattern without a trailing semicolon still matches statements that have one, and the `has`/`nthChild: 2` exclusion works as described in facts.md). Two points are uncertain: whether `let` loop initializers (for (let i = 0; ...)) should count, since the rule matches them; and whether the `has` exclusion only looks at direct children, which I assumed is the 0.51.1 default.

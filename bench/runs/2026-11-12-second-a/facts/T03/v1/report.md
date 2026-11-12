A. The task asks for one ast-grep command (run from the directory containing src, ast-grep 0.51.1) that matches every call to the plain function shuttle whose first argument is exactly the identifier crate, and nothing else, such as method calls, other first arguments, other function names, or the function declaration.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/facts/T03/v1/answer.txt:
ast-grep scan --inline-rules '{id: shuttle-crate-first, language: javascript, rule: {any: [{pattern: "shuttle(crate)"}, {pattern: "shuttle(crate, $$$A)"}]}}' src

Reasoning: the two alternatives cover the one-argument case and the case with more arguments after a comma. Because the pattern fixes the prefix, $$$A cannot stop early and miss anything (fact 2). A pattern call_expression with an identifier callee does not match member calls like depot.shuttle, the declaration (formal_parameters, not arguments), shuttleAll, or wrap(crate)/crate.id/crates as the first argument. I could not run ast-grep, so this is untested. It also assumes the language name "javascript" is accepted in 0.51.1 for files without extensions.

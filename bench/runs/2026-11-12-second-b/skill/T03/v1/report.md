A. Write one ast-grep command, run under ast-grep 0.51.1 from the directory containing src, that matches each call to the plain function shuttle whose first argument is exactly the identifier crate (with or without further arguments), and nothing else.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/skill/T03/v1/answer.txt:

ast-grep scan --inline-rules '{id: shuttle-crate-first-arg, language: javascript, rule: {kind: call_expression, regex: "^shuttle\\(\\s*crate\\s*(,|\\))", has: {field: function, regex: "^shuttle$"}}}' src

Why this form: a plain pattern cannot express "crate as first argument, with or without more arguments" in one command (shuttle(crate, $$$) misses shuttle(crate)). The regex anchors the call text at the start, requires crate to be followed by a comma or closing paren, and the has/field check requires the callee to be exactly the identifier shuttle. That excludes depot.shuttle, shuttleAll, shuttle("crate"), shuttle(crate.id), shuttle(crates), shuttle(wrap(crate), 1), shuttle(1, crate), shuttle(), curried shuttle(crate)(x), and the function declaration.

Uncertainties I could not verify (no ast-grep available): (1) whether scan with inline rules picks up every file in src, since file discovery depends on extension and ignore rules, and the task says every file counts; I did not add flags such as --no-ignore because I could not confirm they exist in 0.51.1; (2) whether the inline-rule YAML and regex escaping parse exactly as intended in 0.51.1. Nothing was tested.

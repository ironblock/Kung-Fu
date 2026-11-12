A. The task asks for one ast-grep 0.51.1 outline command over src that lists every exported top-level const or let (including arrow, function, and class expression values), and excludes non-exported declarations, exported function and class declarations, export lists, and re-exports.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/facts/T04/v3/answer.txt:
ast-grep outline --type constant,variable,function --match '^export (const|let) ' src

Why unsure: the facts do not say whether an item's first line includes the leading `export` keyword, which the `^export` anchor depends on. Facts also say `const f = () => 1` is type function, so `function` is included and the first-line regex is what excludes exported function declarations.

A. The task asks for one `ast-grep outline` command over `src` that lists only the exported top-level `const`/`let` variables (any value, including arrow functions and class expressions), and excludes unexported declarations, export lists, exported function/class declarations, and re-exports.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/facts/T04/v2/answer.txt: `ast-grep outline --type constant,variable,function,class --match '^export (const|let) ' src`. Uncertain point: I could not run ast-grep, and I am not certain that the displayed first line of an outline item begins with the literal word `export`, which the `^export (const|let) ` anchor depends on. Also unverified: how a `const C = class {}` expression is typed (class vs constant), though both are included.

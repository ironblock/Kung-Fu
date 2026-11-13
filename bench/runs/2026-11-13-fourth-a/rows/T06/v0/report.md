A. The task asks for one ast-grep outline command over src/ that lists every top-level function declaration, exported or not, while excluding arrow functions, function expressions, nested functions, class methods, and classes.
B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/rows/T06/v0/answer.txt:
ast-grep outline --items structure --type function --match 'function' src

Verification: the command lists 19 items, which matches a manual count of the function declarations in the seven files (routes: distance, fetchRoute, plan, reroute, watch; sorting: byWeight, seal; labels: pad, seal, sealAll, unseal, stamp; wax: letterhead, melt, seal; tools: seal, weigh; index: open; crates: classify). The bare --type function would also include arrow functions onChange, detour, and lazyBook, so --match 'function' is what removes them; it matches on the signature text, and none of the arrow lines contain the word "function".

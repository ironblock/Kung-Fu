A. The task asks for one ast-grep outline command over src that lists exactly the exported top-level const/let variables (including those whose values are classes, arrows, or function expressions), and excludes non-exported const/let, exported functions and classes, export lists, and re-exports.

B. sure

answer.txt is at /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-third-shell/none/T04/v3/answer.txt and contains:
ast-grep outline --items exports --type variable,constant --view names src

Its output lists the 13 expected items: MAX_HEAP, Lidded (crates.js); VERSION (index.js); LABEL_SIZES, sample (labels.js); DEFAULT_ROUTE, openBay, lastError, nearest, byLength (routes.js); bins, sorted (sorting.js); colours (wax.js). I checked this against a grep of every const/let declaration in src. Non-exported names such as retries, legacyPlan, blank, SHEET, cache, limit, className, Fragile, and MELT_AT are correctly absent. Nothing under src was changed.

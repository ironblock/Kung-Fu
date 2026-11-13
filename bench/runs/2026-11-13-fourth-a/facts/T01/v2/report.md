A. The task asks for one `ast-grep outline` command that lists every top-level class declaration in src (exported or not, with or without extends), excluding class expressions stored in variables, classes nested in functions, and non-class names like `classify` or `className`.

B. sure

answer.txt (/tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/facts/T01/v2/answer.txt) contains: `ast-grep outline --items structure --type class src`

Its output lists 8 classes: Crate, ColdCrate, Trolley, CrateError, Hangar (crates.js), Bin, Sorter (sorting.js), Scale (tools.js). It correctly omits Lidded and Fragile (class expressions) and the nested Leg in routes.js. `--items structure` is required because the default auto mode on a directory shows only exported items.

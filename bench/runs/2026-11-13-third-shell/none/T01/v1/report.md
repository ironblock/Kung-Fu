A. The task asks for one ast-grep outline command that lists every top-level class declaration in src (exported or not, with or without extends) and excludes class expressions, classes nested in functions, and non-class names.

B. sure

answer.txt is at /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-third-shell/none/T01/v1/answer.txt and contains: ast-grep outline --items all --type class src

The command returns 8 top-level classes: Bin and Sorter (sorting.js), Scale (tools.js), and Crate, ColdCrate, Skid, CrateError and Wharf (crates.js). I checked this against a plain `class` pattern search, which also found the nested Leg class in routes.js, and excluded it because it is inside a function. I also confirmed that no hidden or ignored files exist in src.

A. Find every class declaration at the top level of each JavaScript file under src, exported or not, and list only those, excluding class expressions, classes nested in functions, and non-class names.

B. sure

answer.txt (/tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/none/T01/v2/answer.txt) contains: ast-grep outline --items structure --type class src

Verified: the command lists Scale (tools.js), Crate, ColdCrate, Trolley, CrateError, Hangar (crates.js), and Bin, Sorter (sorting.js). It excludes Lidded and Fragile (class expressions), Leg (inside a function in routes.js), and classify and className (not classes). A grep for "class" in src confirms that set.

A. The task asks for one ast-grep outline command that lists every top-level class declaration in src (exported, default-exported, or not, with or without extends), excluding class expressions, classes nested in functions, and non-class names.
B. sure

answer.txt contains: ast-grep outline --items structure --type class src
Its output lists exactly the 8 top-level class declarations: Scale (tools.js), Crate, ColdCrate, Skid, CrateError, Wharf (crates.js), Bin, Sorter (sorting.js). It excludes Lidded and Fragile (class expressions) and Leg (nested in reroute). The answer file is at /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/rows/T01/v1/answer.txt. Nothing under src was changed.

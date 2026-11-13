A. The task asks for one ast-grep outline command that lists every top-level class declaration in the src files (exported, non-exported, or default-exported, with or without extends), while leaving out class expressions stored in variables, classes nested inside functions, and non-class names.

B. sure

answer.txt is written at /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/facts/T01/v3/answer.txt and contains:
ast-grep outline --items structure --type class src

Its output lists 8 classes: Crate, ColdCrate, Gantry, CrateError, Silo (crates.js), Scale (tools.js), and Bin, Sorter (sorting.js). Lidded and Fragile (class expressions) and Leg (inside reroute in routes.js) are correctly excluded. Nothing under src was changed.

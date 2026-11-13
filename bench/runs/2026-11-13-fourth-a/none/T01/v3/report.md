A. The task asks for one ast-grep outline command that lists every top-level class declaration in src/ (exported, default-exported, or not, with or without extends), excluding class expressions bound to variables, classes nested in functions, and non-class names.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/none/T01/v3/answer.txt:
ast-grep outline --items structure --type class src

It lists 8 items: Bin, Sorter (sorting.js), Scale (tools.js), Crate, ColdCrate, Gantry, CrateError, Silo (crates.js). Lidded and Fragile are class expressions and Leg is nested in a function, so they are correctly excluded. The --items structure flag is needed because the default for a directory is exports, which would drop the non-exported classes.

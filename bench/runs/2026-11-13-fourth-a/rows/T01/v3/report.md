A. The task asks for one ast-grep outline command that lists every top-level class declaration in src (exported or not, with or without extends) and excludes class expressions, nested classes, and non-class names.
B. sure

Answer written to /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/bench-work/2026-11-13-fourth-a/rows/T01/v3/answer.txt: `ast-grep outline --items structure --type class src`

Its output lists 8 items: Bin, Sorter (sorting.js), Crate, ColdCrate, Gantry, CrateError, Silo (crates.js), Scale (tools.js). `--items structure` is needed because the default `auto` becomes `exports` for a directory and would drop the non-exported classes. The class expressions (Lidded, Fragile) are correctly excluded.

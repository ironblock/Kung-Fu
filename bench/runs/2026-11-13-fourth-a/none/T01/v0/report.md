A. The task asks for one ast-grep outline command that lists every top-level class declaration (exported, default-exported, or not, with or without extends) across src, excluding class expressions bound to variables, classes nested in functions, and non-class names.
B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/none/T01/v0/answer.txt:
ast-grep outline --items all --type class --view names src

Verified by running it: it lists 8 classes (crates.js: Crate, ColdCrate, Pallet, CrateError, Depot; sorting.js: Bin, Sorter; tools.js: Scale). It excludes Lidded and Fragile (class expressions), Leg (inside reroute), and classify/className.

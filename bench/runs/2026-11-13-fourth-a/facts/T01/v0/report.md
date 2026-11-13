A. The task asks for one ast-grep outline command that lists every top-level class declaration in src (exported or not, with or without extends), and excludes class expressions bound to variables, classes inside functions, and non-class names.
B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/facts/T01/v0/answer.txt:
ast-grep outline --items structure --type class src

Output of that command (ast-grep 0.51.1): sorting.js lists Bin, Sorter; tools.js lists Scale; crates.js lists Crate, ColdCrate, Pallet, CrateError, Depot. The class expressions Lidded and Fragile (constants) and the class Leg inside reroute are correctly left out. Using --items all gives the same output.

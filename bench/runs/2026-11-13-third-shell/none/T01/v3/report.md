A. The task asks for one ast-grep outline command that lists every top-level class declaration in src (exported, unexported, default-exported, with or without extends), excluding class expressions bound to variables, classes nested inside functions, and non-class names like classify or className.

B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-third-shell/none/T01/v3/answer.txt:
ast-grep outline --items structure --type class src

Verification: the command lists Bin and Sorter (sorting.js), Scale (tools.js), and Crate, ColdCrate, Gantry, CrateError, Silo (crates.js). It omits Lidded and Fragile (class expressions), the nested Leg class in routes.js, and classify. The default --items auto would use exports mode for a directory and drop the local classes, so --items structure is needed. Nothing under src was changed.

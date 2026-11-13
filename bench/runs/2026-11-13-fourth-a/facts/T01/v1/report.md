A. The task asks for one `ast-grep outline ... src` command that lists every top-level class declaration (exported or not, with or without extends) and excludes class expressions, classes nested in functions, and non-class names like `classify` and `className`.
B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/facts/T01/v1/answer.txt: `ast-grep outline --items structure --type class src`

Verified with ast-grep 0.51.1. It lists crates.js: Crate, ColdCrate, Skid, CrateError, Wharf; sorting.js: Bin, Sorter; tools.js: Scale. It omits the class expressions Lidded and Fragile, and the Leg class nested in reroute() in routes.js.

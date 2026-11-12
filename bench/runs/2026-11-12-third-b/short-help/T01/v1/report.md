A. The task asks for one ast-grep outline command, run against src, that lists only top-level class declarations (exported, default-exported, or not, with or without extends) and excludes class expressions, classes nested in functions, and non-class items.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/short-help/T01/v1/answer.txt: `ast-grep outline --items all --type class src`. The `--items all` choice makes the outline include non-exported top-level items, and `--type class` is an assumed symbol-type name taken from the help text; the help does not list the exact type value for classes, and I could not verify it.

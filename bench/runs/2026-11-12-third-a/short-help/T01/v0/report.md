A. The task asks for one ast-grep outline command, run from the directory containing src, that lists each top-level class declaration in the JavaScript files under src (exported, default-exported, or not, with or without extends) and excludes class expressions in variables, classes nested in functions, and non-class symbols.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/short-help/T01/v0/answer.txt: `ast-grep outline --lang javascript --items all --type class src`. The flags are chosen from the short help alone: --lang covers files without a standard JS extension, --items all includes non-exported items, and --type class filters to class symbols. I could not verify that --type class excludes class expressions assigned to variables, and I could not check the code.

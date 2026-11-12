A. The task asks for a single `ast-grep outline ... src` command, run with ast-grep 0.51.1, that lists every top-level class declaration in the JavaScript files under `src/` (exported, default-exported, or not, with or without `extends`) while excluding class expressions assigned to variables, classes nested in functions, and non-class names like `classify` or `className`.

B. guess

Wrote /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/none/T01/v0/answer.txt with: `ast-grep outline --pattern 'class $NAME $$$REST' --lang js src`. Caveats: I could not verify that 0.51.1 has an `outline` subcommand or these flags, and a plain pattern cannot restrict matches to the top level, so the nested-class exclusion is not guaranteed by this command.

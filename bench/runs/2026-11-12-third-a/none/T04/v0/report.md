A. The task asks for one ast-grep outline command, run from the directory containing src, that lists every exported top-level const or let that declares a single name with a value (of any kind), and excludes non-exported declarations, export lists, exported functions and classes, and re-exports.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/none/T04/v0/answer.txt: `ast-grep outline --lang javascript --pattern 'export $KIND $NAME = $VALUE' src`. Caveats: I could not verify the `outline` subcommand or its flags in 0.51.1, and I am not confident that a metavariable like $KIND matches the `const`/`let` keyword token (metavariables usually match named nodes only), so this may match nothing.

A. The task asks for one ast-grep outline command, run from the directory containing src, that lists only exported top-level const/let variable declarations (any value type) and excludes non-exported const/let, exported functions and classes, export lists, and re-exports.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/names/T04/v2/answer.txt: `ast-grep outline --items export --type const,let src`. Caveat: flags.txt lists only flag names, not their accepted values, and I could not inspect src or run ast-grep, so I do not know whether --items and --type take these values or whether the command filters out non-exported declarations.

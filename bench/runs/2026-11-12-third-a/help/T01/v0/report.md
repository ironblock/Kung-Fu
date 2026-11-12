A. The task asks for one single-line ast-grep outline command, run against src, that lists every top-level class declaration in the JavaScript files (exported, default-exported, or not, with or without extends) and excludes class expressions stored in variables, classes nested in functions, and non-class names.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/help/T01/v0/answer.txt: `ast-grep outline --items structure --type class src`

Reasoning: help.txt says --items structure keeps top-level items defined locally (excluding imports), and --type class keeps only class-type items. I could not run ast-grep or see src, so I did not verify that `const X = class ...` is not classed as a class-type item by the bundled outline rules.

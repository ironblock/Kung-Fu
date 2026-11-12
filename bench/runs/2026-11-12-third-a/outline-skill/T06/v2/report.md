A. The task asks for one ast-grep outline command, run from the directory containing src, that lists only top-level function declarations (exported, default-exported, or not) and excludes arrow functions and function expressions stored in variables, nested functions, class methods, and classes.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/outline-skill/T06/v2/answer.txt: `ast-grep outline --items structure --type function src`

Reasoning: SKILL.md says the default `--items auto` picks `exports` for a directory, so `--items structure` is needed to include non-exported declarations. `--type function` restricts to function symbols. I could not verify that ast-grep 0.51.1 classifies `const x = () => ...` as a non-function symbol, so the exclusion of arrow functions is unconfirmed.

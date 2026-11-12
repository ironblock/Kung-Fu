A. The task asks for one ast-grep outline command, written to answer.txt, that lists only top-level function declarations under src (exported or not, including async and default exports) and excludes arrow functions and function expressions stored in variables, nested functions, class methods, and classes.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/outline-skill/T06/v1/answer.txt: `ast-grep outline --items structure --type function src`. I chose --items structure because the SKILL.md says the directory default is exports, which would drop non-exported functions, and --type function because the skill says it keeps only the given top-level symbol kind. I could not verify whether ast-grep 0.51.1 classifies `const x = () => {}` as a "function" type, so the arrow-function exclusion is the main risk.

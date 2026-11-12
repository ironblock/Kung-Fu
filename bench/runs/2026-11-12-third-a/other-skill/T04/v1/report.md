A. The task asks for one ast-grep outline command, run from the directory containing src, that lists every top-level exported const or let variable with a single identifier name and a value of any kind, and excludes non-exported const/let, export lists, exported functions and classes, and re-exports.

B. guess

The command written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/other-skill/T04/v1/answer.txt is:
ast-grep outline --inline-rules "{id: exported-variables, language: javascript, rule: {any: [{pattern: export const \$NAME = \$VALUE;}, {pattern: export let \$NAME = \$VALUE;}]}, constraints: {NAME: {kind: identifier}}}" src

I could not verify the outline subcommand's flags for ast-grep 0.51.1 (I could not run it), so the use of --inline-rules is an assumption.

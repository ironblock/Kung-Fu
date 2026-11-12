A. The task asks for one ast-grep outline command, run from the directory containing src, that lists every top-level `export const` or `export let` declaration that declares a single name with a value, excluding non-exported declarations, export lists, exported function/class declarations, and re-exports.

B. guess

The command written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/none/T04/v2/answer.txt is:
ast-grep outline --lang javascript --inline-rules '{id: exported-top-level-vars, language: javascript, rule: {any: [{pattern: "export const $N = $V"}, {pattern: "export let $N = $V"}]}}' src

Uncertainties: I could not run ast-grep, so I did not verify that `outline` or `--inline-rules` exist in 0.51.1 or that they combine with `--lang`. The `$N` metavariable also matches destructuring patterns (e.g. `export const {a} = obj`), which declare multiple names and may need excluding.

A. The task asks for one ast-grep 0.51.1 `outline` command, run from the directory containing `src`, that lists every top-level `export const` or `export let` variable under `src/` (whatever the value is) and excludes non-exported const/let, `export {...}` lists, exported function or class declarations, and re-exports.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/names/T04/v3/answer.txt: `ast-grep outline --type variable --match '^export\s+(const|let)\b' src`. The flags list only names the options, not their accepted values, and I could not see the code or run ast-grep, so I do not know whether `--type variable` is a valid item type or whether `--match` filters on item text or item name.

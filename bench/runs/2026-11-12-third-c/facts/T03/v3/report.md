A. Find every top-level import statement whose source is exactly "./manifest.js" (any form: default, braces single or multi-line, namespace, or bare) and list each one once, with no other items.

B. unsure

Written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/facts/T03/v3/answer.txt: `ast-grep outline --items imports --match '"\./manifest\.js"' src`

Reasoning and weak point: `--items imports` restricts the output to imports, which excludes exports, constants and other items. The regex `"\./manifest\.js"` requires the opening quote directly before `./`, so `"../manifest.js"` and `"./lib/manifest.js"` fail to match, and the closing quote excludes `"./manifests.js"` and `"./manifest.json"`. The weak point is that `--match` only checks an item's name or first line. A multi-line `import {` has its path on a later line, so it may be missed unless the module item's name carries the source string. The facts don't say what name ast-grep gives an import, so I could not confirm this.

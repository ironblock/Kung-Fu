A. The task asks for one ast-grep 0.51.1 outline command that lists every top-level import statement whose source is exactly "./manifest.js" under src, and nothing else.

B. unsure

Answer written to /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/bench-work/2026-11-12-third-b/facts/T03/v3/answer.txt:
ast-grep outline --items imports --match '"\./manifest\.js"' src

Caveat: the facts do not say what an import item's name is. If a multi-line `import {` ... `} from "./manifest.js";` only has `import {` as its first line, this regex cannot see the path and would miss it. I could not verify this without running the tool.

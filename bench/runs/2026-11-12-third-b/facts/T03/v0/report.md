A. Find every top-level import statement whose source is exactly "./ledger.js" (not similar paths, re-exports, dynamic imports, or constants) and list it with an ast-grep outline command over src.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/facts/T03/v0/answer.txt: `ast-grep outline --items imports --match '"\./ledger\.js"' src`

Reasoning: --items imports limits output to imports, and the quoted, escaped regex matches only the exact "./ledger.js" source. Other paths fail the closing-quote or leading-quote requirement. Re-exports and dynamic imports are not imports. The open risk: --match tests only the name or first line of an item. A multi-line `import {` ... `} from "./ledger.js";` has its path on a later line, so it may be missed. I could not run ast-grep to check this.

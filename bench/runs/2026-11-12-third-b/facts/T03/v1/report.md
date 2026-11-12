A. The task asks for one ast-grep 0.51.1 outline command that lists every top-level import statement importing exactly from "./roster.js" (default, braced names on one or several lines, namespace, or bare side-effect import), excluding look-alike paths, other-path imports, re-exports, dynamic import() calls, and string constants.

B. unsure

Answer written to /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/bench-work/2026-11-12-third-b/facts/T03/v1/answer.txt:
ast-grep outline --items imports --match '"\./roster\.js"' src

Caveat: --match checks only the item's name or first line. Single-line imports will match, but a multi-line braced import has its path on a later line, so this command may miss it. The facts do not say what name an import item carries, so I could not confirm a way around this. The command was written from the task and facts alone, without running it.

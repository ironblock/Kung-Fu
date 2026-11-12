A. Find the one `ast-grep outline` command that lists every top-level `import` statement whose source is exactly "./roster.js" (in src/, all JavaScript), and nothing else.
B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/outline-skill/T03/v1/answer.txt:
ast-grep outline --items imports --match '(?s)^import\s.*"\./roster\.js"' src

Why this shape: SKILL.md says --items imports selects import items, and --match filters on name or signature with a Rust regex. The `^import\s` anchor excludes export re-exports and `import("./roster.js")` calls, and the quoted `"\./roster\.js"` excludes "../roster.js", "./rosters.js", "./lib/roster.js" and "./roster.json". The (?s) flag covers multi-line brace imports. Not verified: I could not run ast-grep or see src. Open questions: whether the outline signature includes the module specifier at all, whether multi-line signatures are kept as one string, and whether --items imports also picks up re-exports.

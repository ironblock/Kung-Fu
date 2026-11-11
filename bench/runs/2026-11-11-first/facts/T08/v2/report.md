A. Write one ast-grep command that matches every import statement in src/ whose source is exactly "./tint.js" (default, named, namespace, mixed, and bare imports, including multi-line ones), and nothing else.
B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-11-first/facts/T08/v2/answer.txt:
ast-grep scan --inline-rules '{id: tint, language: JavaScript, rule: {kind: import_statement, has: {field: source, regex: ^.\.\/tint\.js.$}}}' src

It matches 6 times, all in src/t08.js: lines 1-5 and the multi-line import at lines 6-9. The decoys (tints.js, tint.json, tint.jsx, tint, ../tint.js, lib/tint.js, tint.js, require, dynamic import, export-from, and the plain string) are excluded.

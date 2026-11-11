A. The task asks for one ast-grep command that matches, once each, the last parameter of every function declaration named `reckon` with at least two parameters (top level or nested), including its full default value, rest dots, or destructuring, and nothing else.

B. sure

The answer is in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-11-first/skill/T01/v1/answer.txt:

ast-grep scan --inline-rules "{id: r, language: javascript, rule: {all: [{any: [{kind: identifier}, {kind: assignment_pattern}, {kind: rest_pattern}, {kind: object_pattern}, {kind: array_pattern}]}, {nthChild: {position: 1, reverse: true}}, {not: {nthChild: 1}}, {inside: {kind: formal_parameters, stopBy: neighbor, inside: {kind: function_declaration, stopBy: neighbor, has: {field: name, regex: '^reckon\$'}}}}]}}" src

I ran it with ast-grep 0.51.1 from the directory containing src. It matched exactly six parameters, all in src/t01.js: `bonus` (line 3), `weight = 1` (23), `...others` (30), `{ home, away }` (40), `[low, high]` (48), and `pick = (entry, index) => entry.points + index` (55). The other nine files produced no matches. Nothing under src was changed.

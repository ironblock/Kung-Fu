A. The task asks for one ast-grep 0.51.1 command, run from the directory containing src, that matches every class declaration with its own `extends` clause (plain or dotted base, top level or nested, extends on its own line), matching the whole declaration, and excluding class expressions, extends-free declarations, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/facts/T10/v2/answer.txt:
ast-grep run --pattern 'class $N extends $S { $$$B }' --lang javascript src

Reasoning: the pattern's root node is a class declaration, so class expressions are excluded, and the required `extends $S` clause means extends-free declarations are excluded. Because the match is anchored to the declaration's own heritage, a nested class expression that extends inside the body (the Registry case) does not cause a match. Single metavariable $S matches both plain and dotted bases. Not verified by running ast-grep, which is unavailable. Known gaps: an anonymous `export default class extends X {}` would not match because the pattern requires a name, and the --lang filter may skip files without a .js extension.

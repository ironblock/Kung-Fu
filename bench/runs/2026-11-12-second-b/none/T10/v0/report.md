A. The task asks for one ast-grep command that matches every named class declaration with an extends clause under src/ (any base expression, top level or nested, extends on its own line), excluding class expressions, plain declarations, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/none/T10/v0/answer.txt:
ast-grep run --pattern 'class $NAME extends $BASE { $$$BODY }' --lang javascript src

Caveats: no src/ directory exists in the task directory, so nothing was tested. The pattern relies on tree-sitter treating a class declaration and a class expression as different node kinds, so `const X = class extends ...` should not match. It cannot match an anonymous `export default class extends Shape {}` because `$NAME` requires a name. I chose the pattern over a kind-based inline rule because `has` searches descendants and would likely false-positive on the nested class expression in `Registry`.

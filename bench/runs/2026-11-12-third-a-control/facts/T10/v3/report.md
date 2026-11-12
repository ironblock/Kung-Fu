A. The task asks for one ast-grep command that matches every named class declaration with an `extends` clause under src (dotted base names, nested declarations and line-broken `extends` included), while excluding class expressions, extends-less classes, functions and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a-control/facts/T10/v3/answer.txt: `ast-grep run --pattern 'class $N extends $B { $$$BODY }' --lang javascript src`. I could not run it. The pattern relies on tree-sitter distinguishing class_declaration from class expressions, and I did not verify that. I also did not confirm that `--lang javascript` makes ast-grep 0.51.1 search files with no or unusual extensions, which the task's "every file counts" line hints at. Anonymous `export default class extends X` declarations are not matched.

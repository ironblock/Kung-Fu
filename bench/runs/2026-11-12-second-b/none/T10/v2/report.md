A. The task asks for one ast-grep command that matches every class declaration with an `extends` clause under src/ (plain or dotted superclass, top level or nested, extends on its own line), and excludes class expressions, classes without their own extends, functions, and strings.
B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/none/T10/v2/answer.txt:
ast-grep run --pattern 'class $C extends $B { $$$BODY }' --lang js src

Caveats: the src directory was not present in the task directory, so I could not inspect the files. I could not run ast-grep. The pattern relies on tree-sitter node kinds (class_declaration vs class expression) to exclude expressions. The main uncertainty is file coverage: `--lang js` may skip files whose extensions are not in ast-grep's JavaScript list, which the task's "every file counts" hint suggests may be present. I did not add a globs option because I could not confirm that 0.51.1 supports it for `run`.

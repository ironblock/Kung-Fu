A. The task asks for one single-line ast-grep command that matches every class declaration with its own `extends` clause under src/ (plain or dotted superclass, any nesting, extends on its own line) and nothing else, such as class expressions, classes without their own extends, strings, and functions.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a-control/outline-skill/T10/v0/answer.txt: ast-grep scan --inline-rules '{id: extends-class, language: javascript, rule: {kind: class_declaration, has: {kind: class_heritage, stopBy: neighbor}}}' src

Reasoning and risks: I could not run ast-grep or see src. I used a kind-based rule rather than a pattern so that a nameless `export default class extends X {}` and a multi-line heritage are covered. The `stopBy: neighbor` setting is meant to restrict `has` to the class's direct children, so an inner class expression in a body (the Registry case) does not count. I'm not certain 0.51.1 honours `stopBy: neighbor` inside `has` the way I expect, and I did not verify the tree-sitter node name `class_heritage` for that version.

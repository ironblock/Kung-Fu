A. The task asks for one ast-grep command that matches every class declaration with its own `extends` clause (plain or dotted superclass, top-level or nested, `extends` on its own line), matching from `class` to the closing brace, and excluding class expressions, extends-less declarations that contain extending class expressions, strings, and functions.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-b/facts/T10/v3/answer.txt:
ast-grep run --lang js --pattern 'class $C extends $B { $$$BODY }' src

Why unsure: I could not run ast-grep to check it. The pattern relies on the kind being class_declaration (so class expressions are excluded) and on $B matching a dotted member expression. I did not use a `has` rule, since a descendant `has` would wrongly match the `Registry` case. The one gap I see is an unnamed `export default class extends X {}`, which this pattern does not match; the task does not mention that form.

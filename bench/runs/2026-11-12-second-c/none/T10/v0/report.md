A. Write one ast-grep command, run from the directory containing src, that matches every named class declaration with an extends clause (plain or dotted superclass, at any depth, extends possibly on its own line) and excludes class expressions, plain classes, functions and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-c/none/T10/v0/answer.txt:
ast-grep run --lang js --pattern 'class $C extends $B { $$$BODY }' src

Caveats: I did not inspect the files under src (I had no directory listing tool and did not guess file names), and I could not test against ast-grep. The pattern relies on the class-declaration node kind to exclude class expressions. It would miss an anonymous `export default class extends Shape {}`, if one exists in src.

A. The task asks for one ast-grep command, run from the directory containing src, that matches every JavaScript class declaration with an extends clause (named or dotted base, top level or nested, extends on its own line) and nothing else, such as class expressions, plain classes that mention extends in a string or nested class expression, functions, and string literals.

B. unsure

The answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c-control/outline-skill/T10/v0/answer.txt is: ast-grep run --pattern 'class $NAME extends $BASE { $$$BODY }' --lang javascript src

Reasons for the uncertainty: I could not run ast-grep, so this is untested. The pattern requires a class name, so an anonymous `export default class extends X {}` would be missed. I also did not confirm that `run --lang` applies to files with non-.js extensions in 0.51.1.

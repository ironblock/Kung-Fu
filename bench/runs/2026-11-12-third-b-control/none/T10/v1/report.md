A. The task asks for one ast-grep command, run from the directory containing src, that matches every JavaScript class declaration with an extends clause (plain or dotted base, top level or nested, extends on its own line) and nothing else, excluding class expressions, extends-less classes, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b-control/none/T10/v1/answer.txt:
ast-grep run --pattern 'class $NAME extends $BASE { $$$BODY }' --lang js src

Reason for unsure: I could not run ast-grep or see src, so the command is untested. Possible gaps: files with non-.js extensions (--lang may filter by extension), and anonymous `export default class extends X {}` declarations, which the name metavariable would not match.

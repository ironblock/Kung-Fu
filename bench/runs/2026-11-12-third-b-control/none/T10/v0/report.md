A. The task asks for one ast-grep command that matches every named class declaration with an `extends` clause (dotted or plain base, top level or nested, extends on its own line) under src, excluding class expressions, plain classes, functions, and strings.
B. unsure

Written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b-control/none/T10/v0/answer.txt: `ast-grep run --pattern 'class $NAME extends $BASE { $$$BODY }' --lang js src`

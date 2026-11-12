A. The task asks for one ast-grep command that matches every class declaration with an `extends` clause (plain or dotted superclass, top-level or nested, `extends` possibly on its own line), matching each whole declaration once, while excluding class expressions, classes without their own `extends`, functions, and string contents.

B. unsure

The answer is in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b-control/outline-skill/T10/v1/answer.txt. It reads: `ast-grep run --pattern 'class $NAME extends $BASE { $$$BODY }' --lang js src`. I could not run ast-grep or see `src`, so this is untested. The main uncertainties are whether `--lang js` on a directory picks up files with non-standard extensions (the task's "every file counts" hints at that), and whether a bare `export default class extends Base {}` (no name) would need to be matched too; the pattern requires a name, so it would not.

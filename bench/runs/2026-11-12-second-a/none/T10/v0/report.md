A. The task asks for one ast-grep 0.51.1 command that matches every class declaration with an `extends` clause under src/ (plain or dotted base, top level or nested, extends possibly on its own line), while excluding class expressions, classes without extends, functions, and strings.

B. guess

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/none/T10/v0/answer.txt:
ast-grep run --lang js --pattern 'class $NAME extends $BASE { $$$BODY }' src

Why it should work: the pattern is parsed as a class declaration, so class expressions such as `const Mixed = class extends Shape {}` do not match, and a bare `class extends` without a name cannot match. `$BASE` matches a member expression such as `Widgets.Base`, and whitespace or newlines between tokens do not affect matching.

Caveats: I could not inspect src/ (it does not exist in the directory I was given), and I could not run ast-grep. The main uncertainty is whether `--lang js` restricts the scan to .js/.mjs/.cjs/.jsx files, which could skip files with other extensions if any exist.

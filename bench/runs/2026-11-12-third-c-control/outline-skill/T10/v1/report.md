A. The task asks for one ast-grep command, run from the directory containing src, that matches every class declaration with its own extends clause (plain or dotted base, top-level or nested, extends on any line) and nothing else, such as class expressions, classes without extends, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c-control/outline-skill/T10/v1/answer.txt:
ast-grep run --pattern 'class $NAME extends $BASE { $$$BODY }' --lang javascript --no-ignore hidden --no-ignore vcs src

Reasoning: the pattern is a class_declaration, so class expressions (kind "class") do not match. $BASE matches a plain identifier or a member expression like Widgets.Base. Whitespace does not matter, so a line-broken extends still matches. The --no-ignore flags are there so files that are hidden or gitignored still count. I could not run ast-grep, so this is untested. The flag spellings for 0.51.1 and whether the pattern parses as a class declaration are from memory.

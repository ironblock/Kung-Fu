A. The task asks for one ast-grep outline command that lists every top-level class declaration in src (exported, default-exported, or not, with or without extends) while excluding class expressions, classes nested in functions, and non-class names like classify or className.

B. unsure

The answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/outline-skill/T01/v1/answer.txt is: ast-grep outline --items structure --type class src

I could not run ast-grep or see src, so this is based on SKILL.md only. --items structure is included because the directory default is exports, which would drop non-exported classes. --type class restricts to class symbols. I could not confirm that outline excludes class expressions assigned to variables.

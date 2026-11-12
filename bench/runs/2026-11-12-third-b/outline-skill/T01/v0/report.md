A. The task asks for one `ast-grep outline ... src` command that lists only top-level class declarations (exported, default-exported, or not, with or without extends), excluding class expressions in variables, classes inside functions, and non-class names.

B. unsure

The answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-b/outline-skill/T01/v0/answer.txt is: `ast-grep outline --items structure --type class src`. I could not run ast-grep or view src, so this is based on SKILL.md: a directory defaults to `--items exports`, so `--items structure` is needed to include non-exported classes, and `--type class` filters to class items. I did not verify that `export default class` or class expressions behave as the task expects.

A. Write one ast-grep command that matches every direct call to `trumpet` on an object named `bugler`, from `bugler` through the closing parenthesis, and nothing else (no `this.bugler` or `room.bugler`, no other methods, no bare `trumpet(...)`, no uncalled references, no string matches).

B. sure

answer.txt (/tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-11-first/none/T07/v2/answer.txt) contains: ast-grep run --pattern 'bugler.trumpet($$$ARGS)' --lang js src
It matches 8 calls, all in src/t07.js (lines 10, 11, 12, 13-16, 17, 20, 21, 22), and none of the excluded forms.

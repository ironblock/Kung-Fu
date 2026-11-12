A. The task asks for one ast-grep 0.51.1 outline command over src that lists every exported top-level const or let declaration (any value, including arrow functions, function expressions and class expressions), and excludes non-exported declarations, export lists, exported function/class declarations and re-exports.

B. unsure

The answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/facts/T04/v3/answer.txt is:
ast-grep outline --items structure --type constant,variable,function --match '^export (const|let) ' src

Reason for uncertainty: I could not run ast-grep or see src. The command assumes the first line shown for an exported const or let includes the leading "export" keyword, so that the '^export (const|let) ' regex can match it. If the first line is shown without "export", the command would list nothing.

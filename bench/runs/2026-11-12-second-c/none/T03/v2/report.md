A. The task asks for one ast-grep command that matches every plain call to `convey` whose first argument is exactly `satchel` (with or without further arguments), and nothing else such as method calls, other first arguments, or the declaration.
B. unsure

The answer is in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-c/none/T03/v2/answer.txt:
ast-grep scan --inline-rules '{"id":"convey-satchel","language":"js","rule":{"any":[{"pattern":"convey(satchel)"},{"pattern":"convey(satchel, $$$REST)"}]}}' src

Reasons for the uncertainty: I could not list the directory or read src/, so I did not check the file extensions or the actual code. I also did not run ast-grep. The main risk is that `scan` may skip files whose extensions the JavaScript language does not recognize, since the task says every file counts.

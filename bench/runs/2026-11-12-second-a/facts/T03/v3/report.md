A. The task asks for one ast-grep command that matches every plain call to `haul` whose first argument is exactly the name `hamper` (any further arguments allowed), matching the whole call, and excluding method calls, other first arguments, empty calls, longer names, string literals, other functions, and the function declaration.

B. unsure

The answer is in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-a/facts/T03/v3/answer.txt:
ast-grep scan --inline-rules '{id: haul-hamper, language: javascript, rule: {pattern: "haul($$$A)", regex: "^haul\\(\\s*hamper\\s*[,)]"}}' src

Why unsure: I could not run ast-grep, so the command is untested. The regex is applied to the matched call's text, which is my approach for enforcing that `hamper` is the first argument. Facts.md did not cover regex behavior on the node text, so that part rests on my understanding of ast-grep rather than a checked fact.

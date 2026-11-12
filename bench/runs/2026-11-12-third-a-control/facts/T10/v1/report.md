A. The task asks for one ast-grep command that matches every class declaration with an `extends` clause (plain or dotted base name, top level or nested, extends on its own line), excluding class expressions, plain classes, functions and strings.

B. unsure

The answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a-control/facts/T10/v1/answer.txt is:
ast-grep scan --inline-rules '{id: subclass, language: js, rule: {kind: class_declaration, has: {kind: class_heritage, stopBy: neighbor}}}' --no-ignore hidden src

I could not run ast-grep or see src, so this is untested. I chose a kind-based rule over `--pattern` because a pattern cannot match an unnamed `export default class extends X {}`. `stopBy: neighbor` stops a Registry-style class expression inside the body from making its outer class match. `--no-ignore hidden` is there so that hidden files are searched too. I have not confirmed that the `stopBy` and `--no-ignore` options behave this way in 0.51.1.

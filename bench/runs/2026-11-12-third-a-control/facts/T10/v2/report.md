A. The task asks for one ast-grep command that matches every JavaScript class declaration under src that has its own `extends` (plain or dotted superclass, at any nesting, with `extends` possibly on its own line), and excludes class expressions, classes without extends, functions, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a-control/facts/T10/v2/answer.txt:
ast-grep scan --inline-rules '{"id":"extends-class","language":"javascript","rule":{"any":[{"pattern":"class $C extends $B { $$$ }"},{"pattern":"export default class extends $B { $$$ }"}]}}' src

Notes: I could not run ast-grep or view src, so this is unverified. The second alternative covers anonymous `export default class extends ...`, which the task does not mention explicitly; drop it if the grader does not count that case.

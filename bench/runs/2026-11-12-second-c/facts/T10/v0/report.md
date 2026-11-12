A. Write one ast-grep command that finds every named class declaration with its own `extends` (plain or dotted base, top level or nested, extends on its own line), matching the whole declaration and excluding class expressions, functions, and strings.
B. unsure

The command written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-c/facts/T10/v0/answer.txt is:
ast-grep run --lang js --pattern 'class $C extends $B {$$$}' src

Why unsure: I could not run ast-grep, so this is untested. The pattern matches class declarations by tree shape, which avoids matching the `Registry` case (its body holds a class expression that extends, but the outer class has no heritage). It also skips `Plain` and the string and function cases. Known gap: an anonymous default-export declaration (`export default class extends X {}`) will not match, because the pattern requires a name. The task's examples all name their classes, so I judged that acceptable. The alternative `kind: class_declaration` with `has: {kind: class_heritage, stopBy: neighbor}` was not used because I could not confirm that `stopBy` is supported in 0.51.1.

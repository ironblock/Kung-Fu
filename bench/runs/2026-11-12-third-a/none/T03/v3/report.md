A. The task asks for one single-line `ast-grep outline ... src` command that lists every import statement from exactly "./manifest.js" (default, braced, namespace, or side-effect form), excluding look-alike paths, other modules, re-exports, dynamic imports, and plain string constants.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/none/T03/v3/answer.txt:
ast-grep outline --pattern 'import $$$A "./manifest.js"' src

Reasoning: the pattern `import $$$A "./manifest.js"` works because the string must be the last child of an import statement, and `$$$A` can match zero or more nodes, so it covers `import "./manifest.js"`, `import X from ...`, `import {...} from ...` (multi-line too) and `import * as N from ...`. Dynamic `import("...")` is a call expression, `export ... from` starts with export, and other paths differ in the literal text, so none of those match. Uncertainty: I could not verify that `outline` is a subcommand in ast-grep 0.51.1 (I believe it may not exist there), and I could not inspect src. The semicolon is omitted on purpose so that statements without one still match.

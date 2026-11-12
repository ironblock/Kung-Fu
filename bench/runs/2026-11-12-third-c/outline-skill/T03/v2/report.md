A. The task asks for one ast-grep outline command, in the form `ast-grep outline ... src`, that lists only the top-level import statements whose source is exactly "./docket.js" (not similar paths, not re-exports, not dynamic imports, not plain string constants).

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/outline-skill/T03/v2/answer.txt:
ast-grep outline --items imports --match '"\./docket\.js"' src

Reasoning: --items imports restricts to import statements, which excludes the constant and the dynamic import() inside an arrow function. The --match regex requires the opening quote directly before "./" and the closing quote directly after "js", which excludes "../docket.js", "./dockets.js", "./docket.json", and "./lib/docket.js". The rename-only import from "./books.js" is excluded because its path does not match. Unverified: I could not run ast-grep, so I did not confirm that --match tests the full import signature including the quoted path for multi-line imports, or that `export ... from` is absent from the imports kind.

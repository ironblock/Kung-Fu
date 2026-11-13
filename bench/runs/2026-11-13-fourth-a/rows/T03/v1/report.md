A. Find the import statements that bring in from the exact module "./roster.js" (default, braced names, namespace, or bare side-effect form), and list each one once, leaving out re-exports, dynamic imports, other paths, and other modules' names.
B. sure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-13-fourth-a/rows/T03/v1/answer.txt:
ast-grep outline --items imports --match '^"\./roster\.js"$' src

It lists 5 imports, one each in crates.js (default), index.js (bare `import "./roster.js";`), labels.js (named), routes.js (`* as`), and tools.js (multi-line named). Excluded by the command: index.js's `export {...} from "./roster.js"`, tools.js's `import()` call, the SHEET constant, and the other-path imports.

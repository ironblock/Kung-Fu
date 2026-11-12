A. The task asks for one ast-grep outline command, run from the directory containing src, that lists only top-level class declarations (exported, default-exported, or not, with or without extends) and excludes class expressions bound to variables, classes inside functions, and non-class names.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a/help/T01/v1/answer.txt:
ast-grep outline --lang javascript --items structure --type class --no-ignore hidden --no-ignore dot --no-ignore vcs --no-ignore exclude --no-ignore global --no-ignore parent src

Reasoning: --type class keeps only class items; --items structure keeps locally defined top-level items (including export class and export default class) and drops imports; --lang javascript makes every file parse; the --no-ignore flags make hidden and ignored files count. I could not run ast-grep or see src, so I could not confirm that `const X = class ...` bindings are excluded by the outline extractor, or that re-export lines (`export { Foo }`) do not produce duplicate entries. Those are the main risks.

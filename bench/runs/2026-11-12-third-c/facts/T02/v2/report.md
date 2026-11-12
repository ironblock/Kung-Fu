A. The task asks for one single-line ast-grep 0.51.1 outline command over src that lists only top-level exported function declarations named exactly `bolt` (with export or export default, optionally async), excluding longer names, parameters named bolt, consts, re-exports, non-exported functions, and class methods.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-c/facts/T02/v2/answer.txt: `ast-grep outline --type function --match '^export (default )?(async )?function bolt\(' src`. Unsure because I could not run or see the code. The one residual risk is that an `export const bolt = () => ...` arrow function is typed as `function` and its first line starts with `export const`, so the regex should exclude it, but I could not verify how the first line is reported.

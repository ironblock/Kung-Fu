A. The task asks for one ast-grep 0.51.1 command, run from the directory containing src, that matches every call to the plain function shuttle whose first argument is exactly the identifier crate (any further arguments allowed), and nothing else.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-second-c/facts/T03/v1/answer.txt:
ast-grep scan --inline-rules '{"id":"shuttle-crate","language":"javascript","rule":{"any":[{"pattern":"shuttle(crate)"},{"pattern":"shuttle(crate, $$$A)"}]}}' --no-ignore hidden src

Reasoning: "shuttle(crate)" covers the one-argument case, and "shuttle(crate, $$$A)" covers two or more arguments (per fact 2 the literal comma must be in the pattern, and $$$A matches the rest). Patterns match whole call_expression nodes, so the declaration, depot.shuttle(...), shuttleAll(...), and shuttle("crate") / shuttle(crate.id) / shuttle(crates) / shuttle(wrap(crate), 1) / shuttle(1, crate) should not match. I could not run ast-grep, so this is unverified. The "--no-ignore hidden" flag is a guess at covering "every file counts" (hidden files are skipped by default), and I am not certain that flag exists in 0.51.1 or that it is needed. If it is unsupported, the command fails outright and should be dropped.

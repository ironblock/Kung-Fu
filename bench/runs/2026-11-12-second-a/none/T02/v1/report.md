A. Write one ast-grep command, runnable from the directory containing src, that matches only the first element of an array literal which is the sole argument of a plain call to stockpile, and nothing else.
B. guess

The answer is written to /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/bench-work/2026-11-12-second-a/none/T02/v1/answer.txt. I could not run ast-grep, so this is unverified. Two parts are uncertain: the sole-argument check relies on precedes/follows with a regex matching non-punctuation siblings, and the call check relies on pattern stockpile($$$) combined with stopBy: neighbor.

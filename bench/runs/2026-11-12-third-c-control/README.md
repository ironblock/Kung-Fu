# 2026-11-12-third-c-control: the third study, round three, the control tasks

This was written before the run. The study is `../../studies/third.md`. The other half of the round is `../2026-11-12-third-c`: the two sets of tasks are kept apart, so a round is two runs.

- **What.** Three arms on the four control tasks, T07 to T10 of the set `first`, in variants 0 to 3: 48 tries. Each try is one Haiku subject of the kind `bench-subject-closed`. The arm "none" has `task.md` and nothing else. The arm "outline-skill" has the official outline skill beside it, and the arm "facts" the facts guide. Neither file says anything about the commands these tasks ask for. Each is here as a placebo. The request is the same, word for word, as in round one.
- **Why all three.** On the control tasks every arm runs in every round: the study says so, and no arm here is at a floor.
- **The order.** After the tries on the `outline` tasks of this round. Groups of 16: for each variant in turn, the four tasks in each arm.
- **Nothing here is scored until every round is kept.** No answer is read, and no count is taken, but the count of tries kept and of output tokens.
- **What it should cost**, guessed from round one's tries in the same arms: 128,000 output tokens, 2,660 for a try.
- **What is kept, and what the test takes for granted:** as in `../2026-11-12-third-ceiling`.

## What came

Written on 2026-11-12, after every round of the study was kept. All 48 answers of this run were read with what the tool said.

| arm | T07 | T08 | T09 | T10 | of 16 |
|---|---|---|---|---|---|
| none | 4 | 4 | 4 | 4 | 16 |
| outline-skill | 4 | 3 | 4 | 4 | 15 |
| facts | 4 | 4 | 4 | 4 | 16 |

- **One try did not pass, and it is sorted as the subject's.** With the outline skill, T08 in variant 0: the pattern `import $$$C from $S;` does not parse as one node, and ast-grep refused the rule.
- **What the run cost.** 142,930 output tokens, 2,978 for a try. The guess was 128,000.

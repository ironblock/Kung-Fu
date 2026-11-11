# 2026-11-11-check: does the bench work with a real subject?

The first part was written before the run.

- **What.** One subject, a Haiku model, on one task, T08, with the code and ast-grep to run. No guide.
- **Why.** To see that the bench can keep and score what a real subject does: that its calls are written down, that they can be run again, and that its output tokens can be put before and after its first right call.
- **What it changes.** If any of that fails, the bench is mended before any study is written down.
- **What it does not show.** Anything about the model, the task or a guide. It is one subject, one task and one pass.

## What came

Written after the run, from `python3 bench/score.py`, the calls in `none/T08/v0/calls.jsonl` and the report.

- **The bench kept and scored a real subject.** Eight calls were written down: one for the version, and seven on the task's code. Each of the seven could be run again. Two were refused, three ran and were not right, and two were right. The first right one was the sixth.
- **The tokens could be placed.** The subject wrote seven messages and 8,304 output tokens. The five messages before its first right call hold 6,555 of them. Three of its messages made more than one call. So a message's tokens go before a call when the message was written before the call started.
- **The subject left the code alone**, and its answer passed.
- **The report held more than was asked for.** After its two lines, the subject added its answer and what it matches. `score.py` reads the two lines and ignores the rest.

Nothing here was mended, so nothing stands in the way of writing a study down. This run still shows nothing about the model, the task or a guide.

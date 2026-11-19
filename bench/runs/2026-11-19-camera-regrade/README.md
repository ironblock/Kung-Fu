# The small model's camera tries, graded again by the mended checks

Written by Claude Fable 5.2 on 2026-11-19, before any try was graded again. The maintainer agreed to the mends and to this regrade on 2026-11-19. No model is run here: kept answers are run against checks.

## What it is for

`bench/sets/camera/audit` showed on 2026-11-18 that each of the 15 code tasks of the camera set had a check some wrong answer passes. On 2026-11-19 the checks were mended in two rounds: three agents mended them by the audit's findings, a fresh adversary then got a wrong answer through every one of the 15 mended checks, and the checks were mended a second time. `bench/sets/camera/CHANGES-1.md`, `CHANGES-2.md` and `CHANGES-3.md` say what changed in each task. The second mend has not been attacked.

Every pass the small model holds on those tasks was given by a check now known to be loose. This regrade says how many of those passes stand.

## What is graded

Every kept, graded try of the 15 mended tasks in the three runs that had the small models answer in one message: 540 tries.

| Run | Arms | Tries of the 15 tasks |
| --- | --- | --- |
| `2026-11-16-small-screen` | `names-27b`, `union-27b`, `names-flash`, `union-flash` | 180 |
| `2026-11-17-effort-ladder` | `names-off`, `union-off`, `names-low`, `union-low`, `union-low-b` | 315 |
| `2026-11-18-mended-notes` | `mended-low` | 45 |

The eight question tasks are not graded again. The audit found their proofs sound and nothing in them was changed.

`regrade.py grade` runs each kept answer against the check at this commit, with `box.py`'s own grader. It writes nothing into a try. A try's `grade.json` stays the grade by the check as it stood when the try was read. The grades now go to `now/<run>.json`, with the digest of the check that gave each.

The four earlier runs on this set (`2026-11-15-camera-notes`, `2026-11-15-camera-union`, `2026-11-15-screen`, `2026-11-16-one-shot`) had a Haiku model as subject. They are not graded again here. Their scores stand as given by the loose checks, and this note says so wherever it sets a number of theirs beside a number from here.

## Two changes, kept apart

1. **The checks.** `regrade.py grade` and `report`. The answer is the one the run kept.
2. **The reader of replies.** `bench/small.py` now takes a `FILE:` line that stands in a fence of its own, and on 2026-11-17 it began to take one that stands inside its fence. `regrade.py reread` reads every kept reply of the three runs with today's reader and lists each try where it finds other files or other contents than the run kept. Each such try is then graded as read today, by the check before the mends and by the check now. These tries are reported on their own lines. Their kept grades stay in every count, since a count "as kept" must be what the run gave.

## How it is read

For each arm: the tries, the passes as kept, the passes now, and the tries that went from pass to fail and from fail to pass. Then the run's own fixed comparisons, asked of the kept grades and of the grades now, with `box.py`'s rule and seed.

Every try whose grade changes is read: the answer, and the grader's output to its last line. Each is sorted one of three ways.

- **Wrong by the ask it answered.** The case it fails tests something the ask said when the try was sent.
- **Only by the new words.** B6, G1 and G2 gained words in their asks on 2026-11-19. A try that fails only a case those words brought in did nothing its own ask ruled out. B6's old ask is kept as `ask-v1.md`; the old asks of G1 and G2 are in `CHANGES-3.md`.
- **The check's.** The answer does what the ask asks and the mended check fails it. Each of these is a fault to mend, and its try keeps its pass.

Each arm's passes are then given three ways: as kept; by the checks now; and by the checks now with the tries of the last two sorts counted as passes. The third is the one to carry forward.

A try that goes from fail to pass is read too. The mends only added cases, apart from B6, so none is expected.

## What each outcome changes

| What comes | What it changes |
| --- | --- |
| Few passes turn, spread evenly over the arms | The scores of 16 to 18 November stand, with the audit's caveat closed for these checks as far as two rounds of attack go. |
| Many more passes turn in the arms without notes than in the arms with notes | The gain the notes showed on this set was understated. The comparisons stand or widen. |
| Many more passes turn in the arms with notes | Part of the gain came from answers that satisfy a loose check. Each comparison that changes its answer is taken back in the run's own note, with the date. |
| Many passes are sorted "the check's" | The second mend overreached. The checks are mended again before any score is carried forward. |

## My guess

Made after reading the audit's table and the three notes of changes, and before any try was graded again.

- The audit's own probes, which knew only the first round's faults, found 11 kept passes wrong in the two runs it looked at: 2 in `names-27b`, 3 in `names-flash`, 2 in `union-flash`, 3 in `names-low`, 1 in `union-low-b`, none in `union-27b` or `union-low`.
- The second round added cases no kept answer has met: an orthographic camera, frames of 33 ms, the right-handed build, both Shift keys, a flight set frame by frame beside the library's. I guess these turn more passes than the first round did. **25 to 60 of the 274 kept passes turn to fail, B6 left aside.**
- On B6 most kept passes fail the new check, and nearly all of them only by the new words.
- The arms without notes lose a larger share of their passes than the arms with notes, since an answer of the subject's own design is what the new cases catch.
- No fixed comparison of the effort ladder changes its answer.
- Between 3 and 10 of the turned passes are sorted "the check's". The second mend compares several answers with the library frame by frame to within 1e-6, and I have not seen that tried on many right answers.

## What it does not cover

- The second mend was not attacked. A check that has been broken twice may break a third time.
- Each right answer of another design that the menders and adversaries tried against the mended checks passed, and that is about three to five such answers a task. The kept tries are the first large set of answers written by someone who never saw a check.
- A kept failure stays a failure unless the check now passes it. Nothing here asks whether an answer that failed the old check was right.
- The session that had the checks mended also reads this.

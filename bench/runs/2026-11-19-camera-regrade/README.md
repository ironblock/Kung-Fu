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

## What came

Written by Claude Fable 5.2 on 2026-11-20, and corrected the same day after four fresh readers checked it; the list of what they changed is at the end. The whole set's `check-tasks` ended "all as they must be" with the checks of commit `3ad25da`, which are the checks every grade here was given by.

### The count

All 540 tries were graded again. **52 of the 274 kept passes now fail. No kept failure now passes.** All 11 passes the audit's probes had named are among the 52.

By task, of 36 tries each over the three runs:

| Task | Passed as kept | Passed now |
| --- | --- | --- |
| G2 | 17 | 0 |
| F2 | 17 | 3 |
| B6 | 22 | 11 |
| G1 | 7 | 3 |
| G3 | 22 | 19 |
| B5 | 24 | 22 |
| F1 | 14 | 13 |
| A1, A3, B1, B2, B3, B4, C4, K1 | 131 | 131 |

20 of the 52 fail a case the first mend added. 32 fail only a case the second mend added, the one no adversary has attacked: F2's 14, G2's 17 and one of B6.

### The classes and the judges

The 52 fall into nine classes, by task and by the cases they fail. For each class one agent read every answer, ran it, and wrote down what it does in the failing case. Then three agents judged, each alone and each with its own lens, whether that is wrong by the ask as the try was sent: one as the app's owner, one by the ask's words alone, one who wrote down what the ask requires before reading what the answers do. Their brief did not say which arm a try came from. It did not hide it either: the paths they read carry the arm's name, and a try with notes shows its notes. `sorts.json` holds each class, each verdict with its reasons, and each try's sort.

| Class | Tries | The three judges | Sorted |
| --- | --- | --- | --- |
| B5: places halved where the canvas has more backing pixels than CSS pixels | 2 | wrong, wrong, wrong | wrong by the ask |
| B6: the view a renderer reads is stale | 1 | wrong, wrong, wrong | wrong by the ask |
| B6: an up between 1e-12 and 1e-10 radian off the line of sight turns the camera off its target | 1 | wrong, wrong, wrong | wrong by the ask |
| F1: a drag made while a key is held turns too little | 1 | wrong, wrong, wrong | wrong by the ask |
| G3: a place whose heading is past half a turn never settles true | 3 | wrong, wrong, wrong | wrong by the ask |
| G1, two of its four tries: writes through `setGeospatialOrientation` stay outside the mode's range | 2 | wrong, wrong, and see below | wrong by the ask |
| G1, the other two: a mode wider than the camera's defaults is cut to the defaults | 2 | wrong, wrong, only by the new words | wrong, two of three |
| F2: a jump made while the view still glides slides on past the new eye | 14 | wrong, wrong, the check asks for more | wrong, two of three |
| G2: longitudes are mirrored in the library's right-handed build | 17 | wrong, wrong, the check asks for more | wrong, two of three |
| B6: banks against the line of sight fixed when the camera was made | 9 | wrong, only by the new words, two fair readings | only by the new words |

- **G1 is one class of four tries in `sorts.json`.** The judge who read by the words gave the class one verdict, "only by the new words", and named two of the four as wrong by the ask as sent all the same: they leave a zoom of 3500 in a mode of 50 to 2000. I split the row on that.
- **The other two G1 tries rest on the judges against the mender.** `CHANGES-3.md` says of the test they fail: "The ask did not say so." Two judges hold that "must give that mode's ranges" covered it before the new words came.
- **So 8 tries are wrong by the ask with all three verdicts, 2 more by all three judges' reasons, 33 by two judges of three, and 9 fail only what B6's ask gained.** No class was sorted "the check's" by a majority. For 42 of the 52 at least one judge of the three held that the answer did not break the ask as sent.

### The two large classes are close calls

F2 and G2 are 31 of the 52, and 29 of those 31 are in arms that had notes.

- **F2, 14 tries.** Every one keeps one camera, and on a jump writes its place, its target and the controls' own heading. That is what the task was written to test (`where.md`), and all 14 get it right. What fails is new: when the jump comes within about a second of letting a key go, the glide left in the controls carries the view on. The reader's probe gave 9.9 units past the saved eye; the check's output shows the first frame, 0.69 in x. Two judges hold that "`jumpTo` puts the viewer at the new `eye`" covers it. The third holds that the ask says nothing of motion in progress, and that "the controls carry on from that view" points the other way. Any app meets the situation in ordinary use. Two of the 14 replies told the user that a glide might linger after a jump.
- **G2, 17 tries.** Every one writes a fixed formula with east as world -Y. That is the library's east in its default build, and it is what the task was written to test. In the library's right-handed build east is +Y and every longitude lands on the mirror meridian. Two judges hold that "North and east must be the camera's own" covers any build. The third, reading as the owner, holds that an app is built one way, the message named no build, and an app on the default build never meets it. All three are recorded "fairly sure". The two name one doubt: the ask names no build, and the notes sent beside it gave east as -Y flat.
- **The G2 answers follow a note.** The union list's note 54, which is note 58 of the mended list, says "yaw PI/2 (east) toward -Y" with no build named. All 17 answers use its formula. Eight name the note by its number in the reply, and the 15 with reasoning kept quote it there. Every message also listed `computeLocalBasis` in its declarations, the call the reference asks for east.
- **No arm without notes passed a try of G2,** before or after. So on G2 the notes buy an answer that is right in the build they were written against and wrong in the other. The note is a fact stated wider than its check.

I designed this regrade, so I let the majority stand and give the counts both ways. My own reading is that F2's case is fairly the ask's and G2's is not: no user of the default build could see it. That is one reader's view against two judges'. A fresh reader who went looking for a right answer among the 52 found none beyond dispute: it holds that one G2 answer and the two wide-only G1 answers meet the ask as sent by its words, and that one F2 answer is arguable.

### Each arm, four ways

Of 69 tries an arm, or 138 where the arm was sent twice as many; 24 of each 69 are question tasks, which were not graded again. "Carried" is the count to carry forward: by the checks now, with the nine B6 tries that fail only by the new words kept as passes. The last column adds back the 33 tries that two judges of three called wrong: F2's 14, G2's 17 and G1's 2.

| Run | Arm | As kept | By the checks now | Carried | If those 33 passed |
| --- | --- | --- | --- | --- | --- |
| `2026-11-16-small-screen` | `names-27b` | 29 | 26 | 26 | 27 |
| | `union-27b` | 51 | 45 | 45 | 50 |
| | `names-flash` | 43 | 39 | 39 | 41 |
| | `union-flash` | 59 | 52 | 52 | 58 |
| `2026-11-17-effort-ladder` | `names-off` (138) | 2 | 2 | 2 | 2 |
| | `union-off` (138) | 11 | 9 | 9 | 11 |
| | `names-low` | 21 | 16 | 18 | 18 |
| | `union-low` | 51 | 42 | 45 | 51 |
| | `union-low-b` | 46 | 39 | 40 | 45 |
| `2026-11-18-mended-notes` | `mended-low` | 64 | 55 | 58 | 64 |

- **The nine B6 tries are carried as passes on a split.** One judge of three called them wrong by the ask as sent. Without them "carried" is "by the checks now".
- **By my own reading,** carried with G2's 17 kept as passes: `union-27b` 48, `union-flash` 55, `union-off` 11, `union-low` 48, `union-low-b` 43, `mended-low` 61.
- **The mended notes' failures more than double:** 5 of 69 as kept, 11 carried. Six of the new ones are F2 and G2.

### The comparisons

`allpairs.py` asks again every whole-set comparison that the three runs' notes give, twelve in all, each of the four ways. It asks each pair from a fresh stream, as the ladder's own `ladder.py` does; `allpairs.txt` holds its output.

**Every comparison of notes against the declarations keeps its answer, whichever way the passes are counted:**

| Pair | As kept | Carried |
| --- | --- | --- |
| `union-low` against `names-low` | +0.43 (+0.28 to +0.59), shown | +0.39 (+0.23 to +0.55), shown |
| `union-27b` against `names-27b` | +0.32 (+0.14 to +0.49), shown | +0.28 (+0.12 to +0.43), shown |
| `union-flash` against `names-flash` | +0.23 (+0.07 to +0.41), cannot tell | +0.19 (+0.03 to +0.36), cannot tell |
| `union-off` against `names-off` | +0.07 (+0.01 to +0.12), no difference as large as a quarter | +0.05 (+0.01 to +0.10), no difference as large as a quarter |

So does one arm sent twice, `union-low` against `union-low-b`: +0.07 (-0.03 to +0.20) both as kept and carried, no difference as large as a quarter.

**Three of the twelve change their answer in some count:**

| Pair | As kept | By the checks now | Carried |
| --- | --- | --- | --- |
| `names-low` against `names-27b` | -0.12 (-0.23 to -0.01), no difference as large as a quarter | -0.14 (-0.30 to +0.00), cannot tell | -0.12 (-0.26 to +0.01), cannot tell |
| `union-27b` against `names-flash` | +0.12 (-0.04 to +0.29), cannot tell | +0.09 (-0.07 to +0.25), no difference as large as a quarter | the same as now |
| `mended-low` against `union-low-b` | +0.26 (+0.12 to +0.42), shown | +0.23 (+0.07 to +0.41), cannot tell | +0.26 (+0.12 to +0.42), shown |

- The first is the ladder's "long reasoning bought nothing without notes". By the carried counts the rule no longer says there is no difference as large as a quarter. It cannot tell.
- The third is the mended notes against the second round of the list they were mended from. It is shown as kept and carried, and not shown if the nine B6 tries are counted as failures.
- By kind of task, one more changes by the checks now and not carried: `union-low` against `union-27b` on the nine tasks of the first kind.

### The reader of replies, kept apart

`regrade.py reread` read all 828 kept replies of the three runs with today's `small.py`. It reads three another way than the runs kept them. None of this is in any count above.

| Try | Kept grade | Read today, by the check before the mends | Read today, by the check now |
| --- | --- | --- | --- |
| `2026-11-17-effort-ladder` `names-low/B6/2` | failed | passed | fails only the case B6's new words brought |
| `2026-11-17-effort-ladder` `names-low/C5/3` | failed | passed | passed |
| `2026-11-16-small-screen` `union-27b/F2/3` | failed, no file taken | failed, two cases | failed, three cases |

So the fence fault cost `names-low` two passes: 21 as kept, 23 as today's reader would have read it. With both changes together `names-low` is 20 of 69 carried.

### My guesses, scored

| Guess | What came |
| --- | --- |
| 25 to 60 of the 274 kept passes turn, B6 left aside | 41. Held. |
| On B6 most kept passes fail, nearly all only by the new words | 11 of 22 fail, 9 of them only by the new words. Half, not most. |
| The arms without notes lose a larger share of their passes | Missed. On the 15 tasks they lost 12 of 78 kept passes, 15%. The arms with notes lost 40 of 196, 20%. Carried: 10 of 78 and 33 of 196, 13% and 17%. |
| No fixed comparison of the ladder changes its answer | Held for the three pairs in its `run.json`. Missed for one of the others its note fixes: `names-low` against `names-27b`. |
| 3 to 10 are sorted "the check's" | Missed: none by a majority. One judge of three said so of F2's 14, and another of G2's 17. |

I guessed the new cases would catch answers of the subject's own design. They caught answers that follow the notes.

### Which outcome came

Of the rows under "What each outcome changes", the third is nearest: more passes turn in the arms with notes, 20% against 15%. So part of what the notes' arms scored was answers that pass a loose check. It was a small part: no comparison of notes against declarations changes its answer, and the gain the ladder fixed a rule for is +0.39 carried against +0.43 as kept.

### What this changes

- **The counts of 16 to 18 November come down, and the gains of the notes stand.** By the checks now the arms with notes lose 2 to 9 passes each, and the arms without lose 0 to 5.
- **One claim about effort is weaker.** "Long reasoning bought nothing without notes" rested on `names-low` against `names-27b`, which the rule now cannot tell.
- **Some notes lack a condition.** The note on east gives the default build's direction and names no build, though the same list names a right-handed build for the controls (union note 77). The notes that send answers to rewrite the controls' heading on a jump (union notes 5 and 52, mended 6 and 56) say nothing of a glide left in the controls, though the list says elsewhere that moves decay by inertia (union notes 27 and 40). Two of the 14 F2 answers had no notes and wrote the same answer. Mending these notes from these tries would be a mend on a development set.
- **The checks are tighter than the tasks' own account of what they test.** `where.md` for F2 and G2 names what those 31 answers got right. A check that goes past its task's point measures care at edges as well as the fact, and the second matters only if the ask reaches the edge. Whether G2's right-handed case stays in the check is the maintainer's call. It is left in.
- **No ceiling has been run on the mended checks.** `AGENTS.md` asks for one again when the tasks change. G2 has no pass left in 36 tries and F2 three, and nothing here shows a stronger reader passes them as they now stand with what these arms were given. That comes before any new run on this set.
- **The four runs with a Haiku model on this set were not graded again.** Their counts were given by the loose checks and are not set beside any count here.

### What I read and did not read

I read the regrade's log and tables, the mended check's output for the three tries first to turn, one G2 answer whole with the notes it was sent, the `where.md` of F2 and G2, the asks of six tasks, the three notes of changes, and every reader's, judge's and checker's report. I did not read the other answers. What is said of them is the nine readers', and a fresh reader then read all 14 F2 answers and all 17 G2 answers and found the descriptions hold.

The second mend has still not been attacked.

### Corrected after four fresh readers, 2026-11-20

Two agents checked this section's numbers and claims against the files. What they changed:

- **"No fixed comparison changes its answer" was too wide.** I had asked only the three pairs in the ladder's `run.json`. Asked for all twelve the notes give, three change in some count. The section "The comparisons" is new.
- **"No judge found a right answer among the 52" was wrong.** No majority did. It now says what one judge of three held, and of how many.
- **"The mended notes' score falls most" was wrong.** `union-flash` falls 7 carried and three other arms 6, as it does.
- **The shares in the guesses' table counted the question tasks.** They were 12 of 95 and 40 of 282; on the 15 tasks they are 12 of 78 and 40 of 196.
- **"The G2 answers cite note 54" was too wide.** Six name note 54 and two name the same note as 58. All 17 use its formula.
- **"Both say they are not sure, for that reason" misreported the judges.** All three are recorded "fairly sure", and the doubt the two name is their own.
- **"No judge was told which arm" hid that the arm was readable** from the paths and the notes.
- **The interval +0.28 to +0.61 was `regrade.py`'s,** which draws a run's pairs from one stream. The ladder's own note has +0.28 to +0.59, and this section now uses that way of asking.
- **Added:** each task's passes before and after; which mend each failure comes from; which outcome came; that no ceiling has been run on the mended checks; the counts by my own reading; and that the B6 nine are carried on a split.

# Changes to `worklog` and its three tasks

The findings are the adversary's, in `/home/build/patch/worklog/findings.md`. A breach is named by the file the adversary filed it as, `hollow-adv-<n>.ts`, under its task.

**Another mender took over here.** Written by Claude Opus 5.5 on 2026-11-22. The mender before me was stopped by a usage limit. It left no lines in this file and no change in W: every file was as the adversary left it, and `check-tasks` still ended `window: none; 23 WRONG`. So every line below is mine.

## The module, `files/worklog.ts`

- `WorkLog.move` gains a refusal of its own, lines 422 to 425: a move to `signed` by anyone with a move to `done` in the history is refused, under the comment "Sign-off needs a second pair of eyes." The file is 496 lines, where it was 492. No other line changed, and the outline is the same but for the line numbers after line 421. Answers PF2, "Its kind": see PF2 below.
- Every `plain.ts` is the new module, byte for byte. Answers the same.
- PF1 and PF3: `reference.ts`, `other.ts` and every hollow answer were made again on the new module, each with the same change it had, line for line. They were carried over with `patch` and compared line for line. No `reference.edits.md` of PF1 or PF3 changed, since neither quotes a line of `move`. Answers the same.
- `tasks/*/holds/` were made again by `holds.py make`. Answers the same, and the asks of PF1 and PF2 below.

## The shared helper, `checks/helpers-worklog.ts`

It had 96 cases and now has 110. Each pins what the module does now, and all three checks run it.

- New case "canMove: every pair of states, for an urgent and a soon job". Answers PF1 `hollow-adv-12`.
- New case "formatPence: a sum that is not whole pence is rounded to the nearest penny first". Answers PF1 `hollow-adv-1`.
- New case "jobLine: prints the boat as the job holds it". Answers PF1 `hollow-adv-11`.
- New case "addPart: a unit price need not be a whole number of pence". Answers PF1 `hollow-adv-3`.
- New case "addTime: an entry that holds an old one inside it, or that meets any of several, is refused". Answers PF1 `hollow-adv-2` and PF2 `hollow-adv-3`.
- New case "addTime: keeps the fitter's name as given, and only the very same name is the same fitter". Answers PF2 `hollow-adv-11` and PF3 `hollow-adv-3`.
- "lateBy: 0 with no due day, on or before the due day, and for a dropped job" and "lateBy: a job closed on or before its due day is not late, whatever the day" now add 0 to each result before they compare it, so -0 passes as 0. Answers PF3, "One unfair spot".
- New case "boatsOf: the order is by character code, so a capital with an accent comes after Z". Answers PF3 `hollow-adv-2`.
- New case "WorkLog.open: keeps the name of the person who opened the job as given". Answers PF2 `hollow-adv-2`.
- "WorkLog.move: a job the log does not hold is refused" now also tries a move to `signed`. Answers PF2 `hollow-adv-8`.
- New case "WorkLog.move: dropping a job leaves it with no closing day". Answers PF2 `hollow-adv-1` and PF3 `hollow-adv-4`.
- New case "WorkLog.move: takes any name, a blank one too, and keeps it as given". Answers PF3 `hollow-adv-11`.
- The case "WorkLog.move: the person who finished a job may sign it too" is gone. In its place are "WorkLog.move: the person who finished a job may not sign it, someone else may" and "WorkLog.move: nor may anyone who finished it before it was reopened", which pin the module's new refusal. Answers PF2, "Its kind".
- New case "WorkLog.logTime: a done job still takes time, a signed one does not". Answers PF2 `hollow-adv-12`.
- New case "WorkLog.usePart: a done job still takes parts, a signed one does not". Answers PF1 `hollow-adv-13`.
- New case "WorkLog.escalate: leaves a done job alone, and a signed one". Answers PF3 `hollow-adv-1`.

## PF1 (beside), `WorkLog.partsBySku`

- `ask.md`: "found on the jobs in the log" is now "found on the jobs it counts", "across all the jobs" is now "across those jobs", and the sentence on dropped jobs ends "and a part number found only on them has no entry". 135 words. Answers PF1's "One small doubt in the ask".
- `check.test.ts`: new case "keys a line put on the job by hand by its sku exactly as it is stored, with no trimming or capitals". It puts on a line whose sku is `"pin-6 "` through `get`. It rests on the ask's "exactly as it is stored". Answers `hollow-adv-6`.
- `check.test.ts`: new case "counts the jobs that are booked and started". It rests on "Count every other job, finished or not". Answers `hollow-adv-7`.
- `check.test.ts`: "does not change the log or its jobs" first puts `ROPE-10` and then `EYE-8` on job 4, so a job's lines are out of sku order when the method is called. Answers `hollow-adv-8`.
- The adversary's files have new names: `hollow-adv-1.ts` is now `hollow-floor.ts`, `-2` is `hollow-wrap.ts`, `-3` is `hollow-wholeprice.ts`, `-6` is `hollow-rekeyed.ts`, `-7` is `hollow-notbooked.ts`, `-8` is `hollow-sorted.ts`, `-11` is `hollow-boatkey.ts`, `-12` is `hollow-urgentdone.ts` and `-13` is `hollow-openonly.ts`. The check fails each at an assertion, by the case written for it. Answers each breach.
- The near miss `hollow-adv-10.ts` is now `hollow-frozen.ts`. Answers "Kept because it came close".
- `where.md`: `boatSummary` is on line 476, not 472. "An answer that trims and capitalises again also passes" is now that such an answer fails, and by which case. The new hollow answers are named. Answers `hollow-adv-6` and the other breaches, and the module's change for the line number.

## PF2 (inside), `WorkLog.move`

The adversary showed that the task as written could be done from the outline. Its change was a new refusal, which can stand straight after the first line of `move`, and the only body fact it needed, the order of the history, can be hedged. I ran the adversary's two outline-only answers. On the module and check as they were, both passed. On the module and check as they are now, both fail. The task now asks to change a refusal that is in the body, and nothing put after the first line can undo that refusal. It still turns on the latest finish, read from a history kept newest first.

- `ask.md` rewritten, with the title "Let an earlier finisher sign a job off". It says that `WorkLog.move` refuses a signing by anyone who has ever finished the job, and asks that only the person on the most recent move to `done` be refused, with names compared exactly. 152 words. Answers "Its kind".
- `reference.ts` and `reference.edits.md`: one line of the module's refusal changes, `job.history.some((m) => m.to === "done" && m.by === by)` to `job.history.find((m) => m.to === "done")?.by === by`. The edit quotes only text inside `move`'s lines. Answers "Its kind".
- `other.ts`: the adversary's right answer, the loop that stops at the first move to `done`, now stands in the place of the module's refusal and not beside it. Answers "Its kind", and keeps the adversary's answer.
- `check.test.ts`: new case "compares the finisher's name exactly as it was written too". Answers `hollow-adv-7`.
- `check.test.ts`: new case "after two finishes on one day, the later one is the most recent". Answers `hollow-adv-6`.
- `check.test.ts`: new case "after three finishes, only the last counts". It tests the new ask's "most recent move to `done`" past two finishes. Answers "Its kind".
- `check.test.ts`: it now skips "WorkLog.move: nor may anyone who finished it before it was reopened", the one case of `unchanged` the new change alters. Answers "Its kind".
- `hollow-oldest.ts`, `hollow-opener.ts` and `hollow-lost.ts` were made again on the new module, each with the wrong idea it had, now put in the place of the module's refusal. Answers "Its kind".
- The adversary's breaches were made again on the new module, each with the change it had, and given names: `hollow-adv-6.ts` is now `hollow-sameday.ts`, `-7` is `hollow-trimmed.ts`, `-8` is `hollow-unknown.ts`, `-1` is `hollow-dropday.ts`, `-2` is `hollow-openby.ts`, `-3` is `hollow-lastentry.ts`, `-11` is `hollow-fittertrim.ts` and `-12` is `hollow-logdone.ts`. The check fails each by the case written for it. `hollow-unknown.ts` fails by the `TypeError` it throws in that case. Answers each breach.
- `hollow-adv-9.ts` is deleted. It refused anyone who had ever finished the job, which is now what the module does, so it is the plain answer. Answers "Kept because it came close".
- `where.md` rewritten for the new task. It names the hollow answers, and says that an answer that adds a refusal for the latest finish and keeps the old one acts as the file does now. It also names the two right answers that need no body and are still open, for whoever reads an `outline-1` pass (see what was left alone). Answers "Its kind" and the breaches.

## PF3 (leans), `lateBy`

- `check.test.ts`: every result of `lateBy` goes through a function `late`, which adds 0 to it, so a right answer that gives -0 passes. Answers "One unfair spot". The adversary's answer `Math.ceil((weekOf(at) - job.dueDay) / 7)` with `weeks < 0 ? 0 : weeks` failed the check as it was and passes now.
- `check.test.ts`: new case "counts the yard weeks the same way on days before day 0", with due days -3 and -10. It rests on the ask's "the yard week this file already works with". Answers `hollow-adv-9`.
- The adversary's files have new names: `hollow-adv-9.ts` is now `hollow-trunc.ts`, `-1` is `hollow-escalatedone.ts`, `-2` is `hollow-locale.ts`, `-3` is `hollow-samefitter.ts`, `-4` is `hollow-dropday.ts` and `-11` is `hollow-blankby.ts`. The check fails each at an assertion, by the case written for it. Answers each breach.
- `where.md`: `week += 7` is on line 491, not 487. The new hollow answers are named. Three notes were added: how -0 is taken, why due days below 0 are fair, and that a reader who guesses that `weekOf` gives the day number of the week's first day is right by luck, so a `region` pass is to be read before it is counted as knowing the fact. Answers the breaches, "One unfair spot", and the second of "Two cautions".

## What was run after the last change

- `tsc --strict` on `files/worklog.ts`: no output, exit 0. The same on each `reference.ts`, `other.ts`, `plain.ts` and hollow answer, 43 files, copied to `.ts` files outside W: none failed.
- `holds.py make W` and then `holds.py check W`: `all as they must be`.
- `box.py check-tasks W --window none`: `window: none; all as they must be`.
- Right answers written other ways, graded in a scratch copy, all pass. For PF1: the method as the first member with `flatMap` and `reduce`, and a loop over the map's entries. For PF2: `job.history[0].by === by`, and `filter(...)[0]`. For PF3: the -0 answer, `Math.floor((at - weekOf(job.dueDay)) / 7)`, the adversary's division by `weekOf(7) - weekOf(0)` and its `while` loop, and a week of one's own made with `Math.floor((day + 2) / 7)`.

## Left alone

- **PF2: two outline-only roads are still open.** I wrote both and both pass. (1) Keep the old body under a new name, quoting only the first line, and call it with a stand-in name for a signing that only the old refusal stands in the way of. That road is open in any `inside` task whose result can be made from the old one's. The `fuel` and `tides` menders left it open too, as the run's author's to decide for all sixteen. (2) Do the whole signing at the top of the method. That needs the rule on the day, which only the body and its comment show, guessed exactly: without the rule it fails "still refuses a signing the table does not allow". Both are as hard as writing the body anew, which is what an `inside` task is meant to cost an outline reader. `where.md` says to read an `outline-1` pass for them.
- **PF3, "A careful region reader can be right without the fact".** `where.md` already named both roads and called them unlikely. No check can fail them, since they are right. Nothing changed but the note on the fact's second outcome above.
- **PF3 `hollow-adv-2.ts`, `boatsOf` with `localeCompare`.** The adversary called it weak and left the case to the mender. I added the case, as listed above, and did not leave the breach open. Its case pins what the module does now, and none of the three tasks touches `boatsOf`, so it cannot fail a right answer. Its name says that the order is by character code, which is not quite the "alphabetical order" of the module's comment.
- **The module's small things the adversary listed**: `formatPence(-0.4)` gives `-£0.00`, `summariseBoat` throws on a job with an empty history, `addTime` takes `NaN` minutes and `addPart` a `NaN` price, and `forBoat` compares `job.boatId === key` where `summariseBoat` compares `boatKey(job.boatId)`. The adversary said the mender need not act on them, and no task turns on any of them. I changed none, and no new case pins any of them. The new `formatPence` case keeps to values whose sign does not turn on rounding.
- **"A helper breach was run under one task's check only."** Each module-wide breach is kept once, in the task where the adversary filed it. The helper is shared, so the case that fails it runs in all three checks. The drop that sets the closing day was filed under PF2 and PF3, and is kept under both as `hollow-dropday.ts`.
- **PF1 and PF3, their kind.** The adversary found PF1 to be a `beside` task and PF3 a `leans` task. Nothing to mend.

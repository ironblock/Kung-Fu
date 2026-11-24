## changes

Every finding in /home/build/patch/worklog/findings.md is now answered or left alone with a reason, and all three required commands end as they must. The full list, one line for each change with the finding it answers, is in /home/build/patch/worklog/set/CHANGES.md.

State found: the earlier mender left no CHANGES.md and changed no file in W. check-tasks still ended "window: none; 23 WRONG". So every finding was open, and every change below is mine. CHANGES.md opens with a line saying another mender took over here.

MODULE (answers PF2 "Its kind")
- WorkLog.move gains a refusal of its own, lines 422-425: a move to signed by anyone with a move to done in the history is refused. The file is 496 lines (was 492). The outline is the same except for line numbers after line 421.
- Every plain.ts is the new module byte for byte.
- PF1 and PF3 reference.ts, other.ts and every hollow were rebuilt on the new module with `patch`, each keeping its own change line for line, and checked.
- No PF1 or PF3 reference.edits.md changed.
- holds/ were made again.

HELPER, checks/helpers-worklog.ts (96 cases, now 110)
- New cases, by breach:
  - canMove for urgent and soon jobs (PF1 adv-12)
  - formatPence on sums that are not whole pence (PF1 adv-1)
  - jobLine prints the boat as the job holds it (PF1 adv-11)
  - addPart takes a price that is not whole pence (PF1 adv-3)
  - addTime: an entry over an old one, or over any of several (PF1 adv-2, PF2 adv-3)
  - addTime keeps the fitter's name as given and compares it exactly (PF2 adv-11, PF3 adv-3)
  - boatsOf orders by character code (PF3 adv-2)
  - WorkLog.open keeps the opener's name as given (PF2 adv-2)
  - WorkLog.move: a drop leaves no closing day (PF2 adv-1, PF3 adv-4)
  - WorkLog.move takes a blank name (PF3 adv-11)
  - WorkLog.logTime on a done job (PF2 adv-12)
  - WorkLog.usePart on a done job (PF1 adv-13)
  - WorkLog.escalate on a done job (PF3 adv-1)
- "WorkLog.move: a job the log does not hold is refused" now also tries a move to signed (PF2 adv-8).
- The two kept lateBy cases add 0 before comparing (PF3 "One unfair spot", the -0).
- "WorkLog.move: the person who finished a job may sign it too" is replaced by two cases that pin the new refusal (PF2 "Its kind").

PF1 (beside)
- ask.md now says "found on the jobs it counts", "across those jobs", and that a part number found only on dropped jobs has no entry (the doubt about a part found only on dropped jobs). 135 words.
- New check case: a line put on by hand through get with sku "pin-6 " is keyed exactly as stored (adv-6).
- New check case: booked and started jobs count (adv-7).
- "does not change the log" now has a job whose lines are out of sku order (adv-8).
- Renames: adv-1 floor, adv-2 wrap, adv-3 wholeprice, adv-6 rekeyed, adv-7 notbooked, adv-8 sorted, adv-11 boatkey, adv-12 urgentdone, adv-13 openonly. Near miss adv-10 is now frozen.
- where.md: line 476 (was 472), the sentence saying a re-trimming answer passes is corrected, and the new hollows are named.

PF2 (inside): I judge the finding right.
- On the old module, the adversary's outline-only hedge and its plain `find` guess both passed.
- On the new module both fail, because a refusal put at the top cannot undo the one in the body.
- The task still turns on the latest finish in a history kept newest first.
- New ask.md: "Let an earlier finisher sign a job off", 152 words.
- New reference.ts and edits: one line, some(...) becomes find(...)?.by === by.
- other.ts: the adversary's loop now stands where the module's refusal was.
- New check cases: the finisher's name is compared exactly (adv-7), two finishes on one day (adv-6), three finishes.
- The check now skips "WorkLog.move: nor may anyone who finished it before it was reopened".
- Rebuilt and renamed: oldest, opener, lost, and the adversary's breaches as sameday (adv-6), trimmed (adv-7), unknown (adv-8), dropday (adv-1), openby (adv-2), lastentry (adv-3), fittertrim (adv-11), logdone (adv-12).
- adv-9 is deleted: it now behaves exactly as the plain answer does.
- where.md is rewritten.

PF3 (leans)
- Every lateBy result in the check goes through `late`, which adds 0, so a right answer that gives -0 passes. The adversary's -0 answer failed the old check on 5 cases, all on -0, and passes now.
- New case: days before day 0, due days -3 and -10 (adv-9).
- Renames: adv-9 trunc, adv-1 escalatedone, adv-2 locale, adv-3 samefitter, adv-4 dropday, adv-11 blankby.
- where.md: line 491 (was 487), the new hollows named, and notes on -0, on due days below 0, and that guessing weekOf gives the week's first day is right by luck ("Two cautions").

CHECKED
- Each breach now fails at the case written for it. hollow-unknown fails by the TypeError it throws inside its case.
- All 43 answer files pass tsc --strict.
- Right answers in other styles pass: 2 for PF1, 2 for PF2, 5 for PF3, the -0 one included.
- Nothing under /home/user/Kung-Fu changed (git status is empty), and nothing was committed.
- A backup of W as I found it, and my probe answers, are in SCRATCH/mend-worklog/.

## tsc_last_line

(no output; exit 0)

## holds_check_last_line

all as they must be

## check_tasks_last_line

window: none; all as they must be

## left_alone

1. PF2: two outline-only routes are still open. I wrote both and both pass.
   - The wrapper: keep the old body under a new name and call it with a stand-in name. That route is open in any inside task whose result can be made from the old one's, and the fuel and tides menders also left it to the run's author.
   - A full rewrite of the signing at the top of move. This passes only if it guesses the hidden date rule exactly; without that rule it fails "still refuses a signing the table does not allow".
   - Both cost as much as writing the body anew. where.md says to read an outline-1 pass for them.

2. PF3, "a careful region reader can be right without the fact": the two other routes are right answers, so no check can fail them, and where.md already named them. I only added the note on the fact's second outcome.

3. The module's small faults:
   - formatPence(-0.4) gives "-£0.00".
   - summariseBoat throws on a job with an empty history.
   - addTime takes NaN minutes and addPart takes a NaN price.
   - forBoat compares the boatId as stored, where summariseBoat compares it trimmed and in capitals.
   The adversary said the mender need not act, and no task turns on any of them. None was changed or pinned.

4. "A helper breach was run under one task's check only": each module-wide breach is kept once, in the task where it was filed. The helper case that fails it runs in all three checks. The drop that sets closedDay was filed under both PF2 and PF3, so it is kept in both.

5. PF1 and PF3, their kind: the adversary found each of its kind. Nothing to mend.

PF3 hollow-adv-2 (boatsOf with localeCompare) was not left alone, though the adversary called it weak. I added a case that pins the order by character code. It cannot fail a right answer, since no task touches boatsOf. Its name admits the order is not quite the "alphabetical order" of the module's comment.

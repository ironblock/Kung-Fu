## changes

Every breach the adversary filed now fails at an assertion, and all three commands end as they must. The earlier mender had left nothing: there was no CHANGES.md, every file was dated 2026-11-20, and check-tasks ended "60 WRONG", all of them adversary files. So /home/build/patch/rota/set/CHANGES.md is new. It opens with a line saying another mender took over here, and my lines follow it. A copy of W as I found it is in SCRATCH/mend-rota/before.

Unchanged: the module, the asks, every plain.ts, reference.ts, reference.edits.md and other.ts, and the holds/ texts.

checks/helpers-rota.ts: I added 20 cases to `unchanged`, taking it from 126 to 146. Each one answers one item of section A, and the three files for that item (one in each task) are renamed:
- A1, whyNot names the first clash and the first short rest in the rota's own order (2 cases): PE2 adv-10 and PE3 adv-14 -> hollow-clashorder.ts. PE1 adv-9 is the same file but was not a breach in PE1, so it keeps its name.
- A2, toLines leaves the rota's own order: -> hollow-linessort.ts.
- A3, load skips a # line only when # is the first character: -> hollow-hashtrim.ts.
- A4, load keeps the shifts read before a line it refuses: -> hollow-loadall.ts.
- A5, moveShift checks neither the day nor the times: -> hollow-movetimes.ts.
- A6, lapseSwaps goes by the notice alone: -> hollow-lapseopen.ts.
- A7, a person asked is asked already, whoever holds the shift now: -> hollow-askedfrom.ts.
- A8, addLeave names the first shift in the rota's order: -> hollow-leavelast.ts.
- A9, decideSwap checks the holder before whyNot: -> hollow-decideorder.ts.
- A10, the order of requestSwap's refusals: -> hollow-swaporder.ts.
- A11, the order of addLeave's refusals: -> hollow-leaveorder.ts.
- A12, the order of addShift's refusals: -> hollow-shiftorder.ts.
- A13, parseShift reads the id, day and role before the times: -> hollow-parseorder.ts.
- A14, parseShift takes a day in figures only: -> hollow-dayform.ts.
- A15, minutesOf takes one or two figures for the hours: -> hollow-hourdigits.ts.
- A16, person gives the rota's own record: -> hollow-personcopy.ts.
- A17, coverNeeds gives the shared table: -> hollow-needscopy.ts.
- A18, addShift takes part of a minute and toLines writes it: -> hollow-wholeminute.ts.
- A19, clockOf keeps part of a minute: -> hollow-clockround.ts.

PE1:
- New check case "changes nothing in the rota when its shifts are on several days". PE1 adv-1 -> hollow-sortbyday.ts.
- where.md now says that the `sortShifts(this.shifts)` form fails the check. Only sortShifts's body says it sorts in place, so a failure of that form in the outline arm is the arm's (findings B, F2). where.md also names the new wrong files.

PE2:
- New check case "refuses a pending request that an earlier holder of the shift asked". PE2 adv-1 -> hollow-sameasker.ts.
- where.md has a new paragraph on the wrapper route: from the outline alone it passes the whole check, so an outline-1 pass on PE2 must be read before it is counted (findings C, F3).

PE3:
- New check case "Rota.costOn, with the Sunday allowance". It stands where the skipped helper case was. PE3 adv-2 -> hollow-costown.ts.
- I added days before day 0 to the check: -1 and -8 to SUNDAYS, and -2, -6, -7 and -9 to OTHER_DAYS. PE3 adv-1 (`% 7`) -> hollow-modulo.ts. The finding left this choice open. I decided days before day 0 count, because the module takes them, weekdayOf goes on the same way before day 0, and the helper case PE3 skips uses day -1.
- where.md: `% 7 === 6` is wrong before day 0. Monday 0, Sunday 6 is a common numbering, so a region pass may be a lucky guess (findings D, F4). The new wrong files are named.

Five near-miss files that were not breaches keep their names: PE1 adv-2 and adv-9, PE2 adv-3, and PE3 adv-6 and adv-9.

How the mends were tested:
- Each renamed file is the adversary's, byte for byte. Each passed the checks as I found them and now fails at the case written for it.
- Nine right answers written other ways all pass. Among them are the PE2 wrapper, `(day+1)%7===0` and `weekStart`. They are in SCRATCH/mend-rota/right.
- I reran the adversary's 322 one-token changes against `unchanged`. 316 fail, against 313 before. The six that pass are the six no caller can tell from the module.
- `tsc --strict` passes on the module, on each reference, and on the helper with each task's check.

## tsc_last_line

(no output; exit 0)

## holds_check_last_line

all as they must be

## check_tasks_last_line

window: none; all as they must be

## left_alone

- PE2's kind is the one finding where I did not make the change the brief asks for, so the run's author should decide on it. The finding is true: a wrapper that keeps the old decideSwap body under a new name passes the whole check from the outline alone. I did not change the task, and wrote the route into where.md instead (the adversary's second option). The route is open in any inside change that can be made after the old body returns. I found no small change to this ask that a wrapper or a guard cannot also make. Closing it means picking another thing for the task to turn on, one in the middle of a body, and that choice touches all sixteen inside tasks. The fuel, pumpout and tides menders judged the same. The run's note (bench/runs/2026-11-20-patch/README.md) says outline-1 holds tasks where an outline cannot be enough; for PE2 that is not true. The note is outside W, so I did not edit it.
- PE1's region is nearly the whole file (15,777 bytes against 18,488) because the ask puts `Rota` in a code span. The finding gives this as a note and asks for no change. The 27B's region arm is not sent beside tasks; the ceiling's region result on PE1 should be read with this in mind.
- PE3's wrapper: the finding itself says it still needs the fact, so the kind stands.
- PE3's Sunday 6 being one of two common numberings: I added a where.md line only. The natural guess for TypeScript, getDay's Sunday 0, is wrong, as WRITER.md requires. Making every guess wrong would mean renumbering the module and redoing every plain, reference and hollow file.
- The six one-token changes no caller can tell from the module: findLast for find at lines 228, 305 and 382; findLastIndex at 287; and `< 0` to `<= 0` or `< 1` at 329. Each finds something that can only be there once, or turns a tie byStart never produces, so no case can pin it.
- A16 to A19, which the adversary called weak, I did not judge wrong; each got a case. Each difference is one a caller can reach: changing the record person gives changes costOn, changing the table coverNeeds gives changes coverGaps, and addShift takes 420.5, which toLines writes as 07:00.5.
- The module: nothing broken and nothing that changes from run to run. The three oddities the adversary named are not faults and no task turns on them. One of them, load not trimming before testing for #, is now pinned in the helper.

# Changes to `rota` and its three tasks, after the adversary's findings

The findings are the adversary's, in `/home/build/patch/rota/findings.md`. A breach is named by its task and the file the adversary filed it as, "PEn adv-k" for `tasks/PEn/hollow-adv-k.ts`. The name after the arrow is what that file is called now. "A n" is item n of the findings' section A, the regression helper.

The mender before me left no line here, and nothing in W had changed when I began on 2026-11-22. Every file in W was dated 2026-11-20. `check-tasks` ended `window: none; 60 WRONG`, and every WRONG line was an adversary file. `holds.py check` ended `all as they must be`. I kept a copy of W as I found it, in `SCRATCH/mend-rota/before` (a scratch folder that may be cleared).

**Another mender took over here** (Claude Opus 5.5, 2026-11-22). One line for each change, with the finding it answers.

The module `files/rota.ts` did not change. No ask changed. No `plain.ts`, `reference.ts`, `reference.edits.md` or `other.ts` changed, and no text under `holds/` changed.

## `checks/helpers-rota.ts`: 20 cases added to `unchanged`, from 126 to 146

The adversary filed each one-function change once in each task, so each name below holds three files. They are PE1 / PE2 / PE3.

- "Rota.whyNot names the first clash in the rota's own order, the order the shifts came in", and "Rota.whyNot names the first short rest in the rota's own order, the order the shifts came in". A 1: PE2 adv-10 → `hollow-clashorder.ts`, PE3 adv-14 → `hollow-clashorder.ts`. PE1 adv-9 is the same file. It was not a breach in PE1, so it keeps its name, and it fails five cases now where it failed one.
- "Rota.toLines leaves the rota's own order of shifts as it was". A 2: adv-10 / 11 / 15 → `hollow-linessort.ts`. It also fails the module's line 477 with `this.shifts` for `[...this.shifts]`, one of the three real survivors of the adversary's screen.
- "Rota.load passes over a # line only when # is the line's first character". A 3: adv-11 / 12 / 16 → `hollow-hashtrim.ts`.
- "Rota.load keeps the shifts it read before a line it refuses". A 4: adv-12 / 13 / 17 → `hollow-loadall.ts`.
- "Rota.moveShift does not check the day or the times either". A 5: adv-8 / 9 / 13 → `hollow-movetimes.ts`.
- "Rota.lapseSwaps goes by the notice alone, whether or not anybody holds the shift now". A 6: adv-19 / 20 / 24 → `hollow-lapseopen.ts`.
- "Rota.requestSwap: a person asked is asked already, whoever holds the shift now". A 7: adv-23 / 24 / 28 → `hollow-askedfrom.ts`.
- "Rota.addLeave names the first shift in the rota's own order that falls in the leave". A 8: adv-21 / 22 / 26 → `hollow-leavelast.ts`. It also fails line 260 with `findLast`, another of the screen's three real survivors.
- "Rota.decideSwap asks whether the asker still holds the shift before it asks about the other person". A 9: adv-18 / 19 / 23 → `hollow-decideorder.ts`. It throws before PE2's sweep, so PE2's reference passes it and PE2 does not skip it.
- "Rota.requestSwap refuses an open shift, the holder, a stranger, too soon, asked twice, in that order". A 10: adv-16 / 17 / 21 → `hollow-swaporder.ts`.
- "Rota.addLeave asks who the person is, then about the days, then about the shifts". A 11: adv-15 / 16 / 20 → `hollow-leaveorder.ts`.
- "Rota.addShift asks for a whole day, then for the times, then about the person". A 12: adv-22 / 23 / 27 → `hollow-shiftorder.ts`.
- "parseShift looks at the id, the day and the role before it reads the times". A 13: adv-7 / 8 / 12 → `hollow-parseorder.ts`.
- "parseShift takes a day written in figures alone, with a minus sign before them if it has one". A 14: adv-6 / 7 / 11 → `hollow-dayform.ts`.
- "minutesOf takes one or two figures for the hours, and no more". A 15: adv-5 / 6 / 10 → `hollow-hourdigits.ts`. It also fails line 121 with `\d{1,3}`, the third real survivor.
- "Rota.person gives the rota's own record, so a change to it is a change to the rota". A 16: adv-13 / 14 / 18 → `hollow-personcopy.ts`. It goes through `costOn` on day 16, a Wednesday, so PE3's allowance does not touch it.
- "coverNeeds gives the one table that each kind of day shares". A 17: adv-14 / 15 / 19 → `hollow-needscopy.ts`.
- "Rota.addShift takes a time with a part of a minute, and the file writes it so". A 18: adv-17 / 18 / 22 → `hollow-wholeminute.ts`. It also writes the shift out with `toLines`, so it fails A 19 as well.
- "clockOf keeps a part of a minute as it is". A 19: adv-20 / 21 / 25 → `hollow-clockround.ts`.

## PE1 (beside)

- `check.test.ts`, new case "changes nothing in the rota when its shifts are on several days". Its two clashing shifts are on days 17 and 16, and the day 17 shift came first, so a sort of the rota's own list by `day` alone turns them round. PE1 adv-1 → `hollow-sortbyday.ts`.
- `where.md`: the `sortShifts(this.shifts)` form. It fails the check, and only `sortShifts`'s body says that it sorts in place, so a failure of that form in the `outline` arm is the arm's. It failed one case before and fails two now. Answers B's "Its kind" and F 2.
- `where.md`: the in-place sort is now caught by two cases, and the new regression files are named.
- `hollow-adv-2.ts` and `hollow-adv-9.ts` keep their names. Neither was a breach in PE1. `hollow-adv-2.ts` failed one case and fails two now.

## PE2 (inside)

- `check.test.ts`, new case "refuses a pending request that an earlier holder of the shift asked": Ada asks Bram, the shift is given to Dov, Dov asks Eli, and approving Dov's request refuses Ada's. The ask says "every other request for the same shift that is still pending". PE2 adv-1 → `hollow-sameasker.ts`.
- `where.md`: a new paragraph, "An answer from the outline alone that passes". It describes the wrapper route, says it passes the whole check, and says that an `outline-1` pass on this task must be read before it is counted. Answers C's "Its kind" and F 3, by its second way. The task is kept as it is; see "Left as it was".
- `where.md`: the new wrong answers, `hollow-sameasker.ts`, `hollow-adv-3.ts` and `hollow-decideorder.ts`, and the new regression files.
- `hollow-adv-3.ts` keeps its name. It was not a breach. It failed one case and still fails that one.

## PE3 (leans)

- `check.test.ts`, new case "Rota.costOn, with the Sunday allowance": a Sunday's cost holds each held shift's allowance, and a Monday's does not. It stands where the helper case "Rota.costOn of a Sunday is worked out as for any other day" is skipped. PE3 adv-2 → `hollow-costown.ts`. An answer that changes only `shiftPayPence` always passes it.
- `check.test.ts`: days -1 and -8 added to `SUNDAYS`, and -2, -6, -7 and -9 to `OTHER_DAYS`. PE3 adv-1 → `hollow-modulo.ts` (`shift.day % 7 === 6`). I decided that days before day 0 count. The module takes them (`parseShift` reads `-2`, `addShift(-3, ...)` is a case in the helper), `weekdayOf` goes on the same way before day 0, and the helper's case on `shiftPayPence` that PE3 skips used day -1 itself. Day -1 is a Sunday, and "a shift that starts on a Sunday" covers it. `weekdayOf(shift.day) === 6` and `(shift.day + 1) % 7 === 0` both pass.
- `where.md`: the fact now says that `% 7 === 6` is wrong before day 0. A new paragraph, "A right guess", says that Monday 0 and Sunday 6 is a common numbering, so a `region` pass may be a lucky guess and must be read for why it took 6. Answers D's "One doubt" and F 4.
- `where.md`: the skipped `costOn` case and what now stands in its place; the new wrong answers, `hollow-costown.ts`, `hollow-adv-6.ts` and `hollow-adv-9.ts`, and the new regression files.
- `hollow-adv-6.ts` and `hollow-adv-9.ts` keep their names. Neither was a breach. `hollow-adv-6.ts` failed one case and fails two now; `hollow-adv-9.ts` still fails its one.

## How I tried the mends

- Each renamed file is the adversary's, byte for byte. Each one passed the checks in the copy of W as I found it, and fails now at the case written for it, at an assertion.
- Nine right answers written other ways, from the module and not from the references, pass their checks. PE1: through `shiftsFor(OPEN)`; `sortShifts` on a new array of copies; day by day through `shiftsOn`. PE2: the adversary's wrapper; a sweep with `filter` after the status is set. PE3: `(shift.day + 1) % 7 === 0`; `((shift.day % 7) + 7) % 7 === 6` with the allowance added before the rounding; `weekdayOf` with `+=`; `shift.day - weekStart(shift.day) === 6`. They are in `SCRATCH/mend-rota/right`, outside W.
- I ran the adversary's screen again (its `mutate.py`, my copy): 322 one-token changes to the module, against `unchanged(mod, [])`. 316 fail now, where 313 failed before. The six that pass are the six the findings call ones no caller can tell from the module.
- `tsc --strict` passes on the module, on each reference, and on the helper with each task's check (PE1's on its reference).

## Left as it was

- **PE2, its kind.** The finding is true: a wrapper that keeps the old body under a new name passes the whole check from the outline alone. I did not change the task. The route is open in any `inside` change that can be made after the old body returns. A sweep through `this.swaps` uses only the returned request and a field the outline shows, and a wrapper can also call the old body on inputs of its own. I found no small change to this ask that a wrapper cannot do: refusing in place of a throw, a new test before an old one, and new words for a refusal can each be made by a guard or a wrapper. To close the route, the task would need to turn on another change, one that alters a step in the middle of a body. That choice touches every `inside` task in the set, so it is the run's author's to make. The menders of `fuel`, `pumpout` and `tides` judged the same for their sets. Written in place, the change needs the body. The run's note (`bench/runs/2026-11-20-patch/README.md`) says `outline-1` holds the tasks where an outline cannot be enough. For PE2 that is not so. The note is outside W, so I did not change it; the run's author should.
- **PE1's region is nearly the whole file** (15,777 bytes against 18,488), because the ask puts `Rota` in a code span. The finding gives this as a note and asks for no mend. The 27B's `region` arm is not sent `beside` tasks. The ceiling's `region` on PE1 will hold nearly what `whole` holds, and should be read so.
- **PE3, the wrapper.** The finding says it still needs the fact, so the task is still of its kind. Nothing to mend.
- **PE3, Sunday as 6 is one of two common guesses.** I added a paragraph to `where.md`, as F 4 asks, and changed nothing else. For a reader of TypeScript the natural guess is `getDay`'s Sunday 0, and it is wrong, as `WRITER.md` asks. To make every guess wrong, the module would have to number its days some other way, and every `plain.ts`, reference and hollow answer would have to be done again.
- **The six one-token changes no caller can tell from the module** (`findLast` for `find` at lines 228, 305 and 382, `findLastIndex` at 287, and `< 0` to `<= 0` or `< 1` at 329). Each finds a thing that can be there only once, or turns a tie that `byStart` never gives. There is nothing a case could pin.
- **A 16 to A 19, which the findings call weak.** I added a case for each, above, and judged none wrong. Each differs from the module in a way a caller can see: a change to the record `person` gives changes `costOn`, a change to the table `coverNeeds` gives changes `coverGaps`, and `addShift` takes 420.5, which `toLines` then writes as `07:00.5`. No right answer to any of the three asks touches them.
- **The module.** The findings find nothing broken and nothing that changes from run to run. The three things they name (`lapseSwaps` and `decideSwap` guard against a removed shift that cannot be there, `load` trims for a blank line and not for `#`, an end of 1440 is written as 00:00) are not faults, and no task turns on them. The second is now pinned in `unchanged`.

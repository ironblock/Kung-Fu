# PE1, beside: `Rota.openShifts`

**The right change.** One new method on the `Rota` class, anywhere among its members. It filters the class's
`shifts` array (a private field the outline shows) to the shifts whose `staffId` is `OPEN`, whose `day` is at
least `fromDay` and less than `toDay`, and, when `role` is given, whose `role` is that role. It sorts the result by
`day` and then by `start`. The reference puts it before `shiftsFor`, at line 312, and adds six lines.

**What it needs from the file.** Only what the outline shows: the field `private shifts: Shift[] = []`, the
`Shift` members `staffId`, `day`, `start` and `role`, the type `Role`, and `export const OPEN = "";`. The ask
says the rest: which end of the run of days counts, what marks an open shift, and the order.

**Other right answers.** Calling `this.shiftsOn(day)` for each day of the run, or `this.shiftsFor(OPEN)`, and then
filtering and sorting, is right too. So is returning copies of the shifts. The check compares what the shifts hold
and does not ask for the rota's own objects.

**What a wrong answer is likely to do.**

- Count `toDay` (`<=`). `hollow-ends.ts`.
- Leave the result in the order of the `shifts` array, which is the order the shifts were made in and not the
  order of their days. `hollow-order.ts`. A reader who cannot see `addShift`'s body may take the array to be kept
  in order.
- Use `sortShifts` on the shifts it has picked out. That is not a fault: it sorts by the minute a shift starts,
  which is the order the ask wants.
- Sort the class's own `shifts` array in place (`this.shifts.sort(...)` before filtering). The check's last two
  cases catch this through `whyNot`, which names the first clashing shift in the array's order. The last one has
  its two clashing shifts on two days, so a sort by `day` alone is caught too: `hollow-sortbyday.ts`.
  `hollow-adv-2.ts` sorts by day and start, and fails both.
- Call `sortShifts(this.shifts)` and filter what it gives back. `sortShifts` sorts the array it is given in place,
  and only the comment in its body says so: its first line, `sortShifts(shifts: Shift[]): Shift[]`, may as well
  give a new array. So this form fails the same two cases. A reader of the outline cannot know the fact, so a
  failure of this form in the `outline` arm is the arm's. A reader who sorts only what it has picked out, as the
  ask's "must change nothing in the rota" suggests, never meets the question. In `whole` it is the subject's.
- Treat a missing holder as `null` or `undefined`. The ask says it is `OPEN`, and the outline shows `OPEN` is `""`.
- Quote a line of the file that the outline does not show in order to place the method, and have the edit
  refused. An edit with an empty SEARCH would put the method after the class's closing brace, where it does not
  parse: a reader with the outline must quote a member's first line.
- Write the whole file anew from the outline. `hollow-lost.ts` stands for that: the new method is right and
  `paidMinutes` takes the break off a shift of exactly six hours. The check fails it through `unchanged`. So it
  fails each of these, in which the new method is right and one other thing differs from the module:
  `hollow-askedfrom.ts`, `hollow-clockround.ts`, `hollow-dayform.ts`, `hollow-decideorder.ts`,
  `hollow-hashtrim.ts`, `hollow-hourdigits.ts`, `hollow-lapseopen.ts`, `hollow-leavelast.ts`,
  `hollow-leaveorder.ts`, `hollow-linessort.ts`, `hollow-loadall.ts`, `hollow-movetimes.ts`,
  `hollow-needscopy.ts`, `hollow-parseorder.ts`, `hollow-personcopy.ts`, `hollow-shiftorder.ts`,
  `hollow-swaporder.ts`, `hollow-wholeminute.ts`, and `hollow-adv-9.ts` (`whyNot` through `shiftsFor`).

# PE3, leans: `shiftPayPence`

**The right change.** In `shiftPayPence` (lines 173 to 175), add 1,250 pence to the rounded pay when the shift's
`day` is a Sunday. The reference replaces the one `return` line with three lines.

**The other declaration.** `weekdayOf`, at lines 136 to 139:

```ts
export function weekdayOf(day: number): number {
    // Day 0 was a Monday, so 0 is Monday and 6 is Sunday.
    return ((day % 7) + 7) % 7;
}
```

**The fact.** Weekdays are numbered from Monday. A Sunday is 6, and day 0 of the books was a Monday. So the test
is `weekdayOf(shift.day) === 6`. The module takes days before day 0, and `weekdayOf` goes on the same way there,
so day -1 is a Sunday. `shift.day % 7 === 6` is wrong for it, since `-1 % 7` is `-1`: `hollow-modulo.ts`, which
the check fails on days -1 and -8. `(shift.day + 1) % 7 === 0` is right for every day.

**The lines that show it.** The comment at line 137, inside `weekdayOf`. The table at lines 97 to 106 shows it a
second time: `// One list for each weekday, as weekdayOf numbers them.`, with `// Monday` on the first entry and
`// Sunday` on the seventh.

**What does not show it.** The first line, `export function weekdayOf(day: number): number {`, says only that a
day number gives a number. Nothing in the outline numbers the weekdays: the table's first line is
`COVER: CoverNeed[][] = [`, and no constant names a weekday. `shiftPayPence`'s own lines do not mention a day.

**The natural wrong guess.** That Sunday is 0, as `Date.prototype.getDay` has it: `weekdayOf(shift.day) === 0`.
That pays the allowance on Mondays and not on Sundays. `hollow-guess.ts` is the reference with that test.

**A right guess.** Monday 0 and Sunday 6 is also a common numbering: it is what Python's `weekday()` gives. A
reader who holds only `weekdayOf`'s first line, and guesses that numbering, writes `=== 6` and passes without the
fact. So a pass in `region` or `outline-1` may be a lucky guess. Read what the answer says about why it took 6
before it is counted as knowing the fact. This bears on question 4.

**Why a careful reader sees the other declaration matters.** The ask speaks of a shift that starts on a Sunday,
a shift's day is a number, and the outline shows one function that turns a day into a weekday.

**What else a wrong answer is likely to do.**

- Give the allowance to any shift that touches a Sunday, so that a Saturday night shift gets it.
  `hollow-touch.ts`.
- Work out the weekday from the day number with its own rule, such as `(shift.day + 1) % 7 === 0` or
  `shift.day % 7 === 0`. Whether that is right depends on the same fact.
- Scale the allowance by the hours or the rate. The ask says it is flat, and the check has a rate of 0.
- Take the weekend for Sunday, `weekdayOf(shift.day) % 6 === 0`: `hollow-adv-6.ts`. Give no allowance to a shift
  that pays nothing: `hollow-adv-9.ts`.
- Leave `shiftPayPence` right and change `costOn`, so that it works the pay out itself and a Sunday's cost holds
  no allowance: `hollow-costown.ts`. The check's case on `costOn` catches it.
- `hollow-lost.ts` is the reference with `whyNot` refusing a rest of exactly eleven hours. The check fails it
  through `unchanged`. So it fails each of the files that are right on `shiftPayPence` and differ from the module
  in one other thing: `hollow-askedfrom.ts`, `hollow-clashorder.ts`, `hollow-clockround.ts`, `hollow-dayform.ts`,
  `hollow-decideorder.ts`, `hollow-hashtrim.ts`, `hollow-hourdigits.ts`, `hollow-lapseopen.ts`,
  `hollow-leavelast.ts`, `hollow-leaveorder.ts`, `hollow-linessort.ts`, `hollow-loadall.ts`,
  `hollow-movetimes.ts`, `hollow-needscopy.ts`, `hollow-parseorder.ts`, `hollow-personcopy.ts`,
  `hollow-shiftorder.ts`, `hollow-swaporder.ts` and `hollow-wholeminute.ts`.

**The cases `unchanged` skips.** "shiftPayPence pays the same whatever day the shift is on" and "Rota.costOn of a
Sunday is worked out as for any other day". The second is skipped because `costOn` adds up `shiftPayPence`, so a
right change must alter it. In its place the check has "Rota.costOn, with the Sunday allowance": a Sunday's cost
holds each held shift's allowance, and a Monday's does not. The ask does not speak of `costOn`, but it does not
ask for `costOn` to change, and `costOn` adds up `shiftPayPence`: an answer that changes only `shiftPayPence`
always passes that case.

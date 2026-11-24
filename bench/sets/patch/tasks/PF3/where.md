# PF3, leans: `lateBy`, which must agree with `weekOf`

**The right change.** In `lateBy` (lines 262 to 268 of the file, with its comment on line 261), the line that returns, 267. The lateness becomes the number of yard weeks between the week of the due day and the week of the day measured on:

```ts
    return Math.max(0, (weekOf(at) - weekOf(job.dueDay)) / 7);
```

Nothing else changes: `at` is still the closing day when the job has closed, and the first `if` still gives 0 with no due day and for a dropped job.

**The other declaration.** `weekOf`, line 153: `export function weekOf(day: number): number {`.

**The fact.** `weekOf` does not give a week's index. It gives the day number of the Saturday that begins the yard week holding `day`. So two weeks next to each other differ by 7, not by 1. And the yard week begins on a Saturday, while day 0 was a Monday.

**The lines that show it.** Lines 151 to 156: the comment directly above `weekOf` ("The yard's week runs Saturday to Friday ... Day 0 was a Monday. A week is known by the day number of its Saturday, and that is what this gives") and its two-line body, `day - sinceSaturday`. It is shown again where `weekOf` is used: `summariseWeek` takes `start = weekOf(day)` and `end = start + 7` (lines 342 and 343), and `WorkLog.weekly` steps `week += 7` (line 491).

**What the first line leaves open.** `weekOf(day: number): number` reads as well for a week's index as for a day. The outline's `WeekSummary.week: number` (line 61) does not settle it.

**The natural wrong guess.** That `weekOf` gives a week's index, so that the weeks late are `weekOf(at) - weekOf(job.dueDay)`. That is `hollow-guess.ts`. It gives 7 where the answer is 1, and every case with a late job fails.

**Other wrong answers that are likely.**

- Work the week out again without `weekOf`, as `Math.floor(day / 7)` (`hollow-monday.ts`). That is a week from Monday. With the due day on day 20 it puts the turn between days 20 and 21, so it fails "is 0 on every day of the yard week" on days 21 to 25, and the cases on the turn between Friday and Saturday.
- Count sevens of days, `Math.floor((at - job.dueDay) / 7)` (`hollow-sevens.ts`). It is right only when the due day is a Saturday.
- Work the yard week out again with `Math.trunc((day + 2) / 7)` (`hollow-trunc.ts`). It agrees with `weekOf` from day -2 on and not before, so "counts the yard weeks the same way on days before day 0" fails. The same with `Math.floor` agrees with `weekOf` on every day and passes: the ask's "I do not want a second idea of what a week is" is not something a check of behaviour can see.
- Divide by 7 and round, or keep a fraction. "Gives a whole number" and the turn-over cases fail.
- Measure a closed job on the day asked. "Measures a closed job on the day it closed" fails.
- Quote the body from a guess, so that the patch does not apply.
- Write the function or the file anew. `unchanged` then fails where the guess differs, as it does for `hollow-lost.ts`, where `sortJobs` puts a job with no due day first. Five more hollow answers each change one more function and fail through `unchanged`: `WorkLog.escalate` raises a done job (`hollow-escalatedone.ts`), `boatsOf` sorts with `localeCompare` (`hollow-locale.ts`), `addTime` takes two names as one fitter when they differ only in spaces or case (`hollow-samefitter.ts`), a drop sets the closing day (`hollow-dropday.ts`), and `WorkLog.move` refuses a blank name (`hollow-blankby.ts`).

An answer that is right by another road passes: `weekOf(at) === weekOf(job.dueDay + 7 * n)` in a loop, or a division by `weekOf(7) - weekOf(0)`, needs no knowledge of the fact. I think neither is likely.

Added by the mender on 2026-11-22:

- **A right answer may give -0 for a job that is not late,** for instance `Math.ceil((weekOf(at) - job.dueDay) / 7)` with values below 0 made 0 by a test and not by `Math.max`. The check, and the two `lateBy` cases of `unchanged` that it keeps, add 0 to each result before they compare it, so -0 passes as 0.
- **The case on days before day 0** uses due days -3 and -10. Day -1 is `NO_DAY`, so it cannot be a due day. `weekOf` is pinned for days below 0 in `unchanged`, so such days are within what the module does.
- **The fact has two outcomes, and only one of them is the natural wrong guess.** A reader who guesses that `weekOf` gives a week's index writes `hollow-guess.ts`. A reader who guesses that it gives the day number of the week's first day divides by 7 and is right, by luck as much as by reading. `summariseWeek(jobs, day)` and `weekly(fromDay, toDay)` take days, which may lead a reader to that guess. So a pass in `region` does not show that the reader knew the fact. Read what the pass says about `weekOf` before counting it as knowing.

**The two cases of `unchanged` the change alters,** and the check skips: "lateBy: an open job is late by the days since its due day" and "lateBy: a job closed late is late by the days to its closing, not to the day asked".

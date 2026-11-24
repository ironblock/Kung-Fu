ADVERSARY REPORT: module `rota`, W = /home/build/patch/rota/set, tasks PE1 (beside), PE2 (inside), PE3 (leans)

STATE I LEAVE
- `python3 bench/box.py check-tasks W --window none` ends `window: none; 60 WRONG`. All 60 are `WRONG <id> hollow-adv-<n> passed` lines: PE1 19, PE2 20, PE3 21. They are 23 different wrong answers: 4 about an ask, and 19 that change one other function (the same 19 are in each task, since the regression helper is shared).
- Every reference passes; every plain and every writer's hollow fails; all three `other.ts` pass. So `others_failed` is 0.
- `python3 bench/holds.py check W` ends `all as they must be`.
- I changed none of the writer's files. I added only `tasks/<id>/other.ts` and `tasks/<id>/hollow-adv-<n>.ts`. Each hollow-adv file is my `other.ts` for that task with one change. Numbers have gaps where I deleted answers the check failed.
- My scripts are outside W, in SCRATCH/adv-rota (gen.py, attacks.py, mutate.py, probe.mts, one.py). Nothing below depends on them.

In the inputs below, `crew` is the helper's four people (ada hand+lock, bram hand+fitter, cleo office, dov all four), and T0 = 14*1440.

==== A. THE REGRESSION HELPER (checks/helpers-rota.ts), the same for all three tasks ====

It is strong against small slips. I made 322 one-token changes to files/rota.ts from line 66 on (an end of a range moved, `===`/`!==`, `&&`/`||`, `+`/`-`, each number plus one, `Math.round` to floor and to ceil, `unshift` to `push`, `.reverse()` dropped, a statement deleted, and so on) and ran `unchanged(mod, [])` on each. It failed 313. Of the 9 that passed, 6 cannot be told from the module by any input a caller can reach (`findLast` for `find` at lines 228, 305, 382, `findLastIndex` at 287, and `< 0` to `<= 0` or `< 1` at 329). 3 are real: line 121 `\d{1,2}` to `\d{1,3}`, line 260 `find` to `findLast`, line 477 `[...this.shifts]` to `this.shifts`. A file written anew from the outline would not pass it.

What it does not pin is the order of two refusals, a few inputs nobody tried, and the order of the rota's own list. The 19 changes below all pass `unchanged`. File numbers are PE1 / PE2 / PE3.

Plain differences on ordinary inputs:
1. hollow-adv-9 / 10 / 14, `Rota.whyNot`: goes through `this.shiftsFor(staffId)` (earliest first), not the rota's own order. Input: load `s1 17 12:00-16:00 hand ada`, `s2 17 08:00-13:00 hand ada`; `whyNot("ada", {id:"x1", staffId:"", day:17, start:750, end:765, role:"hand"})` is `"Ada is on s1 then"` in the module and `"Ada is on s2 then"` here. Breach in PE2 and PE3. PE1's check fails it (1 of 134 cases, `changes nothing in the rota`), only because that check happens to hold this very probe; kept in PE1 as one that came close.
2. hollow-adv-10 / 11 / 15, `Rota.toLines`: `sortShifts(this.shifts)` sorts the rota's own list in place. Same load as 1, then `toLines()`, then the same `whyNot`: s1 in the module, s2 here. No helper case looks at the list's order after `toLines`.
3. hollow-adv-11 / 12 / 16, `Rota.load`: `line.trim().startsWith("#")`. `load(["  # week of day 14", "s1 17 07:00-15:30 hand ada"])` throws `not a shift:   # week of day 14` in the module and gives 1 here.
4. hollow-adv-12 / 13 / 17, `Rota.load`: keeps nothing when a later line is refused. `load(["s1 17 07:00-15:30 hand ada", "s2 18 07:00-15:30 hand zed"])` throws in both; afterwards the module has s1 and the next `addShift` is `s2`, here the rota is empty and the next is `s1`.
5. hollow-adv-8 / 9 / 13, `Rota.moveShift`: checks the times as `addShift` does. `moveShift("s1", 16, 1440, 60)` moves the shift in the module and throws `a shift's times are minutes of one day` here. The helper's case `Rota.moveShift checks no rule...` tries only an overlap and a leave.
6. hollow-adv-19 / 20 / 24, `Rota.lapseSwaps`: also refuses a pending request whose shift nobody holds. `addShift(18,420,900,"hand","ada")`, `requestSwap("s1","bram",T0)`, `release("s1")`, `lapseSwaps(T0+1)`: 0 in the module, 1 here.
7. hollow-adv-23 / 24 / 28, `Rota.requestSwap`: the asked-already test also compares `fromStaffId`. `requestSwap("s1","bram",T0)` by ada, `assign("s1","dov")`, `requestSwap("s1","bram",T0+1)`: the module throws `bram has been asked about s1 already`, here it makes `w2`.
8. hollow-adv-21 / 22 / 26, `Rota.addLeave`: names the last shift held in the leave's days. ada holds s1 on day 16 and s2 on day 18; `addLeave("ada",15,19)` says `ada holds s1 in that time` in the module and `...s2...` here.

The order of two refusals when both hold (each case in the helper has one fault at a time):
9. hollow-adv-18 / 19 / 23, `Rota.decideSwap`: `whyNot` asked before the holder. Request to cleo, then `assign("s1","dov")`, approve: `ada no longer holds s1` in the module, `Cleo does not work as hand` here. PE2's own check does not pin this either.
10. hollow-adv-16 / 17 / 21, `Rota.requestSwap`: notice before the person. `requestSwap("s1","zed",17*1440)` for a shift on day 18 at 07:00: `nobody is called zed` in the module, `s1 is too soon to swap` here.
11. hollow-adv-15 / 16 / 20, `Rota.addLeave`: days before the person. `addLeave("zed",20,19)`: `nobody is called zed` against `leave ends before it starts`.
12. hollow-adv-22 / 23 / 27, `Rota.addShift`: times before the day. `addShift(16.5,1440,60,"hand")`: `a shift is on a whole day` against `a shift's times are minutes of one day`.
13. hollow-adv-7 / 8 / 12, `parseShift`: reads the times before it looks at the role. `"s4 12 07:00-25:00 cook ada"`: `not a shift: ...` against `not a time: 25:00`.

Inputs nobody tried:
14. hollow-adv-6 / 7 / 11, `parseShift`: `Number.isInteger(day)` in place of `/^-?\d+$/`. `"s4 1e1 07:00-15:30 hand ada"` throws in the module and gives day 10 here (also `0x10`, `+5`, `5.0`).
15. hollow-adv-5 / 6 / 10, `minutesOf`: `(\d+)` for the hours. `"007:30"` throws in the module and gives 450 here.

Weak, by identity or by an input no caller gives. I kept them because they pass; the mender may judge them not worth a case:
16. hollow-adv-13 / 14 / 18, `Rota.person` gives a copy. `person("ada").ratePence = 2000` then `costOn` of a day ada works 07:00-13:00: 12000 in the module, 7560 here.
17. hollow-adv-14 / 15 / 19, `coverNeeds` gives copies of the rows: `coverNeeds(14) === coverNeeds(15)` is true in the module, false here.
18. hollow-adv-17 / 18 / 22, `Rota.addShift` refuses a time that is not a whole minute: `addShift(16, 420.5, 900, "hand")`.
19. hollow-adv-20 / 21 / 25, `clockOf(90.5)`: `"01:30.5"` in the module, `"01:31"` here.

==== B. PE1, beside: `Rota.openShifts` ====

Breach about the ask (1):
- hollow-adv-1: before filtering it runs `this.shifts.sort((a, b) => a.day - b.day)` on the rota's own list, so it breaks the ask's "The method must change nothing in the rota." The check sees an in-place sort only through these lines:
  `other.load(["s1 17 12:00-16:00 hand ada", "s2 17 08:00-13:00 hand ada", "s3 18 09:00-10:00 hand -"]);` ... `expect(other.whyNot("ada", asked)).toBe("Ada is on s1 then");`
  Both clashing shifts are on day 17, so a sort by day alone does not turn them round. Input that shows it: load `s1 17 01:00-05:00 hand ada`, `s2 16 22:00-03:00 hand ada`, call `openShifts(0,100)`, then `whyNot("ada", {id:"x1", staffId:"", day:17, start:120, end:150, role:"hand"})`: s1 with the reference, s2 here. It is an unlikely answer; the likely form is caught (next line).
- Came close, kept: hollow-adv-2 (the rota's own list sorted in place by day and start) fails 1 of 134 cases, `Rota.openShifts changes nothing in the rota`.
- Tried and failed, deleted: `toDay` taken as a number of days; a night shift counted for the day it ends on.
- Plus the 18 one-function changes of section A (all but number 1).

`other.ts`: passed. Written before I read the reference: a `for` loop with `continue`, placed before `whyNot`, sorting a new array by day then start.

Is the check fair? Yes. It has no two open shifts that start together on one day, so it does not test an order the ask leaves open. It compares what the shifts hold, not which objects they are.

Its kind:
- A right answer needs only the ask and the outline: `private shifts: Shift[] = []` (line 240), the members of `Shift`, `Role`, `export const OPEN = "";`. Every outline line from line 66 on is in the file exactly once, so any member's first line can be quoted to place the method.
- Two things an outline reader may lean on are only in bodies or comments, and one of them is a trap:
  - `sortShifts` sorts its argument in place (the comment `// In place, earliest first.` inside it), and what it sorts by is in `byStart`. I ran three forms: `sortShifts(this.shifts).filter(...)` fails 1 of 134 (`changes nothing in the rota`); `sortShifts(this.shifts.filter(...))` passes; `this.shiftsFor(OPEN).filter(...)` passes. The first two differ by a fact the outline does not show. A failure of that first form in the `outline` arm is the arm's, not the subject's. where.md lists `this.shifts.sort(...)` but not this form.
  - That the rota's list is not kept in day order (`addShift` and `load` push). The ask asks for the order, so a careful reader sorts anyway.
- A note on the held texts: the ask puts `Rota` and `OPEN` in code spans, so PE1's region.md is lines 66 and 238 to 503: 15,777 bytes against 18,488 for the whole file. The 27B's `region` arm is not sent `beside` tasks, but the ceiling sends every arm every task, and there PE1's `region` is nearly `whole`.

==== C. PE2, inside: `Rota.decideSwap` ====

Breach about the ask (1):
- hollow-adv-1: the sweep also requires `other.fromStaffId === swap.fromStaffId`, so a pending request that an earlier holder asked stays pending. The ask says "every other request for the same shift that is still pending". No case of the check has a pending request for the shift from anyone but its present holder. Input: `addShift(18,420,900,"hand","ada")`; `requestSwap("s1","bram",T0)` (w1); `assign("s1","dov")`; `requestSwap("s1","ada",T0+1)` (w2); `decideSwap("w2",true,T0+9)`. Then `swapsFor("bram")` is `[["w1","refused",T0+9]]` with the reference and `[["w1","pending",-1]]` here.
- Came close, kept: hollow-adv-3 (the sweep takes every request for the shift that is not approved, so it restamps one refused before) fails 1 of 132 cases, `leaves the requests that were decided before as they were`.
- Tried and failed, deleted: only requests asked before the approved one; the others stamped with `askedAt`; the others dropped from the list.
- Plus all 19 of section A.

`other.ts`: passed. It sweeps in a second `if (approve)` after the status is set, with `continue`.

Is the check fair? Yes; every case is a clause of the ask.

Its kind: everything is in the ask and region.md (lines 381 to 395, with `private swaps: SwapRequest[] = []` and the members of `SwapRequest` in the outline). But the change CAN be written from the outline alone, without the body. This edit quotes only the outline's line 381, and its result passes PE2's check and `tsc --strict` (tried in a scratch copy of W, not left in W):

    <<<<<<< SEARCH
    decideSwap(swapId: string, approve: boolean, at: number): SwapRequest {
    =======
    decideSwap(swapId: string, approve: boolean, at: number): SwapRequest {
            const swap = this.decideOne(swapId, approve, at);
            if (approve) {
                for (const other of this.swaps) {
                    if (other.id !== swap.id && other.shiftId === swap.shiftId && other.status === "pending") {
                        other.status = "refused";
                        other.decidedAt = swap.decidedAt;
                    }
                }
            }
            return swap;
        }

        private decideOne(swapId: string, approve: boolean, at: number): SwapRequest {
    >>>>>>> REPLACE

The old method keeps its body under a new name and the new one wraps it. The ask's clause "When approving throws, as it can today, no request may change at all" is met for nothing, since the throw leaves before the sweep. So by the brief's own test PE2 is not an `inside` task: its change is something done after the old body, not a change within it. The run's note says `outline-1` has "the tasks where an outline cannot be enough". For PE2 that does not hold, and a pass there by this route would be earned, not luck.

==== D. PE3, leans: `shiftPayPence` ====

Breaches about the ask (2):
- hollow-adv-2: `shiftPayPence` is right, and `costOn` works the pay out itself (`Math.round((paidMinutes(shift) * person.ratePence) / 60)`), so a Sunday's cost holds no allowance. `crew`, `addShift(20,540,780,"hand","ada")`, `costOn(20)`: 6290 with the reference, 5040 here. The check skips `"Rota.costOn of a Sunday is worked out as for any other day"` and puts nothing in its place; where.md says "The check does not test `costOn` on a Sunday, since the ask does not speak of it." So what `costOn` does on a Sunday is pinned by nothing. A patch that edits only `shiftPayPence` always gets 6290, so a case for it would test nothing the ask does not imply.
- hollow-adv-1: Sunday tested as `shift.day % 7 !== 6`. Right from day 0 on; wrong before it. `weekdayOf(-1)` is 6, the reference pays 11330 for a 07:00-15:30 shift on day -1 at 1260, this pays 10080. The check has `const SUNDAYS = [6, 13, 20, 27, 699];` and no day before 0 in either list, and the one helper case with day -1 (`shiftPayPence pays the same whatever day the shift is on`) is skipped. This is a breach only if days before 0 count: where.md calls this form right "for a day that is not negative", and the ask does not speak of them. The module does take them (`parseShift` reads `-2`, the helper tests `weekdayOf` and `coverNeeds` before day 0). The mender should decide. If the days are added, an answer through `weekdayOf` is unaffected.
- The natural wrong guess, in six forms, all failed by the check and deleted except the two kept: `shift.day % 7 === 0`; `weekdayOf(...) === 7`; day 0 taken as 1 January 1970 with `getUTCDay() === 0`; `weekStart(day) === day`; the allowance by the day the shift ends on; and, kept as close, hollow-adv-6 (`weekdayOf(shift.day) % 6 === 0`, the weekend: fails 1 of 129, `pays a shift that starts on any other day what it paid before`) and hollow-adv-9 (no allowance on a shift that pays nothing: fails 1 of 129, `adds the same whatever the length and the rate`). The writer's `hollow-guess.ts` is `=== 0`.
- Plus all 19 of section A.

`other.ts`: passed. An early `return pay` unless `weekdayOf(shift.day)` is 6.

Is the check fair? Yes. "I want it added after the pay has been rounded" cannot be told from adding before, since 1,250 is a whole number; the check's case for it passes both, which is right.

Its kind:
- The ask does not give the fact away, and does not name `weekdayOf`.
- region.md does not show it: it is the outline and lines 173 to 175. Nothing in the outline numbers the weekdays or says what day 0 was.
- The other declaration's first line, `export function weekdayOf(day: number): number {`, does not show it.
- The whole file shows it plainly: line 137, `// Day 0 was a Monday, so 0 is Monday and 6 is Sunday.`, and the `// Monday` and `// Sunday` comments at lines 99 to 105.
- A careful reader of region.md would see that `weekdayOf` matters: the ask speaks of a Sunday, a shift's `day` is a number, and the outline has one function from a day to a number.
- One doubt, about "the natural guess must be wrong". Sunday as 0 is the guess from JavaScript's `getDay`, and it is wrong. But Monday 0 and Sunday 6 is what Python's `weekday()` gives, and a reader with only the first line may as well guess that, and be right. So the fact is one of two live guesses, and a `region` pass on PE3 may be a lucky guess. The sorter should read what a passing `region` answer says about why it wrote 6. This bears on question 4, which expects `region` to fail `leans`.
- The wrap trick of section C works here too (a new `shiftPayPence` over the old body renamed, quoting only the outline's line 173; it passes). It still needs the fact, so the kind stands.

==== E. THE MODULE ====

- 503 lines, no line over 120 columns, `tsc --strict` passes on files/rota.ts, on each reference.ts and on each other.ts. No import, no clock, no random number; two runs of check-tasks gave the same results. The outline shows no first line cut.
- It reads as real code. Nothing is broken. Three things a reader might stop at, none a fault: `lapseSwaps` tests `!shift` and `decideSwap` calls `this.need(swap.shiftId)`, though `removeShift` drops a removed shift's requests, so neither can fire; `load` trims a line to test for blank and does not trim to test for `#`; `toLines` then `load` turns an end of 1440 into 0, with the same length.
- Each ask is under 170 words (123, 118, 109), has a title line, names `src/rota.ts`, and mentions no test.

==== F. WHAT THE MENDER HAS TO DECIDE ====

1. Add helper cases for section A, at least numbers 1 to 15. Numbers 1 and 2 need one probe of the rota's own order after `toLines` and one of `whyNot` with two clashes loaded out of order; the rest are one line each from the inputs given.
2. PE1: a second in-place probe whose two clashing shifts are on different days; and a line in where.md that `sortShifts(this.shifts)` in the outline arm is the arm's failure.
3. PE2: a case with a pending request from an earlier holder. And either a different change that sits inside the body, or a line in where.md and in the run's note that the outline is enough for this task by wrapping.
4. PE3: a `costOn` case on a Sunday; a decision on days before 0; and a line in where.md that Sunday as 6 is one of two common numberings.
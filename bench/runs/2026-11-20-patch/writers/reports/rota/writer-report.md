Module `rota` and its three tasks are written in /home/build/patch/rota/set, and every command in the brief ends as it must. No rule of the brief had to be broken. Nothing was committed and nothing under /home/user/Kung-Fu was edited.

## The module

/home/build/patch/rota/set/files/rota.ts is 503 lines (`wc -l`). It has no import, no clock and no random number. No line is over 120 columns, and every function header is on one line.

**Exports**
- Types: `Role`, `SwapStatus`, `Staff`, `Shift`, `Leave`, `SwapRequest`, `CoverNeed`, `Gap`, `RestBreach`.
- Constants: `OPEN` (""), `NEVER` (-1), `DAY_MINUTES`, `MIN_REST`, `MAX_DAYS_RUNNING`, `SWAP_NOTICE`.
- Functions: `minutesOf`, `clockOf`, `weekdayOf`, `weekStart`, `shiftLength`, `spanOf`, `overlaps`, `restBetween`, `paidMinutes`, `shiftPayPence`, `sortShifts`, `coverNeeds`, `countOn`, `coverGaps`, `formatShift`, `parseShift`.
- Class `Rota`, with six private fields and 26 public methods: `addStaff`, `person`, `addLeave`, `onLeave`, `addShift`, `removeShift`, `moveShift`, `shift`, `shiftsOn`, `shiftsFor`, `whyNot`, `assign`, `release`, `requestSwap`, `decideSwap`, `swapsFor`, `pendingSwaps`, `lapseSwaps`, `restBreaches`, `daysRunning`, `minutesInWeek`, `overContract`, `costOn`, `gapsOn`, `isCovered`, `toLines`, `load`.
- Not exported: `pad2`, `idNumber`, `byStart`, the cover tables, and the break and slot constants.

**Conventions a guess would get wrong, and where each shows**

Visible only in a body or a comment:
1. Weekdays count from Monday: 0 is Monday, 6 is Sunday, and day 0 was a Monday. Shown in `weekdayOf`'s body comment and the `COVER` table's comments.
2. A shift whose end is at or before its start runs into the next day; end equal to start is a whole day. Shown in `shiftLength`.
3. A shift covers its first minute and not its last, so touching shifts do not overlap. Shown in `overlaps`, `countOn` and the comment above `spanOf`.
4. Rest of exactly eleven hours is enough, and two shifts that start on one day need no rest between them. Shown in `whyNot` and `restBreaches`.
5. Only a shift longer than six hours loses the 30-minute unpaid break. Shown in `paidMinutes`.
6. Pay is in pence, rounded shift by shift with a half going up. Shown in `shiftPayPence` and `costOn`.
7. Swap requests are kept newest first: `swapsFor` gives newest first, `pendingSwaps` oldest first. Shown in `requestSwap` (`unshift`), `pendingSwaps`, and the comment on the field.
8. `whyNot` returns "" when the person can hold the shift.
9. `sortShifts` sorts its argument in place and returns it; ties go by the number in the id, so s2 comes before s10. `addStaff` keeps a copy. `shift`, `addShift`, `assign` and `moveShift` hand back the rota's own object.
10. Leave includes both its first and last day, unlike every other range in the file. Shown in `addLeave` and `onLeave`.
11. Shift and swap numbers are never reused, and a failed `addShift` spends none. Shown in `addShift`, `removeShift` and `load`.
12. `removeShift` drops every request for the shift, decided or not; `release` drops none.
13. Cover is counted at the start of each half hour, and a night shift from the day before counts. Shown in `coverGaps` and `countOn`.
14. A shift belongs to the day and week it starts in. Shown in `shiftsOn`, `daysRunning`, `minutesInWeek` and `costOn`.
15. 24:00 is accepted only as an end; `clockOf` writes 1440 as 00:00.

Visible in a first line: `OPEN = ""` and `NEVER = -1`.

## The regression helper

/home/build/patch/rota/set/checks/helpers-rota.ts exports `unchanged(mod, skip)` with 126 named cases. Every function and method has at least two cases, still true after each task's skips. It throws if two cases share a name or if `skip` names a case that does not exist.

I tried it against 150 single changes to the module, each one a plausible guess at a body. It failed all 150. The same changes applied to each reference were all failed by that task's check too, bar the few that did not apply to the changed text (one for PE2, four for PE3).

## The tasks

**PE1, beside: "Open shifts in a run of days".** Adds `Rota.openShifts(fromDay, toDay, role?)`. It turns on what the outline shows: the `shifts` field, the `Shift` members, `OPEN` and `Role`. The ask states the rest: `fromDay` counts and `toDay` does not, an open shift has `OPEN` as its `staffId`, the order is by `day` then `start`, and the rota must not change. The reference edit quotes `shiftsFor(staffId: string): Shift[] {` as the outline prints it. Hollows: `hollow-ends` counts `toDay`, `hollow-order` does not sort, `hollow-lost` breaks `paidMinutes`.

**PE2, inside: "Approving a swap settles the other requests for the shift".** Changes `Rota.decideSwap`: approving refuses the other pending requests for the same shift with the same `decidedAt`. It turns on the method's own body: the list is `this.swaps`, the time is `at`, and the sweep must come after the two checks that throw. Hollows: `hollow-stamp` leaves `decidedAt` unset, `hollow-refusal` sweeps on a refusal too, `hollow-early` sweeps before the throws, `hollow-lost` turns `pendingSwaps` round. One helper case is skipped.

**PE3, leans: "A Sunday allowance on a shift's pay".** Changes `shiftPayPence`: a flat 1,250 pence for a shift that starts on a Sunday. It leans on `weekdayOf`, whose body says Sunday is 6. Its first line, `export function weekdayOf(day: number): number {`, leaves that open, and nothing in the outline numbers the weekdays. The natural guess is Sunday 0, as JavaScript's `getDay` has it; `hollow-guess` is that. Also `hollow-touch` (any shift touching a Sunday) and `hollow-lost` (`whyNot` refuses a rest of exactly eleven hours). Two helper cases are skipped: the one saying pay ignores the day, and `costOn` on a Sunday.

Beyond the hollows, I ran 8 right answers written other ways and 17 further wrong answers against the checks. All 8 passed and all 17 failed.

## Last line of each command

- `tsc --strict` on files/rota.ts: no output, exit 0. The same for each `reference.ts`, copied to a temporary `.ts` file.
- `holds.py make` then `holds.py check`: `all as they must be`. The outline cuts 0 first lines.
- `box.py check-tasks W --window none`: `window: none; all as they must be`. That is 3 references passed; 3 plain and 10 hollow answers failed, none for failing to load.
- `holds.py sizes`: `PE3   leans          503       113      4746      4938     18488   shiftPayPence`. The outline is 4,746 bytes and the whole file 18,488. The region is 5,570 bytes for PE2 and 15,777 for PE1.

Scratch scripts and temporary copies were kept in SCRATCH/rota-work, outside W, so that W holds only the set.

## Unsure

1. PE3 can be passed by luck. Weekday numbering has two common forms, and a reader with the region only who happens to assume Monday-first (as Python's `weekday()` does) writes `=== 6` and passes without the fact. No hedge covers both guesses, but a lucky guess is possible, so some `region` passes on PE3 may not mean the reader knew.

2. PE3's fact shows twice in the whole file: in `weekdayOf`'s body comment and in the `COVER` table's `// Monday` and `// Sunday` comments. Neither is in the outline or the region.

3. PE3's check uses no day before day 0. `shift.day % 7 === 6` is right for every day the ask can mean and passes; it would differ from `weekdayOf` on negative days, which the ask does not speak of.

4. PE3 changes `Rota.costOn` on a Sunday, because `costOn` adds up `shiftPayPence`. That helper case is skipped and the new value is not tested, since the ask does not mention `costOn`.

5. PE1's region text is 15,777 bytes, because the ask puts `Rota` in a code span and the rule then takes the whole class. The 27B's `region` arm is not sent `beside` tasks, but the ceiling sends every arm every task, so there PE1's region is nearly the whole file.

6. PE1's last check case detects an answer that sorts the class's own `shifts` array in place. It does so through `whyNot`, which names the first clashing shift in the array's order. The ask does say the method must change nothing in the rota, but this is an indirect way to see it.

7. In PE1 an edit with an empty SEARCH puts the method after the class's closing brace, where it does not parse. A reader with the outline has to quote a member's first line; `where.md` says so.

8. The helper pins the exact words of thrown errors and of `whyNot`'s reasons. I count that as behaviour seen through the exports, but it does mean a rewrite that rewords an error fails `unchanged`.

9. The mutants and the alternative answers were mine. No fresh agent has attacked these checks yet.
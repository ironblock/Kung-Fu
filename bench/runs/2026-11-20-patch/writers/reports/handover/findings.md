## findings

Adversary report for `handover` (W = /home/build/patch/handover/set). This is my own work from start to end. I edited no file of the writer's and committed nothing.

## Last lines
- `box.py check-tasks W --window none`, run first, before I changed anything: `window: none; 37 WRONG`.
- The same command at the end: `window: none; 51 WRONG`. The full output is in SCRATCH/adv-handover-opus55/final-check.txt.
- `holds.py check W`: `all as they must be`.
- `tsc --strict` on files/handover.ts: exit 0. It is also exit 0 on each other.ts and on each of my hollow-adv files.

## What I did with the earlier adversary's files
- It left 43 hollow-adv files. 37 of them passed their check, so each is a breach, and I kept all 37.
- For each of the 37, I ran one input through both the file and the module and got different results (demo-prior.mjs in my scratch directory: "37 files, 0 the same"). Every one is a real change of behaviour, not an equivalent rewrite.
- 6 of its files failed, each at exactly one case. I kept 5 as near misses: PO1 adv-14, PO2 adv-13 and adv-14, PO3 adv-13 and adv-14.
- I deleted PO1 hollow-adv-15 (addExtra allowed while the hire is only booked). The case `Handover.addExtra: also once the boat is back, and in no other phase` caught it.
- I replaced its three other.ts files with my own.
- Disclosure: to diff its files I had to diff against reference.ts, so I had seen the reference edits before I wrote my other.ts files. I wrote mine in a different style.

## The main finding: the regression helper is weak
- 49 of the 51 breaches are gaps in checks/helpers-handover.ts. The `unchanged` cases are the same in all three checks, so these gaps are shared.
- I applied each of my 13 regressions to all three tasks' right answers, and every one passed all three checks. One mend of the helper covers all three tasks.
- The other 2 breaches (PO3 adv-12 and adv-19) are gaps in PO3's own cases.
- The writer reports "208 one-line changes ... 203 failed it". My own sweep made 437 one-line operator changes of PO1's reference (comparisons, &&/||, ceil/floor/round, min/max, push/unshift, trim/case, sort direction, numbers moved by one, guard lines dropped). 31 passed the PO1 check.
  - These 31 include real gaps: readingProblems with fuel 0; newDamage with unshift; receiptLines with `owedPence > 1`; stageTimes with findLast; noteDamage with `size <= 1`; dropDamage with its phase guard dropped; addExtra with `pence <= 1`; charges with `used > 1`; close with `owes > 1`; daySheet ties.
  - The rest give the same results on any real input: the UNREAD guard in fuelEighths and the NOT_YET guard in lateMinutes (as the writer says), `run <= 0` to `< 0`, `used <= 0` and `lateMin <= 0` to `< 0`, the cabin rounding (each price times 1.5 is whole pence), findLast on codes that occur once, and unshift onto a list that is still empty.
  - The list of changes is in mut1/list.txt and the results in mut1.out.

## PO1 (beside): `Handover.blockers`

**Breaches (17).** Every file has the right `blockers` and changes one other declaration, as follows.

From the earlier adversary:
- adv-1: daySheet also leaves out a closed hire.
- adv-2: HandoverBook.forBoat leaves out a hire that was called off.
- adv-3: Handover.dropDamage has no phase test. It strikes out an out mark while the boat is out: the module gives false, the file true.
- adv-4: Handover.release is refused while the fuel gauge is unread.
- adv-5: readingProblems calls fuel 0 a problem.
- adv-6: newDamage puts a grown mark at the front. For after = [new roof mark, grown bow mark] the module gives [roof, bow] and the file [bow, roof].
- adv-7: Handover.warnings gives [] once the boat has gone.
- adv-8: Handover.lastEvent picks the latest by the time written on the event, not by when it was added.
- adv-9: HandoverBook.size leaves out hires that were called off.
- adv-10: Handover.open is refused when no name is given.
- adv-11: stageTimes takes the last event of a kind in the list, not the first. Only a list with two events of one kind shows it.
- adv-12: Handover.addExtra is also allowed on a hire that was called off.
- adv-13: HandoverBook.clashes orders each pair by ref, not earlier hire first. The module gives [["Z-1","A-1"]], the file [["A-1","Z-1"]].

Mine:
- adv-16: Handover.addExtra refuses an extra under 100 pence. `addExtra(50, "lost mop")` gives true in the module and false in the file. The helper's case "Handover.addExtra: the pence must be a whole number above 0" tries only 0, -500 and 12.5.
- adv-17: HandoverBook.live leaves out a hire that is being checked, so held() drops its deposit too. For a book holding one hire being checked, the module gives [1, 20000] and the file [0, 0]. The helper's live case holds hires that are booked, called off, closed, returned and out, but none being checked.
- adv-18: Handover.release is refused while any out item is at fault, even one that need not be settled. With WATER at fault, the module gives [true, "out"] and the file [false, "checking"]. The module's comment says "None of them stops it going."
- adv-19: Handover.close is refused while the back reading has neither a fuel nor an engine figure. The module gives the settlement, the file undefined.

**Near misses kept.** Both fail at one case only.
- adv-14: a hire called off while it was being checked gives the out list. Only "gives an empty list for a hire that was called off, whatever its lists hold" catches it.
- adv-20: while the boat is out, it gives the back list. Only "gives an empty list while the boat is out, though the back list is all todo" catches it.

**Other wrong answers the check failed:**
- `must && todo || fault` (the operator precedence slip)
- faults listed first
- `na` taken as still open
- a "READING" code added while the gauges are unread
- the codes sorted
- a fault given with its note

Two answers that look wrong passed, and both are equivalent:
- treating a closed hire with the back list (close requires the back list to be ready);
- caching the result on the object.

**other.ts: passed.** It uses a table, `{ checking: "out", returned: "back" }`, and a `reduce` over `this.checklist(side).items`, at the end of the class. I also wrote, in scratch, an answer added after the end of the file: `export interface Handover { blockers(): string[]; }` and `Handover.prototype.blockers = function ...`, using only `phase` and `checklist(side)`. It passes the check and `tsc --strict` (scratch other/PO1-append.ts). So the writer's "Unsure 2" is wrong: an edit with an empty SEARCH can add a method.

**Kind.** It is a true `beside` task. The ask states the whole rule:
> While the phase is `checking`, it looks at the `out` checklist. While the phase is `returned`, it looks at the `back` checklist. In every other phase it gives an empty list.

> An item holds the step up when its `must` is true and its state is `todo` or `fault`.

The outline shows the rest: `499: private state: Phase = "booked"`, `519: get phase(): Phase {`, `500: private lists: Record<Side, Checklist>`, `680: checklist(side: Side): Checklist {`, and the `code`, `must` and `state` fields of `ChecklistItem`. A right answer needs nothing that is only in a body or a comment. One detail: the outline indents members by two spaces where the file has four, but a SEARCH copied from the outline still matches, as a substring of the line.

## PO2 (inside): `lateCharge`

**Breaches (17).** Every file has the right `lateCharge`.

From the earlier adversary:
- adv-1: daySheet gives no departure row once the boat has gone.
- adv-2: forBoat leaves out a closed hire.
- adv-3: dropDamage works on either side while any paperwork is open.
- adv-4: `tick` with no note keeps the note the item had.
- adv-5: Handover.read keeps the earlier fuel figure when a later reading has fuel unread.
- adv-6: HandoverBook.held takes off what each live hire has been charged. With a 1850 extra, the module gives 20000 and the file 18150.
- adv-7: mergeCharges drops a code whose lines add up to 0.
- adv-8: Handover.cancel is refused when no reason is given.
- adv-9: noteDamage refuses a mark of 1 mm.
- adv-10: HandoverBook.remove is also allowed once the boat is back.
- adv-11: Handover.tick does not log a tick that changes nothing.
- adv-12: nextFree offers a slot that runs past midnight. `nextFree([], day 10 23:50, 40)` gives -1 in the module and a time in the file.

Mine:
- adv-15: Handover.charges gives no fuel line when less than a litre was burned. With fuel 1500 out and 1496 back, the module gives `[{fuel, 168, "0.4 L by dipstick"}]` and the file [].
- adv-16: Handover.close notes a debt under 100 pence as a refund. The module notes "owes £0.50", the file "refund £0.00".
- adv-17: Handover.warnings gives no fuel warning for an empty tank (fuel 0), as if 0 meant unread.
- adv-18: Handover.read refuses a reading timed before the one already held for that side. The module gives [true, 1400], the file [false, 1500].
- adv-19: fuelUsed takes a drop of under 5 tenths of a litre as none. The module gives 4, the file 0.

**Near misses kept.** Each fails only "charges every step after the fourth at twice the price".
- adv-13: the cap is reached at the eighth step.
- adv-14: each step costs twice the one before it.

**Other wrong answers the check failed:** no cap; whole steps rounded down after the fourth; the grace counted into the four steps; the cap doubled; steps of an hour; the cap applied to the count of steps. A form in minutes, `4800 + ceil((min - 120) / 30) * 2400`, passed, but it is right, since 120 minutes is a whole number of steps.

**other.ts: passed.** It counts `plain = Math.min(steps, 4)` and `dear = steps - plain`, and returns `Math.min((plain + 2 * dear) * LATE_STEP_PENCE, LATE_CAP_PENCE)`.

**Kind: not an `inside` task.** The brief's test is "Could the change be written from the outline alone, without the body? If so it is not an inside task." It can, in two ways. Both pass the check and `tsc --strict`.
1. **Wrap the old function** (scratch other/PO2-wrap.ts). The SEARCH is only the first line, `export function lateCharge(lateMin: number): number {`, which the outline prints at line 306. The REPLACE is a new `lateCharge` followed by `function lateChargeBefore(lateMin: number): number {`, so the old body lives on under a new name. The new body is `const steps = lateChargeBefore(lateMin) / LATE_STEP_PENCE; return Math.min((steps + Math.max(0, steps - 4)) * LATE_STEP_PENCE, LATE_CAP_PENCE);`. It needs only the constants the outline shows at lines 99 to 101, and the ask's "charged as they are now".
2. **Write the body anew from a guess,** with the same first-line edit. With `Math.ceil` it passes. With `Math.floor` it fails 11 cases. The only facts that are in the body alone are the rounding up (the comment at line 305: "Each step that was started is charged") and `if (lateMin <= 0) return 0;`.

This also touches the README's `outline-1` arm, which is sent these tasks because "the text to change is not in it": an edit that quotes a first line from the outline and renames the old declaration does apply. Everything a right answer needs is in the ask and region.md.

## PO3 (leans): `Handover.report`

**Breaches (17).**

From the earlier adversary:
- adv-1: daySheet gives no return row once the boat is back.
- adv-2: daySheet gives the time a boat really went, once it has gone.
- adv-3: stageTimes gives NOT_YET for a stage that ends before it begins.
- adv-4: HandoverBook.takings merges each hire before the sum. The module notes "3 items", the file "2 items".
- adv-5: Handover.release is refused at a time before the reading's time.
- adv-6: newDamage excuses the largest old mark, not the first.
- adv-7: receiptLines shows a penny owed as "refund £0.00".
- adv-8: Handover.close is refused at a time before the boat came back.
- adv-9: Handover.read refuses a back reading timed before the return.
- adv-10: noteDamage refuses the same mark twice.
- adv-11: HandoverBook.add lets a hire that was called off be replaced.
- adv-12: the task itself. The report passes over "extra" events when it picks the latest three.

Mine:
- adv-15: sortMarks orders marks of one zone and one size by their kind, not as given. The module gives ["first", "second"], the file ["second", "first"]. The helper's case "sortMarks: marks of one zone and one size keep their order" uses `[mark("stern", "dent", 30, "b"), mark("stern", "scratch", 30, "a"), ...]`, where dent before scratch is already the order of the kinds, so it cannot see this.
- adv-16: mergeCharges keeps the note when all the lines of a code share it, in place of "n items". The module gives "2 items", the file "lost windlass".
- adv-17: Handover.warnings gives no gas warning when no bottle is aboard. The module gives "gas: 0 of 2 bottles", the file nothing.
- adv-18: Handover.release sets the time out to the later of the release time and the out reading's time. The module gives "day 10 13:40", the file "day 10 13:50".
- adv-19: the task itself. "returned" events are left out of the latest three. No case of the check has a returned, damage or extra event among the three latest.

**Near misses kept.** Both fail at one case only.
- adv-13: the report turns `this.events` round in place. Only "changes nothing in the handover, and gives the same lines when asked again" catches it.
- adv-14: the total line is given only when there are two charges or more. Only the case for the lines of a closed hire catches it.

**Other wrong answers the check failed:**
- `slice(-3)`
- `slice(0, 3).reverse()`
- `timeline().reverse().slice(0, 3)`
- a loop from the end
- a sort by time on the reversed list
- the events put before the `events:` line
- a heading line
- an indent
- ticks left out
- formatting of my own that always writes " by " (this fails only the describeEvent case).

**other.ts: passed.** It ends with `return lines.concat(this.timeline().slice(0, 3).map((event) => describeEvent(event)));`.

**Kind.** It is a `leans` task:
- The ask states the order of the output and "This goes by when an event was added, not by the time written on it". It does not say how the list is kept.
- region.md shows only `this.events.length`.
- The other declaration's first line, `532: private log(kind: EventKind, at: number, by: string, text: string): void {`, leaves the order open.
- The natural guess, `slice(-3).reverse()`, is wrong: hollow-guess fails 7 cases.
- The whole file shows the fact plainly: line 504 `// Newest first.`, the comment at line 531, and `unshift` at line 533.
- A careful reader sees `private events` and `private log` in the outline and the ask's word "added", so would see that the other declaration matters.

Three caveats:
1. The order the ask wants is the stored order, so "the first three" (`this.events.slice(0, 3)`) is right. A reader who guesses the timeline is newest first, as activity feeds often are, passes without knowing the fact. The guess is not one-sided.
2. The outline's `697: lastEvent(kind?: EventKind): TimelineEvent | undefined {` lets a reader work out the order at run time. An answer that compares `lastEvent()` with `events[0]` passes (scratch other/PO3-detect.ts).
3. The region adds nothing a right answer needs beyond the outline. An answer that quotes only `report(): string[] {` (outline line 720), renames the old body `reportBefore`, and adds the events passes (scratch other/PO3-wrap.ts). The task still turns only on the fact in `log`'s body.

## The module
- Nothing changes from run to run: there is no clock and no random number, a Map keeps the order of insertion, and the sort is stable.
- It is 863 lines, no line is over 120 columns, and no line is a mark. It reads as real code.
- I found nothing broken. Two oddities:
  - `tenths()` would print "-1.-5" for a negative number, but no path reaches it with one.
  - `release` and `close` do not compare `at` with earlier times, though `takeBack` does. That is plausible in real code, and breaches PO3 adv-5 and adv-8 show it is not pinned.

**Real differences I did not put in files**, because they only reorder ties or are contrived:
- dueBack and overdue with ties broken by ref;
- daySheet rows of the same minute and kind (the unshift in the sweep);
- inWharfHours with `dayOf(slot.end - 1)`, which accepts a 23:20 to 24:00 slot;
- the headline of a hire called off while it was being checked;
- checklistFor with an upper bound (`berths < 12`).

## Files
In W/tasks/<id>/:
- hollow-adv-*.ts: 57 files, the 51 breaches and the 6 near misses. Each begins with one comment line that says what is wrong.
- other.ts: my right answer for each task.

In SCRATCH/adv-handover-opus55/:
- try.py: a runner that names the failing cases.
- demo.mjs and demo-prior.mjs: the inputs that tell each breach from the module.
- mut1/list.txt and mut1.out: the sweep.
- other/PO1-append.ts, other/PO2-wrap.ts, other/PO2-outline-ceil.ts, other/PO3-wrap.ts, other/PO3-detect.ts: the right answers described above under each task's kind.

## breaches

51

## others_failed

0

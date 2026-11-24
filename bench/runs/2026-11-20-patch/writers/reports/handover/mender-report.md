## changes

All changes are inside /home/build/patch/handover/set. The full list, one line for each change and the finding it answers, is in /home/build/patch/handover/set/CHANGES.md. Nothing else changed: not the module, the asks, any plain.ts, reference.ts, reference.edits.md or other.ts, and not the kept texts under holds/ (holds.py make wrote them again byte for byte).

THE HELPER, checks/helpers-handover.ts: 46 new cases, from 215 to 261. No old case and no skip list changed. No new case calls report(), and every new case that goes through Handover.charges has 120 minutes of lateness or less, so no right answer to PO2 or PO3 can fail one. Each case and the finding it answers:
- checklistFor, 12 and 40 berths get CREW: the unfiled upper-bound difference
- tick with no note loses the old note: PO2 adv-4
- readingProblems, fuel 0 is no problem: PO1 adv-5
- fuelUsed counts a drop of 1 and 4 tenths: PO2 adv-19
- newDamage keeps the order of `after`: PO1 adv-6
- newDamage matches the first old mark: PO3 adv-6
- sortMarks keeps ties in order whatever their kinds: PO3 adv-15
- mergeCharges keeps a code whose lines sum to 0: PO2 adv-7
- mergeCharges gives "n items" even when the lines share a note: PO3 adv-16
- receiptLines, a penny owed is "to pay": PO3 adv-7
- stageTimes takes the first event of a kind in the list: PO1 adv-11
- stageTimes gives a negative stage: PO3 adv-3
- inWharfHours, a slot ending at midnight is out of hours: unfiled difference
- nextFree past midnight gives NOT_YET: PO2 adv-12
- open with no name: PO1 adv-10
- a tick that changes nothing is still noted: PO2 adv-11
- read replaces the whole reading: PO2 adv-5
- read takes a reading timed earlier than the one it replaces: PO2 adv-18
- a back reading timed before the return: PO3 adv-9
- a 1 mm mark: PO2 adv-9
- the same mark twice: PO3 adv-10
- dropDamage refused once its side is closed: PO1 adv-3 and PO2 adv-3
- release with an optional item at fault: PO1 adv-18
- release with every gauge unread: PO1 adv-4
- release before the reading's time, at that time: PO3 adv-5 and adv-18
- warnings for an empty tank and no gas aboard: PO2 adv-17 and PO3 adv-17
- warnings the same once gone and once back: PO1 adv-7
- addExtra of 1 and 50 pence: PO1 adv-16
- addExtra refused when called off: PO1 adv-12
- cancel with no reason: PO2 adv-8
- charges for 0.4 L and 0.1 L: PO2 adv-15
- close with no fuel or engine figure: PO1 adv-19
- close owes £0.50 and £0.01: PO2 adv-16
- close before the return: PO3 adv-8
- lastEvent goes by when an event was added: PO1 adv-8
- headline of a hire called off while being checked: unfiled difference
- dueBack and overdue keep ties in the order given: unfiled difference
- daySheet lists closed, returned, out and booked hires at their due times, with two returns at one minute: PO1 adv-1, PO2 adv-1, PO3 adv-1 and adv-2, and the sweep's daySheet ties
- size counts every phase: PO1 adv-9
- add, a called-off hire keeps its reference: PO3 adv-11
- remove refused once the boat is back: PO2 adv-10
- forBoat gives every phase: PO1 adv-2 and PO2 adv-2
- live includes a hire being checked: PO1 adv-17
- clashes puts the earlier hire first: PO1 adv-13
- held counts the whole deposit: PO2 adv-6
- takings counts lines across hires ("3 items"): PO3 adv-4
These cases also close the real gaps in the adversary's sweep.

PO3 CHECK, tasks/PO3/check.test.ts: one new case, "gives events of every kind, so a damage mark, the return and an extra are among the three". It answers PO3 adv-12 and adv-19, and the finding that no case had a returned, damage or extra event among the three latest.

WHERE.MD
- PO1: corrected the claim that an edit with an empty SEARCH cannot add the method. The adversary's `export interface Handover` plus `Handover.prototype.blockers` answer applies and passes. This answers the finding that the writer's "Unsure 2" is wrong. The new hollows are named.
- PO2: new paragraph "A right answer from the outline alone", on the wrapper and on the Math.ceil guess, saying an outline-1 pass must be read before it is counted. This answers PO2's kind finding. The new hollows are named.
- PO3: new paragraph "Passes that do not show the fact", on the newest-first guess, the run-time probe through lastEvent, and the wrapper. This answers the three kind caveats. The new hollows are named, hollow-guess now fails eight cases, and the check has eleven.

FILES
- The 51 breaches are renamed hollow-<what it gets wrong>.ts, for example PO1 adv-1 is now hollow-closedsheet. The new name replaces hollow-adv-<n> in each file's first comment line. I checked every file body: nothing else changed.
- I also renamed the six near misses (voidout, outback, capeighth, doubling, turned, totaltwo), so no hollow-adv name is left. The brief asks this only of breaches; their checks fail them as before.

VERIFIED BEYOND THE THREE COMMANDS
- Each breach fails at the case written for it.
- The adversary's other right answers all still pass: PO1-append, PO2-wrap, PO2-outline-ceil, PO3-wrap and PO3-detect. PO2-outline-floor fails, as it should.
- tsc --strict passes on the helper with each check against its reference (exit 0).
- The adversary's 437-change sweep, run against the mended PO1 check, now leaves 20 survivors instead of 31. Output: SCRATCH/mend-handover-opus55/mut1-after.out. The full final check-tasks output is in final-check.txt in the same directory.

## tsc_last_line

no output, exit 0

## holds_check_last_line

all as they must be

## check_tasks_last_line

window: none; all as they must be

## left_alone

1. PO2, "not an inside task" (the run's author should decide this one). The finding is true: the wrapper passes the whole check from the outline alone. It quotes only the first line, renames the old body lateChargeBefore, and turns its charge back into steps. I did not change the task, for three reasons:
- The wrapper needs nothing from the old body. The same route is open in any inside task whose new result can be built from the old one, so it reaches all sixteen modules. The fuel, manifest, parts, pumpout, rota, stoppages, survey, tides and worklog menders left the same finding for the same reason.
- Closing it would need another thing for the task to turn on, or a change to the module and every answer of the three tasks.
- The second route, a guess, needs two facts of the body: Math.ceil and nothing for 0 minutes or less. With Math.floor it fails 11 cases.
Written in place, the change does need the body, so for a region reader the task is of its kind. PO2's where.md says how to read an outline-1 pass. The run README's line that outline-1 tasks are ones the outline "cannot be enough" for is not quite true of PO2. That README is outside W, so I did not edit it.

2. PO3's three kind caveats. The adversary found PO3 a true leans task, and I agree. The newest-first guess, the run-time probe (lastEvent compared with events[0]) and the wrapper that quotes `report(): string[] {` are all right answers, so no check can fail them. Closing them needs another fact for the task to turn on. where.md now says to read each pass and count guesses and probes beside the score.

3. The 20 sweep changes that still pass: m-24, 33, 66, 88, 102, 109, 124, 128, 140, 144, 145, 193, 194, 293, 332, 339, 342, 345, 389 and 437. Each gives the module's result on every input the module makes:
- findLast or findLastIndex on a code that occurs once;
- an unshift onto the front of a list where that item comes first anyway;
- `<= 0` changed to `< 0` where 0 gives 0 either way;
- the dropped UNREAD and NOT_YET guards, whose arithmetic gives the same -1 or 0;
- cabin rounding, where every price times 1.5 is whole pence;
- spanOf with `<=` or `>=`;
- `> 1` on late minutes and damage prices, which are never 1;
- daySheet rank 2 in place of 1;
- damageCharge starting at 1, where a step is always found.
Only off-ground inputs, such as a checklist holding one code twice or a NaN size, would tell some of them apart. Pinning those would test past what the module promises.

4. The module's oddities. tenths() would print "-1.-5" for a negative number, but no path reaches it with one. release and close do not compare `at` with earlier times. That is plausible in real code, and the adversary found nothing broken. The module is unchanged. The helper now pins release and close as they are, which answers PO3 adv-5 and adv-8.

5. PO1's note that the outline indents members by two spaces where the file has four. This is information, not a fault: a SEARCH copied from the outline still matches as a substring.

6. The adversary's disclosure that it read reference.ts before writing its other.ts files. Nothing to mend: all three are in another style and pass, before and after the changes.

7. Answers the adversary found right: PO2's minute form, and PO1's "closed hire takes the back list" and caching. They pass, as they should.

# Changes made by the mender, module `handover`

Written by Claude Opus 5.5 on 2026-11-22, from the adversary's findings on PO1, PO2 and PO3. The module, the asks,
every `plain.ts`, `reference.ts`, `reference.edits.md` and `other.ts`, and every kept text under `holds/` are
unchanged. "adv-n" is the adversary's file number in that task; the new name of each file follows it.

## The regression helper, `checks/helpers-handover.ts`

One line for each case added, and the finding it answers. No old case changed, and no task's skip list changed.
215 cases became 261. No new case goes through `report()`, and every new case that goes through `Handover.charges`
has a lateness of 120 minutes or less, so no right answer to PO2 or PO3 can fail one.

- New case "checklistFor: however many berths a big boat has, it gets the second steerer": 12 and 40 berths get CREW. Answers "Real differences I did not put in files": checklistFor with an upper bound.
- New case "tick: an item ticked again with no note loses the note it had". Answers PO2 adv-4 (hollow-tickkeepsnote).
- New case "readingProblems: an empty tank is a level like any other": fuel 0 is no problem. Answers PO1 adv-5 (hollow-emptytank) and the sweep's readingProblems with fuel 0.
- New case "fuelUsed: a drop of a tenth of a litre counts": 1 and 4 tenths. Answers PO2 adv-19 (hollow-fuelhalf).
- New case "newDamage: the marks come in the order of after, a grown mark as much as a new one". Answers PO1 adv-6 (hollow-grownfirst) and the sweep's newDamage with unshift.
- New case "newDamage: of two old marks of one zone and kind, the one noted first is matched first". Answers PO3 adv-6 (hollow-largestold).
- New case "sortMarks: marks of one zone and one size keep their order, whatever their kinds": scratch, dent, burn, crack stay in that order. Answers PO3 adv-15 (hollow-sortkind) and the finding that the old tie case could not see it.
- New case "mergeCharges: a code whose lines come to nothing keeps its line". Answers PO2 adv-7 (hollow-mergezero).
- New case "mergeCharges: lines of one code that share a note are still told as items". Answers PO3 adv-16 (hollow-sharednote).
- New case "receiptLines: a penny owed is to pay". Answers PO3 adv-7 (hollow-pennyrefund) and the sweep's receiptLines with `owedPence > 1`.
- New case "stageTimes: of two events of one kind, the first in the list is taken". Answers PO1 adv-11 (hollow-stagelast) and the sweep's stageTimes with findLast.
- New case "stageTimes: a stage that ends before it begins gives minutes below zero". Answers PO3 adv-3 (hollow-stagebackward).
- New case "inWharfHours: a slot that ends at midnight is not in hours": 23:20 to 00:00. Answers "Real differences I did not put in files": inWharfHours with `dayOf(slot.end - 1)`.
- New case "nextFree: NOT_YET for a slot that would run past midnight": from 23:50 and from 23:30. Answers PO2 adv-12 (hollow-pastmidnight).
- New case "Handover.open: a hire may be opened with no name given". Answers PO1 adv-10 (hollow-opennamed).
- New case "Handover.tick: a tick that changes nothing is still noted". Answers PO2 adv-11 (hollow-ticksame).
- New case "Handover.read: a later reading takes the place of the earlier one whole, an unread gauge too". Answers PO2 adv-5 (hollow-readkeepsfuel).
- New case "Handover.read: a reading timed before the one it replaces still takes its place". Answers PO2 adv-18 (hollow-readorder).
- New case "Handover.read: a back reading may carry a time before the boat came back". Answers PO3 adv-9 (hollow-readbefore).
- New case "Handover.noteDamage: a mark of 1 mm is kept". Answers PO2 adv-9 (hollow-markonemm) and the sweep's noteDamage with `size <= 1`.
- New case "Handover.noteDamage: the same mark may be noted twice, and both are kept". Answers PO3 adv-10 (hollow-marktwice).
- New case "Handover.dropDamage: refused once that side's paperwork is closed, and the marks stay": the out mark while the boat is out and once it is back. Answers PO1 adv-3 (hollow-dropanyphase), PO2 adv-3 (hollow-dropeither) and the sweep's dropDamage with its guard dropped.
- New case "Handover.release: an item that need not be settled does not hold the boat, whatever its state": WATER at fault. Answers PO1 adv-18 (hollow-releasefault).
- New case "Handover.release: a reading with every gauge unread is enough, so long as it has a time". Answers PO1 adv-4 (hollow-releasefuel).
- New case "Handover.release: the boat may be let go at a time before the reading's, and goes at that time". Answers PO3 adv-5 (hollow-releasebefore) and adv-18 (hollow-leftlater).
- New case "Handover.warnings: an empty tank and no gas bottle aboard are warned of". Answers PO2 adv-17 (hollow-emptywarn) and PO3 adv-17 (hollow-nogas).
- New case "Handover.warnings: the same once the boat has gone, and once it is back". Answers PO1 adv-7 (hollow-warnedgone).
- New case "Handover.addExtra: a charge of a penny, or of a few pence, is taken": 1 and 50 pence. Answers PO1 adv-16 (hollow-extrapound) and the sweep's addExtra with `pence <= 1`.
- New case "Handover.addExtra: refused for a hire that was called off", from booked and from checking. Answers PO1 adv-12 (hollow-extravoid).
- New case "Handover.cancel: a hire may be called off with no reason given". Answers PO2 adv-8 (hollow-cancelreason).
- New case "Handover.charges: a part of a litre burned is charged as a whole litre": 0.4 L and 0.1 L each cost 168 pence. Answers PO2 adv-15 (hollow-fuellitre) and the sweep's charges with `used > 1`.
- New case "Handover.close: a back reading with no fuel or engine figure is enough, so long as it has a time". Answers PO1 adv-19 (hollow-closeunread).
- New case "Handover.close: a debt of a penny, or of under a pound, is noted as owed": owes £0.50 and owes £0.01. Answers PO2 adv-16 (hollow-owespound) and the sweep's close with `owes > 1`.
- New case "Handover.close: the hire may be closed at a time before the boat came back". Answers PO3 adv-8 (hollow-closebefore).
- New case "Handover.lastEvent: goes by when an event was added, not by the time written on it". Answers PO1 adv-8 (hollow-lastbytime).
- New case "Handover.headline: a hire called off while it was being checked is called off". Answers "Real differences I did not put in files": the headline of a hire called off while it was being checked.
- New case "dueBack and overdue: boats due back at the same minute keep the order they are given in". Answers "Real differences I did not put in files": dueBack and overdue with ties broken by ref.
- New case "daySheet: a hire is listed at the times it is due, whether it has gone, is back or is closed": a closed, a returned, an out and a booked hire, two of them back at one minute. Answers PO1 adv-1 (hollow-closedsheet), PO2 adv-1 (hollow-gonesheet), PO3 adv-1 (hollow-backsheet) and adv-2 (hollow-wentsheet), and the sweep's daySheet ties (two returns at one minute keep the order given, as two departures already did).
- New case "HandoverBook.size: a hire counts whatever its phase". Answers PO1 adv-9 (hollow-sizevoid).
- New case "HandoverBook.add: a reference stays taken by a hire that was called off". Answers PO3 adv-11 (hollow-replacevoid).
- New case "HandoverBook.remove: a hire whose boat is back stays in the book". Answers PO2 adv-10 (hollow-removeback).
- New case "HandoverBook.forBoat: gives the boat's hires whatever their phase": closed, out, called off and booked. Answers PO1 adv-2 (hollow-forboatvoid) and PO2 adv-2 (hollow-forboatclosed).
- New case "HandoverBook.live: a hire being checked is live, and its deposit is held". Answers PO1 adv-17 (hollow-livechecking).
- New case "HandoverBook.clashes: the earlier hire comes first in a pair, whatever the references". Answers PO1 adv-13 (hollow-clashbyref).
- New case "HandoverBook.held: a live hire's whole deposit is held, whatever it has been charged". Answers PO2 adv-6 (hollow-heldcharged).
- New case "HandoverBook.takings: a code's note counts the lines of every closed hire": "3 items" for extras from two hires. Answers PO3 adv-4 (hollow-takingsmerged).

## PO3's own check, `tasks/PO3/check.test.ts`

- New case "gives events of every kind, so a damage mark, the return and an extra are among the three". It rests on the ask's "each of the three events that were added to the timeline last". Answers PO3 adv-12 (hollow-noextra), adv-19 (hollow-noreturn) and the finding "No case of the check has a returned, damage or extra event among the three latest".

## `where.md`

- PO1: "If the patch is refused" no longer says that an edit with an empty SEARCH cannot add the method. It names the right answer that does, by `export interface Handover` and `Handover.prototype.blockers`. Answers PO1's other.ts finding, "the writer's Unsure 2 is wrong".
- PO1: the wrong answers name hollow-voidout, hollow-outback and the seventeen helper hollows. Answers PO1's breaches and near misses.
- PO2: new paragraph "A right answer from the outline alone", on the wrapper and on the guess with `Math.ceil`, and that an `outline-1` pass must be read before it is counted. Answers PO2's "Kind: not an inside task".
- PO2: the wrong answers name hollow-capeighth, hollow-doubling and the seventeen helper hollows; "The check" says the new helper cases keep to 120 minutes of lateness. Answers PO2's breaches and near misses.
- PO3: new paragraph "Passes that do not show the fact", on the newest-first guess, the run-time probe through `lastEvent` and the wrapper. Answers PO3's "Kind" caveats 1, 2 and 3.
- PO3: the wrong answers name hollow-noextra, hollow-noreturn, hollow-turned, hollow-totaltwo and the fifteen helper hollows; hollow-guess now fails eight cases, not seven; "The check" has eleven cases. Answers PO3's breaches and near misses.

## Files

- Renamed each breach, as `hollow-<what it gets wrong>.ts`, and put its new name in its first comment line in place of `hollow-adv-<n>`. Nothing else in a file changed.
  - PO1: 1 closedsheet, 2 forboatvoid, 3 dropanyphase, 4 releasefuel, 5 emptytank, 6 grownfirst, 7 warnedgone, 8 lastbytime, 9 sizevoid, 10 opennamed, 11 stagelast, 12 extravoid, 13 clashbyref, 16 extrapound, 17 livechecking, 18 releasefault, 19 closeunread.
  - PO2: 1 gonesheet, 2 forboatclosed, 3 dropeither, 4 tickkeepsnote, 5 readkeepsfuel, 6 heldcharged, 7 mergezero, 8 cancelreason, 9 markonemm, 10 removeback, 11 ticksame, 12 pastmidnight, 15 fuellitre, 16 owespound, 17 emptywarn, 18 readorder, 19 fuelhalf.
  - PO3: 1 backsheet, 2 wentsheet, 3 stagebackward, 4 takingsmerged, 5 releasebefore, 6 largestold, 7 pennyrefund, 8 closebefore, 9 readbefore, 10 marktwice, 11 replacevoid, 12 noextra, 15 sortkind, 16 sharednote, 17 nogas, 18 leftlater, 19 noreturn.
- Renamed the six near misses the adversary kept, in the same way, so that no `hollow-adv-*` name is left. Their checks fail them as before. This goes past the letter of the brief, which asks it only of breaches: PO1 14 voidout, 20 outback; PO2 13 capeighth, 14 doubling; PO3 13 turned, 14 totaltwo.

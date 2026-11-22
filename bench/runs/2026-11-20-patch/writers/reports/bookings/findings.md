## findings

ADVERSARY FINDINGS: module `bookings`, W = /home/build/patch/bookings/set, tasks PG1 (beside), PG2 (inside), PG3 (leans)

The new-behaviour checks hold well. PG2's and PG3's own cases passed none of my wrong answers. PG1's own cases passed one. The other 52 breaches all get through the regression helper `checks/helpers-bookings.ts` (`unchanged`). Because every task's check calls that helper, mending it once mends the breach in all three tasks.

LAST LINES
- `python3 bench/box.py check-tasks W --window none`: `window: none; 53 WRONG`. Every WRONG line reads "passed", so each is a breach; none failed to load. The references pass, the plain files fail, my three other.ts pass, and the writer's hollow files plus the four close files below fail at assertions.
- `python3 bench/holds.py check W`: `all as they must be`.
- `tsc --strict` on files/bookings.ts: no output, exit 0. Every kept hollow-adv file and every other.ts type-checks too.

0. THE EARLIER ADVERSARY'S FILES (I ran check-tasks first, as asked)
- It had left 167 files, hollow-adv-001 to 167, all in PG1. 35 passed, 132 failed at assertions, and none failed to load. Its three other.ts passed.
- Kept as breaches: 31 of the 35 (listed under the helper below).
- Deleted 4 of the 35 because no input through the module's API can tell them from a right answer. A check cannot fail them, so they are not breaches:
  - 030: depositFor `quarter <= MIN_DEPOSIT ? MIN_DEPOSIT : quarter` is Math.max for every number.
  - 060: the id is made from `this.bookings.length + 1`. bookings never shrinks and nextNumber rises only when a booking is added, so the two are always equal.
  - 063: place adds `&& problems.length < 9`, but validateRequest gives at most 4 problems.
  - 070: confirm does `b.paidPence +=`, but a hold always has paidPence 0 when it is confirmed (unless a caller writes into the book's own object).
- Deleted 130 of the 132 failing files. Kept the two that came closest; both still fail:
  - hollow-adv-082: move skips the clash check when there are other problems. Caught by one expectation, the Thu case in "move: may overlap its own old days but not another booking".
  - hollow-adv-144: weekTotals counts a hire that begins on `weekStart + 7`. Caught by one expectation in "weekTotals: a held night is still open, and a hire begun earlier brings no money". It is caught only because Teal's money counts even though Teal is not among the boats given, which is the very gap breach 145 shows.
- Replaced its three other.ts with my own. Copies of all its files are in SCRATCH/adv-bookings-opus/earlier/.

My files are numbered as follows. In PG1, 201–206 and 211–217. In PG2, 221–227 and 231–237. In PG3, 241–254 and 261–267. The changes to other functions are the same seven in every task, numbered n, n+20 and n+50 (211 = 231 = 261, and so on).

Before writing other.ts I had already read each task's reference.edits.md and where.md. So my other.ts files were not written blind, and I made each one differ in form on purpose.

1. PG1, beside: "What is still owed on a boat"

Breach of PG1's own cases:
- hollow-adv-201 trims and lower-cases the id. On a book holding Okafor's Heron hold, `outstanding("HERON")` and `outstanding(" heron")` give 62150.
  - The ask says a boat with no such bookings gives 0, "and so does a boat id the book does not know".
  - The check tries only `expect(book.outstanding("osprey")).toBe(0);` and `expect(book.outstanding("")).toBe(0);`.

Breaches through `unchanged`: the 31 earlier files and 211–217 (section 4).

Came close, kept, and fails:
- hollow-adv-202 counts every state but cancelled, so lapsed holds owe. Only one expectation catches it: `expect(book.lapse(S(61, 0))).toEqual(["B0003"]);` followed by `expect(book.outstanding("heron")).toBe(19850);`.

Failed and deleted:
- 203: a hold owes only its deposit.
- 204: sorts the book's own list into diary order. Caught only by "changes nothing in the book", because its two Heron bookings are out of diary order.
- 205: an overpaid booking adds `Math.abs` of its shortfall.
- 206: each shortfall rounded up to the pound.

other.ts passed. It is a reduce over `this.bookings` naming "held" and "confirmed", placed after forBoat.

Kind: it is a true beside task.
- Everything a right answer needs is in the ask and outline.md: `335: private bookings: Booking[] = []`, the Booking fields boatId, state, chargePence and paidPence, BookingState, `isLive`, `forBoat`.
- Nothing needed is only in a body or a comment.
- The outline prints members with 2 spaces where the file has 4. A SEARCH on a member's first line with 0, 2 or 4 spaces still occurs exactly once.
- Note: region.md for PG1 is the outline text. The ask writes BookingBook as plain words, not in a code span, and holds.py check lists PG1 for this. That follows the README's rule and matters only to the ceiling's region arm.

2. PG2, inside: "A bigger discount for a fortnight or more"

The own cases had no breach. Wrong answers tried, all failed:
- 221: the tenth first, then 15 per cent off what is left.
- 222: the 15 per cent rounded down to the pound.
- 223: rounded to the nearest pound.
- 224: 85 per cent of the sum, with the charge rounded down to the pound.
- 225: the 15 per cent taken before the berth extra.
- 226: rounded up to the penny.
- 227: the tenth and then 5 per cent more.

Came close, kept, and fails:
- hollow-adv-224 is caught only by `expect(mod.hireCharge(HERON, 70, 91)).toBe(176250);`. That is the one sum (207450) not in whole pounds. Every other sum is whole pounds, and there rounding the charge down equals rounding the discount up. If that case were lost, this wrong reading of "rounded in the same way" would pass.

Breaches through `unchanged`: 231–237.

other.ts passed. It picks the rate first, then takes it off in one line with no if: `percentOff = nights >= 2 * LONG_HIRE_NIGHTS ? 15 : ... 10 : 0` and `total -= Math.ceil((total * percentOff) / 10000) * 100`. A float form, `total * (percentOff / 100)`, also passed in my scratch runs. So the check does not lean on the reference's form.

Kind: it is a true inside task.
- region.md holds lines 232–247, with "// a tenth off, rounded in the hirer's favour to the whole pound" and the berth-extra line.
- The ask's "worked out on the same sum as today's tenth" and "rounded in the same way" can only be met from that body.
- It cannot be written from the outline alone: the outline shows `233: export function hireCharge(boat: Boat, fromDay: Day, toDay: Day): Pence {` and `103: LONG_HIRE_NIGHTS = 7`, but not which sum the tenth comes off or how it is rounded.

3. PG3, leans: "Give part of the deposit back when a hire is cancelled"

The own cases had no breach.
- The natural wrong guess, in forms beyond the writer's hollow-guess, all failed:
  - 241: the share treated as a fraction, rounded down.
  - 242: the share treated as the fraction the yard keeps (1 − share).
  - 243: a fraction, with the refund capped at what was paid.
  - 244: the notice passed to the scale in minutes.
- Other wrong ways, all failed:
  - 245: the share of what was paid, not of the deposit.
  - 246: a hold gets a share.
  - 247: the share in place of the excess.
  - 248: the larger of the two, not both.
  - 249: notice +1.
  - 250: notice −1.
  - 251: notice counted from the day of confirming.
  - 252: the share rounded to the pound.
  - 253: paidPence loses only the excess.
  - 254: notice counted to the last day of the hire.
- All were deleted.

Breaches through `unchanged`: 261–267.

other.ts passed. It builds the refund in an if, with `noticeDays = b.fromDay - dayOf(at)` and `Math.round((b.depositPence * refundShare(noticeDays)) / 100)`. A fraction-first form, `deposit * (share / 100)`, also passed.

Kind: it is a true leans task.
- The ask does not give the fact away. It says "the share of its deposit that our refund scale gives for the notice it gave", with no unit, and does not name refundShare.
- region.md does not show it. Lines 459–473 never call refundShare. The outline shows only `256: export function refundShare(noticeDays: number): number {`, `132: REFUND_STEPS: readonly (readonly [number, number])[] = [` and `321: export function refundTerms(b: Booking, today: Day): string {`, and none of these shows per cent.
- The natural guess, a fraction, is truly wrong: it pays back 100 times too much.
- The fact is plain in the whole file:
  - line 257: "// whole per cent, so 75 is three quarters";
  - lines 133–135: `[42, 100], [28, 75], [14, 40]`;
  - line 329: `${share}% of the`.
- A careful reader of region.md would see that refundShare matters, from "refund scale", "share" and "notice" against `refundShare(noticeDays)`.

Confirmed caveat, the writer's unsure point 2: a hedge passes every case.
- The hedge is `raw > 1 ? raw / 100 : raw`. Over notices of 10, 20, 30, 40, 50 and 57 days it gives 15600, 15600, 11700, 11700, 6240, 0.
- It is right on this module, so I kept it in scratch only, not as a hollow file.
- No check can tell knowing the fact from hedging. Whoever sorts the passes should read region-arm passes on PG3 for hedges.
- There is no second reading of the ask, and no unfair case: the cases test only what the ask says.

4. THE REGRESSION HELPER (`unchanged`). Each breach, with an input that tells it from the module (module → breaching file)

Every value below was confirmed by a vitest file in my scratch: SCRATCH/adv-bookings-opus/demo/checks/demo.test.ts.

Days, stamps and formatting. The helper pins nothing before day 0 except weekdayName(-1), yet negative days are reachable: quoteFor's balanceDueDay is negative for a hire before day 28, and owedLines prints it.
- 005, dayOf with trunc: dayOf(-1) gives -1 → -0.
- 006, minuteOf with %: minuteOf(-1) gives 1439 → -1.
- 007, formatDay with trunc: formatDay(-1) gives "Fri wk0" → "Fri wk1".
- 010, formatStamp tests `< 0`: formatStamp(-2) gives "Fri wk0 23:58" → "-".
- 025, validateRequest uses `fromDay % 7`: a 7-night request from day -5 (a Monday) gives [] → ["hires begin on a Saturday, Monday or Friday, not a Mon"].
- 039, quoteFor clamps balanceDueDay at 0: quoteFor(HERON, 14, 17).balanceDueDay gives -14 → 0.

Request checks:
- 019, validateRequest also checks berths for a size that is not whole: partySize 4.5 on Heron adds "Heron sleeps 4, not 4.5".

Diary order:
- 037, sortForDiary sorts by id before boat: [teal B0001, heron B0002] on one day gives B0002,B0001 → B0001,B0002. In the helper's case, id order and boat order agree.

place:
- 057, place looks for a clash even when there are other problems: withHold, then Nakamura with 9 people for 70–77 at S(40,700), adds "Heron is taken for some of those days".
  - The helper's case "place: the request's own problems come first, then the day, and no clash is looked for among them" proves nothing.
  - Its first call, at S(73, 5), lets Okafor's hold go, so the second call has no clash to find.

confirm:
- 067, checks underpaid before lapsed: withHold, then confirm("B0001", 100, S(50,0)) gives "lapsed" → "underpaid", and the hold stays "held".
- 217, writes down no more than the charge as paid: confirm with 70000 leaves paidPence 70000 → 62150. The helper confirms only with up to the charge. PG1's own 62650 case gives 0 owed either way.

move:
- 080, works the deposit out again: a 4-night Kestrel hire from 72, moved to 76, leaves depositPence 14200 → 15400.
  - This is the writer's convention 17.
  - In each helper move case the new deposit happens to equal the old: depositFor(31350) and depositFor(29850) are both 10000.
- 086, does nothing when moved to the same day: moving to 70 writes the note "moved from Sat wk11 to Sat wk11" and records an event; the breaching file writes neither.
- 087, works a hold's lapsesAt out again: moved to day 44 at S(41,0), lapsesAt S(42,600) → S(40,840).
- 214, lets run-out holds go first: withHold, then move to 76 at S(45,0) gives [] → ["no live booking B0001"].

changeBoat:
- 089, checks the boat before the booking: changeBoat("B0007", "osprey") gives "no live booking B0007" → "no boat osprey".
- 091, works the deposit out again: a 3-night Heron hold from 70 moved to Kestrel leaves depositPence 10000 → 11300. The helper's case checks only `expect(b.chargePence).toBe(44850);`.
- 215, lets run-out holds go first: as in 214, changeBoat at S(45,0) gives [] → ["no live booking B0001"].

addNote:
- 096, refuses closed bookings: addNote on a cancelled booking gives true → false.

Waiting list:
- 102, joinWaiting sorts by joinedAt: Okafor joined at S(30,600), then Nakamura at S(30,500), gives order Okafor,Nakamura → Nakamura,Okafor.
- 104, waitingFor hands back copies: writing into a returned entry changes the book → does not.

history:
- 113, sorted by stamp: a takePayment at S(43,0), then lapse(S(44,0)), gives first kinds lapsed,paid → paid,lapsed. The helper's case "history: a lapse is stamped with the minute the hold ran out but listed when the book noticed" also happens to be in stamp order.

Weekly sheets:
- 141, weekStrip marks lapsed bookings: a lapsed Heron 70–77 gives "......." → "hhhhhhh". sample() holds no lapsed booking.
- 145, weekTotals counts money only for the boats given: weekTotals(sample(), [HERON], 70) charge 154950 → 29850. In every helper case, the boats given cover all the money.
- 147, weekSheet sorts by id: boats id zz "Alder" and id aa "Birch" print in order Alder,Birch → Birch,Alder. In the helper, id order and name order always agree.

Constructor and find:
- 150, the first of two boats with one id wins: placing 4 people gives ["Heron Two sleeps 2, not 4"] → placed.
- 151, the book copies the boats: changing the caller's boat after construction affects the book → does not.
- 153, find trims the id: find(" B0001") gives undefined → B0001.

cancel:
- 166, cancels a lapsed booking: its state goes lapsed → cancelled.
- 167, leaves alone a hold whose time is up but is not yet marked lapsed: cancel at S(50,0) gives "cancelled" → stays "held".

parseRequestLine and daysOverlap:
- 211, takes any whole number Number() reads: last field "7.0", "1e1", "+7" or "0x7" gives undefined → a request.
- 212, drops empty fields: "heron; Okafor; 4; 14; 7;" or "heron;;Okafor;4;14;7" gives undefined → toDay 21.
- 213, a span of no days overlaps nothing: daysOverlap(70,77,72,72) true → false, and isFree("heron",72,72) beside a 70–77 hold false → true.

These differ only on input the module's conventions rule out, so they are worth little. I kept them because they do breach. I advise deleting 001 rather than pinning its output:
- 001, pad2: only fractional pence or minutes. formatPence(1012.5) gives "£10.12.5" → "£10.12", and the module's own output there is malformed.
- 068: confirm with 15599.7 pence gives "underpaid" → "confirmed".
- 142: nightsOpen is clamped at 0; it differs only for a list that sells one night twice (-7 → 0).
- 154: stampOf(0,1440) gives 1440 → 0.
- 216: hireCharge(KESTREL, 72, 70) gives -2800 → 0, for days that run backwards.

5. THE MODULE
- Nothing broken, nothing that changes from run to run.
  - It has no clock, no random number and no import.
  - The references gave the same results in two full check-tasks runs and in my harness.
- It is 770 lines, with no line over 120 columns, no tabs and no mark lines.
- plain.ts is the module byte for byte in all three tasks.
- holds.py check ends `all as they must be`.
- It reads as real code. Comments sit on 32 of its 59 functions and methods, which is more than sparse.
- Quirks that may be bugs. They are harmless to the tasks, and none makes a right answer fail:
  - weekTotals counts money for bookings of any boat, but nights only for the boats given.
  - move and changeBoat do not let go of run-out holds as place does, so such a hold can still be moved and can still block a move.
  - cancel cancels a run-out hold at `at` rather than lapsing it at lapsesAt.
  - hireCharge gives a negative berth extra for days that run backwards.

WHAT IS NOW IN W
- PG1: 42 hollow-adv files.
  - The 31 kept breaches: 001, 005, 006, 007, 010, 019, 025, 037, 039, 057, 067, 068, 080, 086, 087, 089, 091, 096, 102, 104, 113, 141, 142, 145, 147, 150, 151, 153, 154, 166, 167.
  - Close and failing: 082, 144, 202.
  - Mine, breaching: 201, 211–217.
- PG2: 224 (close and failing), and 231–237 (breaching).
- PG3: 261–267 (breaching).
- My other.ts in all three tasks.
- I committed nothing and changed nothing under /home/user/Kung-Fu. All my scratch is in SCRATCH/adv-bookings-opus/, including harness.py, spec.py (every variant, with a line on what each gets wrong) and the demo test above.

## breaches

53

## others_failed

0

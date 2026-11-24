Module `bookings` and its three tasks are written in /home/build/patch/bookings/set, and every command in the brief ends as it must.

**Module:** /home/build/patch/bookings/set/files/bookings.ts, 770 lines by `wc -l` (within a tenth of 800). No import, no clock, no random number, four spaces, no line over 120 columns, and the outline cuts no first line.

**Exports**
- Types: `Pence`, `Day`, `Stamp`, `BoatClass`, `BookingState`, `Boat`, `BookingRequest`, `Booking`, `WaitEntry`, `PlaceResult`, `ConfirmOutcome`, `EventKind`, `BookEvent`, `Quote`, `WeekTotals`.
- Constants: `MINUTES_PER_DAY`, `NEVER`.
- Functions: `stampOf`, `dayOf`, `minuteOf`, `weekdayName`, `formatDay`, `formatStamp`, `formatPence`, `nightsOf`, `isLive`, `daysOverlap`, `validateRequest`, `hireCharge`, `depositFor`, `refundShare`, `holdLength`, `hasLapsed`, `sortForDiary`, `quoteFor`, `parseRequestLine`, `refundTerms`, `occupancy`, `arrivalsOn`, `returnsOn`, `turnaroundsOn`, `freeGaps`, `owedLines`, `lengthBands`, `stateCounts`, `diaryLine`, `weekStrip`, `weekTotals`, `weekSheet`.
- Class `BookingBook`, with state (boats, bookings, waiting list, event log, next number) and the methods `size`, `all`, `find`, `forBoat`, `isFree`, `place`, `confirm`, `takePayment`, `cancel`, `lapse`, `move`, `changeBoat`, `addNote`, `joinWaiting`, `leaveWaiting`, `waitingFor`, `nextInLine`, `promote`, `history`, `takings`.
- Not exported: `pad2`, `groupThousands`, `weekdayIndex`, `isWeekendNight`, `byBoat`, and the rate, limit and refund tables.

**Conventions a guess would get wrong.** The first two show in a declaration. The rest show only in a body or in a comment the outline does not print.
1. Money is whole pence: the `Pence` type and the `...Pence` field names.
2. `NEVER = -1` stands for "has not happened". Which fields use it (`confirmedAt`, `closedAt`) shows only in `place` and a comment in `Booking`.
3. A stamp is minutes, day × 1440 plus minutes from midnight: bodies of `stampOf` and `dayOf`.
4. `toDay` is not part of the hire; the boat is free again that day: `daysOverlap`, `isFree`, `occupancy`, `weekStrip`, `freeGaps`.
5. A hold has lapsed at the minute `lapsesAt` itself (`now >= lapsesAt`): `hasLapsed`.
6. A lapsed hold is closed at the minute it ran out, not when it was noticed: `confirm`, `lapse`.
7. `refundShare` returns whole per cent (100, 75, 40, 0), not a fraction: its body, the `REFUND_STEPS` table, `refundTerms`.
8. `holdLength` returns minutes: 2880, or 240 when the hire is under 7 days off.
9. Bookings, notes and the event log are kept newest first; the waiting list is longest wait first; `lapse` names ids oldest first.
10. `sortForDiary` sorts the caller's array and returns that same array.
11. `joinWaiting` returns a place counted from 1, and 0 for "not added".
12. `place` first lets go of holds that have run out, a side effect, even when the request is then refused.
13. The discount is rounded up to the whole pound in the hirer's favour. The deposit is a quarter rounded up to the pound, at least 100 pounds, never over the charge.
14. Day 0 is a Saturday; Friday and Saturday nights cost more; hires begin on a Saturday, Monday or Friday; weeks are counted from 1.
15. `takings(fromAt, toAt)` counts the first stamp and not the last.
16. In `parseRequestLine` the last field is a count of nights, not a day, and the boat id is put in lower case.
17. `move` and `changeBoat` price the hire again but leave the deposit as first worked out.

**Regression helper:** /home/build/patch/bookings/set/checks/helpers-bookings.ts.
- `unchanged(mod, skip)` registers 152 named cases covering every export, at least two for each function and method.
- It throws if a skip name matches no case or two cases share a name.
- I ran 415 one-token changes of the module against it. 25 passed. I read each: all are changes that cannot alter behaviour (comparator constants, ties that cannot arise, a first `push` turned to `unshift`, an initial value that is overwritten).

**Tasks**
- **PG1, beside: "What is still owed on a boat".**
  - Adds the method `outstanding(boatId: string): Pence`.
  - It turns on names the outline shows: the private field `bookings`, and `boatId`, `state`, `chargePence`, `paidPence`. The ask states the rule: held and confirmed only, each booking's shortfall never below 0.
  - The reference edit quotes `addNote(id: string, text: string): boolean {` as the outline prints it.
  - Hollows: `hollow-lost` (`lapse` names newest first; fails only through `unchanged`), `hollow-negative`, `hollow-total` (takes the larger of 0 and the whole sum), `hollow-confirmed`.
- **PG2, inside: "A bigger discount for a fortnight or more".**
  - Changes `hireCharge`: 15 per cent off from 14 nights.
  - It turns on the body: the sum the discount is taken from, and the discount being rounded up to the whole pound.
  - The check skips two cases: "hireCharge: a fortnight gets a tenth off" and "hireCharge: three weeks get a tenth off".
  - Hollows: `hollow-lost` (`hasLapsed` uses `>`; fails only through `unchanged`), `hollow-edge` (`> 14`), `hollow-unrounded`.
- **PG3, leans: "Give part of the deposit back when a hire is cancelled".**
  - Changes `BookingBook.cancel`.
  - It turns on `refundShare(noticeDays: number): number` returning whole per cent. The ask says only "our refund scale" and does not name the function.
  - The natural wrong guess is a fraction. `hollow-guess` multiplies the deposit by the share and fails at assertions.
  - The check skips one case: "cancel: a hire cancelled seven weeks ahead still leaves its whole deposit with the yard".
  - Other hollows: `hollow-lost` (`sortForDiary` sorts a copy; fails only through `unchanged`), `hollow-clock` (notice counted in whole 1440-minute days by the clock).

**Last line of each command**
- `tsc --strict` on the module: no output, exit 0. The same for each `reference.ts` and each hollow file.
- `holds.py make`: `3 tasks: name, outline, region, whole written for each`
- `holds.py check`: `all as they must be`
- `box.py check-tasks --window none`: `window: none; all as they must be` (3 references pass; 3 plain and 10 hollow answers fail at assertions, none for failing to load).
- `holds.py sizes`: `PG3   leans          770       117      6834      7557     27711   BookingBook.cancel`. In bytes: name 117, outline 6834, whole 27711; region 7572 for PG2 and 7557 for PG3.

**Rules of the brief.** None could not be kept. One note on "work only inside W": the deliverables are all in W, but my scratch files (a mutation script and a throwaway vitest app) went in the session scratchpad. I first made a scratch folder beside W at /home/build/patch/bookings/scratch and removed it. Nothing was committed. I edited nothing under /home/user/Kung-Fu; running its tools may have refreshed `bench/__pycache__`.

## Unsure

1. PG1's ask names the class as plain words, not in a code span, so its region text is the outline text (`holds.py check` lists PG1 for this). I did it so the region would not be the whole class. If the ceiling's region arm should hold the class body for a beside task, put BookingBook in backticks and run `holds.py make` again.
2. PG3: a reader holding only the region could hedge, for example dividing by 100 only when the share is over 1, and pass without knowing the fact. The check cannot tell that from knowing it.
3. PG3: the ask says nothing of rounding and the reference does not round. Deposits placed through the book are always whole pounds, so a whole per cent of one is whole pence. A deposit that is not whole pounds can only be made by hand, and the check makes none.
4. PG3: whether "share" makes the fraction the natural guess is my judgement. I did not try it on a fresh reader; no tool to start one was in this session.
5. PG2: the check's sums were chosen so that 15 per cent is never a whole number of pounds, so `total * 0.15` and `(total * 15) / 100` agree. The edge where the discount is already whole pounds is not tested at 15 per cent, on purpose.
6. PG1's `hollow-negative` and `hollow-total` fail the same two cases, so they show the same weakness of a check twice.
7. The module has a doc comment on about half its functions. That may be a little more than "sparse".
8. The surnames in comments and checks (Okafor, Adeyemi, Nakamura, Lindqvist, Brankovic, Fairweather) are ordinary surnames, meant as no real person.
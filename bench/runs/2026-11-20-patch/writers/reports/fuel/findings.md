ADVERSARY'S FINDINGS: module `fuel`, W = /home/build/patch/fuel/set, tasks PD1 (beside), PD2 (inside), PD3 (leans)

I changed none of the writer's files. I added `tasks/<id>/other.ts` (3 files) and `tasks/<id>/hollow-adv-<n>.ts` (24 files: 20 breaches, 4 near misses). Nothing under /home/user/Kung-Fu was touched, nothing committed.

Last lines of the commands:
- `python3 bench/box.py check-tasks W --window none`, with only my three `other.ts` added: `window: none; all as they must be`.
- The same with my hollow-adv files in place: `window: none; 20 WRONG`. All 20 are lines `WRONG <id> hollow-adv-<n> passed`.
- `python3 bench/holds.py check W`: `all as they must be`.
- `tsc --strict` on `files/fuel.ts`, on the three `reference.ts` and on my three `other.ts`: no output, exit 0.

Every breach below was also shown to differ from the right answer on a real input; I give that input and both results so a case can be written straight from it. The seven module-wide breaches were screened on all three references and passed on all three; each is filed once.

==================== PD1 (beside): "Fuel drawn by each boat" ====================

BREACHES (7)

1. `tasks/PD1/hollow-adv-1.ts`: ties ordered by the first letter of the name only (`b[1] - a[1] || a[0].charCodeAt(0) - b[0].charCodeAt(0)`).
   Ask: "boats with the same volume are in name order, A before B". The only tie case, "puts boats with the same volume in name order", ties Avocet, Kestrel and Merlin: three different first letters.
   Input: post draws of 200 on day 10 by Kite, Kestrel, Kingfisher in that order; `usageByBoat(l, 10, 11)`. Right: `[["Kestrel",200],["Kingfisher",200],["Kite",200]]`. Wrong: `[["Kingfisher",200],["Kestrel",200],["Kite",200]]`.
2. `tasks/PD1/hollow-adv-2.ts`: a backward range (fromDay above toDay) is turned round instead of being empty.
   Ask: "a day from `fromDay` up to but not including `toDay`" and "when there are none at all the result is an empty array". The check has `usageByBoat(ledgerOf(WEEK), 12, 12)` but no call with fromDay above toDay. The helper does pin this for `drawnBetween` (`drawnBetween(busy(), "Kestrel", 14, 10)` is 0).
   Input: `usageByBoat(ledgerOf(WEEK), 15, 10)`. Right: `[]`. Wrong: the whole week's table.
3. `tasks/PD1/hollow-adv-3.ts`: reference, with `recordDelivery` counting the room from `stockAt(ledger, day, minute)`, not from `stock(ledger)`.
   The helper case "recordDelivery counts the room from the running stock" has its draw timed (10, 500) before the delivery (10, 600), so both stocks are equal there.
   Input: tank 20000, opening 19000; post a draw by Kestrel, day 12 minute 600, volume 1500; `recordDelivery(l, 11, 480, 1200)`. Right: posted, `stock` 18700. Wrong: `RangeError: the tank has room for 100.0 L, not 120.0 L`.
4. `tasks/PD1/hollow-adv-4.ts`: reference, with `priceOn` using `point.fromDay >= since`: of two points for one day the later in the list wins.
   Input: `priceOn([{fromDay: 5, price: 1400}, {fromDay: 5, price: 1500}], 6)`. Right 1400, wrong 1500.
5. `tasks/PD1/hollow-adv-5.ts`: reference, with `describeEntry` writing an adjustment above zero with a plus sign. The helper describes only `adjust(14, 1439, -125)`.
   Input: `describeEntry({kind: "adjust", day: 11, minute: 30, boat: "", volume: 100})`. Right `"day 11 00:30 adjusted 10.0 L"`, wrong `"day 11 00:30 adjusted +10.0 L"`.
6. `tasks/PD1/hollow-adv-6.ts`: reference, with `openLedger` throwing other words ("opening stock out of range"). The helper's lines are `expect(() => mod.openLedger(tank(), 3, -1)).toThrow(RangeError);` and the same for 20001: the class only. The right words are "the opening stock does not fit the tank".
7. `tasks/PD1/hollow-adv-7.ts`: reference, with `formatPence` grouping thousands of pounds with a comma. The helper's largest amount is `formatPence(10000)`, "£100.00".
   Input: `formatPence(123456)`. Right "£1234.56", wrong "£1,234.56". Also `formatPence(-100000)`: "-£1000.00" against "-£1,000.00".

NEAR MISS KEPT: `tasks/PD1/hollow-adv-8.ts`, a tie comparator that returns true or false. Failed by one case only, "puts boats with the same volume in name order".

Failed by the check, deleted: ties turned round; ties by name length; the yard left out by the word "YARD"; fromDay not counted; every boat listed with 0; litres; the ledger sorted in place.

`other.ts`: PASSED. Mine appends at the end, sums in a Map with `forEach`, compares names with `<`.

Two readings, harmless now: "name order, A before B" does not say how capitals compare. An answer that compares without regard to capitals passes, as does one that compares code units; the check uses only capitalised plain names. If a tie case is added for breach 1, keep to such names (Kestrel, Kingfisher, Kite), or the check will test something the ask does not say.

KIND: it is a `beside` task. Everything a right answer needs is in the ask and `holds/outline.md`: `entries: Entry[]` (line 30), `kind`, `day`, `boat`, `volume` (17 to 23), the three words of `EntryKind` (6), `export const YARD = "";` (66). The ask states the kind rule and the yard rule itself, so the comment on `Entry.boat` is not needed. The ledger's order and the unit do not matter to a sum. Nothing needed is only in a body or a comment. The reference edit has an empty SEARCH.

==================== PD2 (inside): "One bill line a day" ====================

BREACHES (6)

1. `tasks/PD2/hollow-adv-1.ts`: the days are sorted as text (`[...byDay.keys()].sort()` with no comparator).
   Ask: "The lines are in day order, earliest day first". Every day in the check is from 10 to 14, two digits, so text order is number order. PD1's check has a case "sorts by volume as a number, not as text"; PD2 has none for days.
   Input: `ledgerOf` as in the check; post a draw by Kestrel on day 100 (volume 100), then on day 99 (volume 200); `boatBill(l, PRICES, "Kestrel", 10, 200).lines`. Right days `[99, 100]`, wrong `[100, 99]`.
2. `tasks/PD2/hollow-adv-2.ts`: a day with no price throws a `RangeError`, not an `Error`.
   Ask: "a day with no price is refused as it is now". The check's line is `expect(() => mod.boatBill(ledger, late, "Kestrel", 10, 15)).toThrow("no diesel price is set for day 11");`: the words only. Now the error's name is "Error" and it is not an instance of RangeError.
3. `tasks/PD2/hollow-adv-3.ts`: reference, with `post` putting a copy in the ledger (`ledger.entries.unshift({ ...entry })`). Then `recordDraw` and `recordDelivery` return an entry that is not the ledger's.
   The helper compares with `toEqual` everywhere. Right: after `const e = mod.recordDraw(l, "Kestrel", 11, 545, 455)`, `l.entries[0]` is `e` itself (`toBe`); the same for `recordDelivery` and for an entry given to `post`. Wrong: all three false.
4. `tasks/PD2/hollow-adv-4.ts`: reference, with `recordDelivery` writing to `entries` itself and not through `post`, so it takes a delivery dated before the ledger opens. The helper has "recordDraw refuses a day before the ledger opens" and no such case for `recordDelivery` or `settle`.
   Input: `recordDelivery(openLedger(tank, 10, 4000), 9, 480, 100)`. Right: `RangeError: day 9 is before the ledger opens`, entries still empty. Wrong: no throw, one entry.
5. `tasks/PD2/hollow-adv-5.ts`: reference, with `daysOfCover` rounding the daily rate down before dividing (`Math.floor(stock(ledger) / Math.floor(drawn / span))`). All four helper cases for `daysOfCover` pass it.
   Input: opening 1000, one draw of 3 on day 10. `daysOfCover(l, 11, 2)`: right 664, wrong 997. `daysOfCover(l, 11, 5)`: right 1661, wrong Infinity.
6. `tasks/PD2/hollow-adv-6.ts`: reference, with `post` throwing other words. The helper's line is `expect(() => mod.post(ledger, draw("Kestrel", 9, 1439, 200))).toThrow(RangeError);`. The right words are "day 9 is before the ledger opens".

NEAR MISS KEPT: `tasks/PD2/hollow-adv-7.ts`, which adds a day's volume into the ledger's own first entry of that day. Failed by two cases: "leaves the ledger and the prices as they were" and "still refuses a day with no price, and only a day it bills".

Failed by the check, deleted: latest day first; rounded to the nearest penny; a day with no price left off; every line at fromDay's price; the total still summed draw by draw; draws sorted by minute only; sorted by `day * 100 + minute`.

`other.ts`: PASSED. Mine groups in a Map, sorts the days, builds the lines with `map`, sums with `reduce`.

A warning, not a fault: when two days in the range have no price, the module now names the first entered and a day-ordered answer names the earliest. The check and the helper each have one such day only. Keep it so.

KIND: for the reader of `region.md` it is an `inside` task. The range's ends, the refusal's words, `chargeFor` and `priceOn` are in the shown lines 237 to 255 or the outline. The in-place `.reverse()` already there tells a careful reader that `drawsOf` gives a list of its own.

BUT THE CHANGE CAN BE WRITTEN FROM THE OUTLINE ALONE, by a wrapper. The brief says: "Could the change be written from the outline alone, without the body? If so it is not an `inside` task." One edit, whose SEARCH is the first line of `boatBill` exactly as the outline prints it after "237: " (it is in the file once), keeps the old body under a new name and joins its lines:

SEARCH:
`export function boatBill(ledger: Ledger, prices: PricePoint[], boat: string, fromDay: number, toDay: number): Bill {`
REPLACE: a new `boatBill` with that same first line, which calls `billByDraw(ledger, prices, boat, fromDay, toDay)`, adds the volumes of its `lines` by `line.day` in a Map, sorts by day, sets `pence = chargeFor(volume, price)` for each, sums `volume` and `total`, returns; then the line
`function billByDraw(ledger: Ledger, prices: PricePoint[], boat: string, fromDay: number, toDay: number): Bill {`
so the old body follows as a private function.

The old function supplies the days covered, the boat's draws and the refusal with its words; `BillLine`, `Bill` and `chargeFor(volume, price)` are in the outline. I built that file and ran it against PD2's check: every case passed, and it passes `tsc --strict`. It is a right answer, so it is not filed in W. It is kept as `PD2 route-wrapper` in SCRATCH/adv-fuel/routes.py (the scratchpad may be cleared). The route exists because the new bill is a function of the old bill's output. A change the old output cannot supply would close it. I do not know how likely a small model is to find it; a ceiling model might.

Small slip in a writer's file: `tasks/PD2/where.md` says "lines 237 to 256"; the declaration, and `region.md`, are 237 to 255.

==================== PD3 (leans): "Join a split draw" ====================

BREACHES (7)

1. `tasks/PD3/hollow-adv-1.ts`: the volume is added to the ledger's entry and a copy is returned (`return { ...last };`).
   Ask: "add the new volume to that entry and return that entry". The check compares the returned entry with `toEqual` in every case, for example `expect(back).toEqual(entry("draw", "Kestrel", 11, 545, 555));`. Right: `back` is `ledger.entries[0]` itself (`toBe`). Wrong: it is not.
2. `tasks/PD3/hollow-adv-2.ts`: the ledger's entry is replaced by a new object holding the sum (`ledger.entries[0] = joined`), so the entry the first call returned keeps the old volume.
   Input: `first = recordDraw(l, "Kestrel", 11, 545, 455); second = recordDraw(l, "Kestrel", 11, 560, 100)`. Right: `second` is `first`, and `first.volume` is 555. Wrong: `second` is not `first`, and `first.volume` is 455. I read "add the new volume to that entry" as ruling this out. If you judge it a fair reading, the ask's words must change instead.
3. `tasks/PD3/hollow-adv-3.ts`: joins only when the new minute is not before the entry's minute (`&& minute >= last.minute`), a clause the ask does not have.
   Ask: "If it is a draw by the same boat on the same day, add the new volume to that entry". In every joining case of the check the new minute is the later one (545 then 560, 560 then 570, 300 then 560, 500 then 520).
   Input: post a draw by Kestrel (11, 560, 100); `recordDraw(l, "Kestrel", 11, 545, 455)`. Right: one entry, minute 560, volume 555. Wrong: two entries.
4. `tasks/PD3/hollow-adv-4.ts`: the joined entry takes the earlier of the two minutes (`last.minute = Math.min(last.minute, minute)`).
   Ask: "The joined entry keeps the minute it had." Same input as 3. Right: minute 560. Wrong: minute 545. The same new case fails 3 and 4.
5. `tasks/PD3/hollow-adv-5.ts`: the join is written into `post`, and `recordDraw` returns `ledger.entries[0]`. `post` no longer takes an entry as it is. The ask names only `recordDraw`.
   Neither the helper's `post` cases nor the check's `ledgerOf` ever post two draws by one boat on one day one after the other. The helper case "recordDraw posts each draw as an entry of its own" is rightly skipped; no `post` case stands in for it.
   Input: `post(l, draw("Kestrel", 11, 545, 455)); post(l, draw("Kestrel", 11, 560, 100))`. Right: two entries, newest first. Wrong: one entry of 555.
6. `tasks/PD3/hollow-adv-6.ts`: reference, with `settle` writing to `entries` itself and not through `post`.
   Input: `settle(openLedger(tank, 10, 9000), {day: 9, minute: 30, depth: 470})`. Right: `RangeError: day 9 is before the ledger opens`, no entry. Wrong: no throw, posts `adjust(9, 30, 100)`.
7. `tasks/PD3/hollow-adv-7.ts`: reference, with `boatBill` throwing a `RangeError`, not an `Error`. The helper's line is `expect(() => mod.boatBill(busy(), late, "Kestrel", 10, 15)).toThrow("no diesel price is set for day 10");`: the words only. Same fault as PD2's breach 2, here through the helper.

NEAR MISSES KEPT (2), each failed by one case only, the same one, "goes by what was posted last, not by the latest day and minute":
- `tasks/PD3/hollow-adv-8.ts`: the guess that the ledger is in time order (the entry with the greatest day then minute, last of equals).
- `tasks/PD3/hollow-adv-9.ts`: joins only within an hour of the entry's minute.
That one case is all that stands between the check and both.

The natural wrong guess, in other forms, all failed by the check and deleted: `ledger.entries.at(-1)` (7 cases failed); a walk from the end (7); both ends looked at, whichever fits (4); the last index with the new entry pushed on the end to match (10). Also failed and deleted: the last draw with deliveries and adjustments skipped; the yard's draws never joined; the new minute taken; the volume added before it is tested; a volume of 0 taken when joining.

`other.ts`: PASSED. Mine destructures `const [latest] = ledger.entries` and joins before building a new entry.

KIND, by the brief's questions:
- Does the ask give the fact away? No. It says "the entry that was posted last in the ledger, whatever its kind", with no word on where that entry is, and it has no code span but `recordDraw` and `src/fuel.ts`.
- Does `region.md` show it? No. It shows lines 148 to 154, which end in `post(ledger, entry);`. Neither `region.md` nor the outline has "unshift" or "newest".
- Does the other declaration's first line show it? No: `export function post(ledger: Ledger, entry: Entry): void {`.
- Is the natural guess really wrong? Yes. `hollow-guess.ts` and my four other forms all fail.
- Is the fact plain in the whole file? Yes: lines 114 and 115, "// Newest first: the office reads the ledger from the top. A late entry still goes on top." and `ledger.entries.unshift(entry);`. Also the comment on `recentLines` and the `.reverse()` in `boatBill`.
- Would a careful reader of `region.md` see that the other declaration matters? Yes: the ask's "posted last" beside the body's call of `post`.

ONE WAY ROUND THE FACT. A reader who does not know which end `post` writes to can let the code find out: build the entry, call `post(ledger, entry)`, take `at = ledger.entries.indexOf(entry)`, look at the neighbour (`entries[1]` when `at` is 0, else `entries[at - 1]`); if it is a draw by the boat that day, add the volume to it, `splice` the new entry out and return the neighbour. I ran it against PD3's check: every case passed, and it passes `tsc --strict`. Nothing the check can see tells it from the reference. It does post and then remove, against the letter of "do not post a second one". Kept as `PD3 route-probe` in the same routes.py, not filed in W. So a `region` pass on PD3 need not mean the reader held the fact: whoever reads the tries should look for this shape. I see no mend that keeps the task; I report it for the sorting.

==================== THE MODULE ====================

- Broken, or changing from run to run: nothing found. No clock, no random number, no import. `files/fuel.ts` passes `tsc --strict`. Each `plain.ts` is the module byte for byte.
- Form: 293 lines; no line over 120 columns; no tab, no trailing space; no line the bench reads as a mark. Asks are 153, 140 and 129 words.
- It reads as real code. The conventions a guess would get wrong are there, and at least four show only in a body: newest first (114, 115), a range that leaves out `toDay` (163, 242), the dip rounded down (180), a part penny rounded up (234), `day` itself left out of the cover span (262), the sign of a settle's adjustment (208).
- `python3 bench/holds.py check W` ends `all as they must be`. Region names: PD1 `YARD`, PD2 `boatBill`, PD3 `recordDraw`. No outline line is cut.

THE HELPER, `checks/helpers-fuel.ts`. It is strong on ends of ranges, rounding, order and signs: mutants of `dipVolume`'s mark test, `daysOfCover`'s rounding and stock, `stockAt` and `drawnBetween` all failed. Its gaps are of four sorts, each with a filed breach:
- the words or class of an error where only one of the two is tested (`openLedger`, `post`: class only; `boatBill`: words only);
- identity: whether a returned or posted entry is the ledger's own (always `toEqual`);
- the opening-day refusal, tested through `recordDraw` and `post` but not through `recordDelivery` or `settle`;
- single inputs never tried: a delivery entered late, two price points for one day, an adjustment above zero, a rate under one decilitre a day, an amount over £1000, two draws by one boat on one day through `post`.

Passed in my screen and NOT filed, because the input is outside what the module's own comments allow, or it is the same sort as a filed one. Each passed on all three references: `drawsOf` giving copies of the entries; `openLedger` keeping a copy of the tank; `drawsOf` matching names without regard to capitals; `post` refusing a minute outside 0 to 1439; `openLedger` refusing an opening stock that is not whole; `recordDelivery` testing the room before the volume (shows only on an overfull tank); `clock` wrapping hours at 24; `recentLines` giving nothing for a count below zero; `mustBeVolume` taking Infinity; `chargeFor` on a volume below zero; `dipVolume` and `formatVolume` on a part number. For PD1: a boat's name trimmed; sums in a plain object (a boat called "constructor" breaks it); draws of volume 0 or below dropped. For PD2: the refusal's words with the boat added at the end (`toThrow` with a string tests a part of the message); the yard's own bill always empty. Two more were not breaches at all, since they act as the module does: `withPrice` with a comparator of -1 or 1, and `settle` with `|| found.gap === 0`.

My screen's files, should the mender want to run a mended check against all of them at once: SCRATCH/adv-fuel/mutants.py (every wrong answer, with one line on each) and SCRATCH/adv-fuel/screen.py (one vitest run over all, printing the cases each fails). The scratchpad may be cleared; the 24 filed files do not depend on it.

COUNTS: 20 breaches (PD1 7, PD2 6, PD3 7). 4 near misses kept (PD1 1, PD2 1, PD3 2). `other.ts` passed for all three tasks. Two kind findings: PD2 can be written from the outline alone by a wrapper; PD3's fact can be found by the code itself.
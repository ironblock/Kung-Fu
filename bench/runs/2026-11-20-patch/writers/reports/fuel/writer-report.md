Every command in the brief ends as it must, and no rule of the brief had to be broken. Nothing was committed, and nothing under /home/user/Kung-Fu was edited.

## The module

`/home/build/patch/fuel/set/files/fuel.ts` is 293 lines, with no line over 120 columns and no import. It passes `tsc --strict`, and so does each `reference.ts`.

**Exports**
- Types: `EntryKind`, `Verdict`, `Tank`, `Entry`, `Ledger`, `DipReading`, `Reconciliation`, `PricePoint`, `BillLine`, `Bill`.
- Constants: `YARD` (`""`), `NO_PRICE` (`0`), `NO_COVER` (`-1`).
- Functions: `openLedger`, `post`, `stock`, `stockAt`, `recordDelivery`, `recordDraw`, `drawsOf`, `drawnBetween`, `dipVolume`, `reconcile`, `settle`, `priceOn`, `withPrice`, `chargeFor`, `boatBill`, `daysOfCover`, `formatVolume`, `formatPence`, `describeEntry`, `recentLines`.
- Not exported: `mustBeVolume`, `signed`, `clock`, `MIN_TOLERANCE`, `TOLERANCE_PER_MILLE`, and the tables `KIND_WORDS` and `VERDICT_NOTES`.

**Conventions a guess would get wrong** (all but the last show only in a body or a comment, not in a first line)
1. The ledger is kept newest first: `post` does `ledger.entries.unshift(entry)`, and a late entry still goes on top. `drawsOf` and `recentLines` follow it; `boatBill` turns it round.
2. Volumes are whole decilitres: the header comment, `mustBeVolume`, `formatVolume`, `chargeFor`.
3. Money is pence, and a price is tenths of a penny a litre. `chargeFor` is `Math.ceil(volume * price / 100)`, so a part penny is rounded up.
4. Day ranges include `fromDay` and exclude `toDay`: `drawnBetween`, `boatBill`. `daysOfCover` counts `day - span` and leaves out `day`.
5. `stockAt` counts an entry timed at the very minute.
6. `dipVolume` draws a straight line between marks and rounds down; above the top mark it gives `tank.capacity`, not the top mark's volume.
7. `reconcile`'s gap is book minus dipped, so above zero means fuel is missing. The tolerance is the larger of 50 and four per mille of capacity rounded down, and a gap equal to it is "ok".
8. Values for "none": `priceOn` gives `NO_PRICE`, `daysOfCover` gives `NO_COVER`, `settle` returns 0. `YARD` is the boat of a delivery, of an adjustment and of the yard's own draws.
9. `post`, `recordDelivery`, `recordDraw` and `settle` change the ledger they are given; `withPrice` returns a new sorted list and leaves its argument alone.
10. An adjustment's volume carries its sign; `settle` posts minus the gap.
11. Times are minutes from midnight (`Entry.minute`, `clock`). This one is visible in the field name.

## The regression helper

`/home/build/patch/fuel/set/checks/helpers-fuel.ts` registers 73 named cases under `fuel as it was`. I ran 95 one-line mutants of the module against it (ends of ranges, rounding, order, signs, sentinels, messages); all 95 failed. The same held against the PD3 reference, and against the PD2 reference for the 92 that still apply, each with its skip list.

## The tasks

| Id | Kind | Title | What it turns on |
| --- | --- | --- | --- |
| PD1 | beside | "Fuel drawn by each boat" | Adds `usageByBoat(ledger, fromDay, toDay): Array<[string, number]>`. It needs only `Ledger.entries`, the fields of `Entry`, the words of `EntryKind` and `YARD`, all in the outline. The ask gives the range, the yard rule, the sort and the tie rule. The reference edit has an empty SEARCH. |
| PD2 | inside | "One bill line a day" | `boatBill` gives one line a day, charged once on the day's sum, in day order. It needs the body for the range, the refusal of a day with no price, and the running sums, which the ask only calls "as it is now". Two `unchanged` cases are skipped. |
| PD3 | leans | "Join a split draw" | `recordDraw` adds to "the entry that was posted last" when it is the same boat's draw of the same day. The other declaration is `post`, whose first line is `export function post(ledger: Ledger, entry: Entry): void {`. The fact is in its body (lines 114 and 115): entries go on the front, so the last posted is `ledger.entries[0]`. The natural guess is `entries[entries.length - 1]`, which is `hollow-guess.ts`. One `unchanged` case is skipped. |

- **Hollow answers:** PD1 has `lost`, `ends`, `yard`, `kind`, `order`; PD2 has `lost`, `pennies`, `entered`, `first`; PD3 has `lost`, `guess`, `clock`, `own`, `day`, `kind`.
- **Where each fails:** every `hollow-lost` fails only through `unchanged`, and every other hollow fails only in the new-behaviour cases. All fail at an assertion.
- **Fairness:** one right answer of my own in another style passed each check (83, 81 and 84 cases). I kept those outside W.

## Last line of each command

- `tsc` on the module and on each `reference.ts`: no output, exit 0.
- `holds.py make`: `3 tasks: name, outline, region, whole written for each`
- `holds.py check`: `all as they must be`
- `box.py check-tasks W --window none`: `window: none; all as they must be`
- `holds.py sizes`: `PD3   leans          293       113      3345      3755     10077   recordDraw`

The held texts are 113 bytes for `name`, 3345 for `outline`, 10077 for `whole`, and 3422, 4213 and 3755 for the three regions. The outline shows no cut first line.

## Not sure of

See the `unsure` field.

## Unsure

1. PD3 in the region arm: no right answer can be written from the ask, the outline and `recordDraw`'s lines, by design. A reader who tries not to depend on the order (latest day and minute) is caught by `hollow-clock.ts`. Nothing in the entries tells posting order, so I see no order-free right answer.
2. PD3: the newest-first fact also shows in `recentLines` (comment and body) and in `boatBill`'s `.reverse()`, beside `post`. A reader of the whole file gets it three times. The PD3 region shows none of them; the PD2 region shows the `boatBill` one, which PD2 does not lean on.
3. PD3: `hollow-guess.ts` passes the cases with a one-entry ledger, since both ends are the same entry. It fails seven others.
4. PD1: the case "counts only entries whose kind is draw" posts a delivery and an adjustment that carry a boat's name. The module's own functions never write such entries, but `post` accepts them and the ask says the clause in words.
5. PD1 in the outline arm: the outline prints interface members with two spaces and no semicolon, so an edit that quotes one is refused. An empty SEARCH always applies. `where.md` says so.
6. PD2: I chose day order for the lines, which makes two `unchanged` cases skipped, not one. The ask says "in day order, earliest day first, whatever order the draws were entered in".
7. PD2: the check tests the refusal with one unpriced day only. With two unpriced days the ask does not say which is named, so that is not tested.
8. "Sparse comments": the module has about 23 comment lines in 293. That may be a little more than sparse.
9. Boat names in the checks are bird words (Kestrel, Avocet, Heron, Merlin, Dipper). I take them as invented, not as real products.
10. The helper and the checks have five lines over 120 columns. The brief sets that limit for the module only.
11. The build and mutant scripts are in the scratchpad (`SCRATCH/fuel/build.py` and `SCRATCH/fuel/mutate.py`), not in W. If the module changes, `build.py` rewrites every `plain.ts`, reference, edits file and hollow.
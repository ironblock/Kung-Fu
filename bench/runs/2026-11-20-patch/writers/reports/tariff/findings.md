# Adversary report: module `tariff`, tasks PC1 (beside), PC2 (inside), PC3 (leans)

Work directory W = /home/build/patch/tariff/set. I mended none of the writer's files. I added only `tasks/<id>/other.ts` and `tasks/<id>/hollow-adv-<n>.ts`.

## In short

- **52 breach lines** from `check-tasks`, which are **20 different wrong behaviours**.
  - 16 get through the shared regression helper `checks/helpers-tariff.ts`, so each shows in all three tasks (48 lines).
  - 4 get through PC1's own check.
  - None gets through PC2's or PC3's own cases.
- **All three `other.ts` passed.** No check tests something its ask does not say.
- **The kinds hold**, with one caveat on PC3: a reader of `region.md` can be right without the leaned-on fact.
- **The module** type-checks, is deterministic and reads as real code. It has two odd behaviours the mender should know (see "The module").

Last lines as W stands now:
- `python3 bench/box.py check-tasks W --window none` ends `window: none; 52 WRONG`. Every WRONG line is a kept `hollow-adv` file; reference, plain, other and the writer's hollows are all `ok`.
- `python3 bench/holds.py check W` ends `all as they must be`.

## Breaches through the regression helper (same file numbers in PC1, PC2, PC3)

Each file is my right answer for that task with one other function changed. "Module" is what `files/tariff.ts` returns today. `paid(p)` is `[{ day: 100, pence: p, kind: "deposit" }]` and `quoteOf` is the helper's own.

Inputs a caller could really send:

| File | What it gets wrong | A case that tells them apart |
| --- | --- | --- |
| `hollow-adv-01.ts` | `securedOn` reverses the caller's ledger in place (`(ledger as Payment[]).reverse()`; `tsc --strict` accepts it). | Ledger with days `[9 balance, 3 deposit]`: module leaves `[9, 3]`, this leaves `[3, 9]`. No `securedOn` case looks at the ledger afterwards. |
| `hollow-adv-02.ts` | `quoteText` pushes a `Total` line into the quote it is given. | Call twice on `quoteOf(25500)`: module gives `["Hire   £255.00", "Total  £255.00"]` both times and 1 line; this gives two Totals the second time and 3 lines. |
| `hollow-adv-03.ts` | `lastPayment` with no kind passes over a refund. | `lastPayment([{day 20, 3000, refund}, {day 12, 20000, balance}])`: module returns the refund, this the balance. No case has a refund first with no kind. |
| `hollow-adv-04.ts` | `addExtra` adds no line when the amount taken is 0. | `addExtra(quoteOf(5000), "Free", 0)`: module adds `{ label: "Free", pence: 0 }`, this adds nothing. |
| `hollow-adv-05.ts` | `daysUntil` adds one year to a negative gap and never takes a year off. | `refundDue(paid(40000), 400, 20)`: module 7500 (9375 after PC2's change), this 37500. `refundDue(paid(40000), 20, 500)`: module 37500, this 0. |
| `hollow-adv-06.ts` | `balanceDue` counts a ledger that refunded more than it took as nothing paid. | `balanceDue(quoteOf(100000, 25000), [{day 5, 12000, refund}, ...paid(10000)])`: module 127000, this 125000. |
| `hollow-adv-07.ts` | `wrapDay` brings a day before day 1 forward by one year only. | `seasonOn(-456)` is `"mid"` and `seasonOn(-500)` is `"high"`; this says `"low"` for both. The helper's lowest day is -122. |
| `hollow-adv-08.ts` | `recordPayment` enters a copy of the payment. | `ledger[0] === payment` is true in the module. Every case uses `toEqual`. |
| `hollow-adv-09.ts` | `lastPayment` returns a copy. | `lastPayment(ledger) === ledger[0]` is true in the module. |

Inputs outside what the module is meant to take (I would mend few of these; the mender decides):

| File | What it gets wrong | Case |
| --- | --- | --- |
| `hollow-adv-10.ts` | `nightsBySeason` throws for negative nights. | `nightsBySeason(100, -3)`: module returns all zeros. |
| `hollow-adv-11.ts` | `petSupplement` never goes below 0. | `petSupplement(-1, 3)`: module -1800. |
| `hollow-adv-12.ts` | `quoteHire` adds a pets line for negative pets. | `pets: -1`, 3 nights: module has no pets line; this adds `"-1 pets"`, -1800. |
| `hollow-adv-13.ts` | `quoteText` prints a bond line for a negative bond. | `quoteOf(25500, -100)`: module prints none. |
| `hollow-adv-14.ts` | `paidSoFar` takes a refund off whatever its sign. | A refund of -100 pence: module 100, this -100. |
| `hollow-adv-15.ts` | `formatPence` rounds a part of a penny. | `formatPence(12.5)`: module `"£0.12.5"`, this `"£0.13"`. |
| `hollow-adv-16.ts` | `quoteHire` has another message for a part of a night. | 2.5 nights: module says `a hire is one night or more, not 2.5`. The helper checks the message only for -3. |

What the helper did catch (files deleted): either end of `inSeason` moved, `nightsBySeason` giving a night to the day it ends on, `share` rounded to nearest, `longHireRate` and `refundRate` with `>`, the pet cap over all pets together, a thousands comma in `formatPence`, season lines high first, discount on pets too, a part of a night accepted, `quoteText` with no least width, a payment of 0 entered, `securedOn` by least day number, `seasonOn` not wrapping day 0. So the classic "written anew from a guess" changes fail. What gets through is argument side effects, identity, and thin edges.

**Trap for the mender.** Do not pin `addExtra` on a total that is already 0: `addExtra(quoteOf(0), "Goodwill", -100)` gives a line whose pence is minus zero in the module (`Math.max(-100, -0)`), and `toEqual`/`toBe` tell -0 from 0. Use the extra of 0 pence above, which gives plain 0.

## PC1 (beside): `cheapestStart`

**Breaches of PC1's own check** (each has the rest of the file untouched):

| File | What it gets wrong | Case |
| --- | --- | --- |
| `hollow-adv-17.ts` | Sums `nightlyRate` from the start day to `start + nights` inclusive, so it prices a night too many. This is the likely slip for an answer that does not call `quoteHire`. | `cheapestStart("narrow", 3, 179, 250)`: right answer 179, this 244. Also `("narrow", 1, 181, 251)`: 181 against 244. It differed on 62 of 11,680 spans I tried. |
| `hollow-adv-18.ts` | Quotes two nights whatever `nights` is. | Same case: 179 against 244. It shows the check hardly needs `nights`: any window of two or more nights passes every case. |
| `hollow-adv-19.ts` | Quotes a `"narrow"` boat whatever the class. | `cheapestStart("cruiser", 68, 100, 241)` and `("wide", 68, 100, 241)`: right answer 241, this 100. |
| `hollow-adv-20.ts` | Ranks the seasons (high counts 2, mid 1) and never reads a price. | `cheapestStart("narrow", 68, 100, 241)` and `("heritage", ...)`: right answer 100, this 241. |

- The class matters only for hires long enough to hold a whole mid season, 63 nights or more. On 1,160 spans with hires of 1 to 62 nights, ignoring the class changed no answer. So 19 and 20 are real holes of low weight; 17 is the one a subject is likely to write.
- The check's last case (`"returns a day whose total no other day in the span beats"`) loops over `mod.BOAT_CLASSES` but its four spans never make the class or the exact night count matter.

Kept though the check failed them: `hollow-adv-21.ts` (compares the first night's rate only) and `hollow-adv-22.ts` (`securedOn` by least day number). Also failed and deleted: day wrapped into the year, stopping at the first rise.

**`other.ts` passed.** It works the total out from `nightsBySeason`, the price table, `longHireRate` and the cap, with no call to `quoteHire`.

**Kind: holds.**
- Everything a right answer needs is in the ask and `outline.md`: `quoteHire(hire: Hire): Quote`, the four members of `Hire`, `Quote.totalPence`.
- The one fact that is otherwise only in bodies (a start day past 365 is taken as it is) is said by the ask: "The days may run past the end of the year, as a hire's start day may."
- Only an answer that sums nights itself needs "A night belongs to the day it begins on", which is in a comment and a body only. Getting it one way wrong passes (file 17); the other way fails.
- `region.md` is byte for byte `outline.md`, as `holds.py check` reports; the reference edit has an empty SEARCH.
- An answer that leaves `pets` out or adds a member `Hire` lacks passes the check and fails `tsc --strict` (`Property 'pets' is missing ...`). It is right in effect, so I kept no file. The writer's `where.md` already says so.

## PC2 (inside): `refundDue` takes the fee first

**Breaches of its own cases: none.** Failed as they should: minimum judged on what is left before the rate, a flat 2500 fee, the part rounded to nearest, a refund of exactly the minimum not sent, fee worked out on the part earned back, a part of a penny of the fee kept, the two amounts worked out apart. Kept as near ones: `hollow-adv-17.ts` (fee on the part earned back) and `hollow-adv-18.ts` (`net <= MIN_REFUND_PENCE`).

**`other.ts` passed** (different names, an `if` in place of the ternary). Two more odd-but-right forms also passed and were deleted, so the check does not lean on the reference's shape.

**Fairness.** Every case follows from the ask. The sharpest, `refundDue(paid(10010), 200, 160)` is 4504, follows from "the part earned back is then worked out on what is left" with "a part of a penny is dropped as it is now". The six skipped helper cases are all ones whose amounts change, and each is tested again with its new amount.

**Kind: holds.**
- All a right answer needs is in the ask and `region.md` (lines 282 to 294).
- It cannot be written from the outline: the fee rule, "a tenth of what was paid, up to the flat fee", is only in the body. The outline shows `ADMIN_FEE_PENCE = 2500` and the ask's example says "whose fee is 2500", so an outline reader guesses a flat fee. That fails `refundDue(paid(10000), 200, 160)` is 4500.
- An outline reader could quote the header line and put a new function before it, but would still lack the fee rule.

## PC3 (leans): the percentage on the discount line

**Breaches of its own cases: none.** The wrong guess about `longHireRate` failed in six forms: `String(rate)`, `parseFloat(rate.toFixed(2))`, `rate * 100`, `Math.round(rate * 10000) / 100`, `rate / 100`, and `rate < 1 ? rate * 100 : rate`. Also failed: whole percent, `toPrecision(2)`, worked back from `off / boat` to the nearest half, and the true share when the cap bites. Kept as near ones: `hollow-adv-17.ts` (says the share really taken when the cap bites) and `hollow-adv-18.ts` (fraction-or-percent guess).

**`other.ts` passed** (builds the number from `rate % 10`, string concatenation). A version that writes the four percentages out again by the nights also passed; it is right today, so I deleted it.

**Kind: holds, with one caveat.**
- The ask does not give the fact away. It names percentages ("ten percent", "seven and a half percent", "five percent") and never says what `longHireRate` returns; `longHireRate` is not in a code span.
- `region.md` does not show it: it has the outline and lines 178 to 209, and no rate's value appears anywhere in them.
- The first line `export function longHireRate(nights: number): number {` leaves the unit open.
- The natural guess is really wrong: `(${rate}%)` gives `Long hire discount (100%)` for 14 nights. The ask's own examples fit that guess, which makes it more natural.
- The whole file shows the fact plainly, directly above `longHireRate`: "in tenths of a percent: 75 is 7.5%".
- A careful reader of `region.md` sees that the other declaration matters: `const rate = longHireRate(hire.nights);`.
- **Caveat.** A region reader can be right without the fact by calling `share`: `share(10000, rate) / 100`, or the uncapped `share(boat, rate) / boat` rounded to one place. The writer's `where.md` names the first. A failure in the `region` arm is therefore not always "the arm's".

## The module

- **Not broken, nothing changes from run to run.** No clock, no random number, no import. `tsc --strict` passes for the module, the three references and my three `other.ts`. It is 294 lines, none over 120 columns, no mark lines. The asks are 140, 150 and 164 words.
- **Reads as real code.** Sparse comments, tables, private helpers. More than four conventions show only in a body or a comment above: the excluded end of a season, the newest-first ledger, tenths of a percent, a refund entered as a positive amount, 0 for "no deposit", `addExtra` changing its argument.
- **Two odd behaviours, both unpinned:**
  - Cancelling after the start earns everything back: `refundDue(paid(40000), 200, 201)` is 37500, because `daysUntil` takes a day that looks earlier to be next year. The comment says so, but as a refund rule it is a wart. It is the same path as breach 05.
  - The minus zero from `addExtra` on a total of 0, described above.
- `seasonOn`'s last `return "low"` cannot be reached; harmless.
- No helper case checks that `securedOn`, `quoteText`, `lastPayment`, `balanceDue` or `depositDue` leave their argument alone. Breaches 01 and 02 are two of those.

My scratch files (generator, the list of what each file is, the logs) are in SCRATCH/adv-tariff/ (`gen_final.py`, `final.json`, `final.log`). Nothing there is needed to mend.
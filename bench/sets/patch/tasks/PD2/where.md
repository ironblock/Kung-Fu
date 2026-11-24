# PD2 (inside): where the change is

**The right change.** Inside `boatBill` only, lines 237 to 255 of `src/fuel.ts`. The loop that pushes one `BillLine` for each draw must give one line for each day: the day's volumes added, `chargeFor` called once on the sum at `priceOn(prices, day)`, and the lines in rising day order. The reference sorts the boat's draws by day and adds each draw to the last line when that line is for the same day, charging the line again on its new volume.

**Why it needs the body.** The first line of `boatBill` does not say that the days run from `fromDay` up to but not including `toDay`, that a day whose price is `NO_PRICE` throws `no diesel price is set for day N`, that the bill's `volume` and `total` are running sums, or that the draws come from `drawsOf` and are turned round. The ask says only "as it is now" for these. The cases of `fuel as it was` that the change does not alter pin all of them.

**What a wrong answer is likely to do.**

- Join the lines but keep the old rounding, adding each draw's rounded pence: `hollow-pennies.ts`. Two draws of 5 dl at 142.9p a litre are 72p + 72p = 144p draw by draw and 143p on their sum.
- Join only draws that stand next to each other in the order entered, and leave the lines in that order: `hollow-entered.ts`.
- Join by day but leave the lines in the order each day was first entered: `hollow-first.ts`.
- Sort the days as text, with `.sort()` and no comparator: `hollow-text.ts`. Days 10 to 14 come out right that way. The case "puts the days in order as numbers, not as text" has days 99 and 100.
- Refuse a day with no price with another class of error or other words: `hollow-class.ts` throws a `RangeError`. The module throws a plain `Error` there and a `RangeError` everywhere else, and "as it is now" means that class and those words. The case "still refuses a day with no price, and only a day it bills" tests the name and the whole message.
- Add a day's volumes into the first of the ledger's own entries for that day: `hollow-ledger.ts`. The entries `drawsOf` gives are the ledger's own, though the list is new. "leaves the ledger and the prices as they were" fails it.
- Sort the list `drawsOf` gave without knowing whether it is the ledger's own. It is not: `drawsOf` filters, so it gives a new list. An answer that sorts `ledger.entries` itself fails "leaves the ledger and the prices as they were".
- Written from the outline alone, the body is a guess, and the unchanged cases for the day range and the refusal fail it. `hollow-lost.ts` is the reference with `stockAt` leaving out an entry timed at the very minute. Four more are the reference with one other function a little changed, and cases of `fuel as it was` fail each: `hollow-copy.ts` (`post` puts a copy of the entry in the ledger), `hollow-opens.ts` (`recordDelivery` writes to the ledger itself and so takes a day before it opens), `hollow-rate.ts` (`daysOfCover` rounds the daily rate down before it divides) and `hollow-words.ts` (`post` refuses in other words).

**A right answer that does not need the body.** One edit can quote only the first line of `boatBill`, which the outline prints, and put a new `boatBill` in front of it that ends with a new first line for the old body, such as `function billByDraw(...)`. The old body then lives on under the new name. The new `boatBill` calls it and joins its lines by day, with `chargeFor` once on each day's sum. The old body still gives the days covered and the refusal with its class and words. This answer passes the check and it is right. So a pass in `outline-1` on this task does not show that the reader guessed the body: read the try, and say which way it went. The route is open because the new bill can be made from the old bill. Written in place, the change needs the body, and the task is of its kind for the reader of `region.md`.

**Two days with no price.** The module names the first such day entered, and an answer that goes by day names the earliest. The ask does not say which. The check and the helper each have one such day only. Keep it so.

**The two cases skipped in `unchanged`.** "boatBill gives a line for each draw of a day, each rounded up on its own" and "boatBill lists the draws in the order they were entered": the change must alter both.

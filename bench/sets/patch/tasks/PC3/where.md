# PC3, leans: the percentage on the discount line

**The right change.** In `quoteHire`, the one line that pushes the discount line. Its label becomes `Long hire discount (N%)`, where N is the rate that `longHireRate` returned, divided by ten: `rate / 10`. The amount, `-off`, stays.

**The other declaration.** `longHireRate`, whose first line is `export function longHireRate(nights: number): number`.

**The fact.** The number it returns is in tenths of a percent. 100 stands for 10%, and 75 for 7.5%. Its name, its parameter and its return type leave the unit open.

**The lines that show it.**

- The comment directly above `longHireRate`: "The discount rate for a hire of this many nights, in tenths of a percent: 75 is 7.5%."
- The body of `share`, which `quoteHire` gives the rate to: `Math.floor((pence * rate) / 1000)`.
- The table `LONG_HIRE_BANDS`, which `longHireRate` reads, and whose rates are 150, 100, 75 and 50.

None of these is in the outline or in the lines of `quoteHire`. The outline shows `share(pence: number, rate: number)` and the members named `rate`, and no value of any rate. The lines of `quoteHire` show that the rate comes from `longHireRate`, is tested with `rate > 0`, and is passed to `share`. That is what tells a careful reader that the unit of `longHireRate` matters.

**The natural wrong guess.** That the rate is a percentage, so the label is written with the rate as it is: `(${rate}%)`. A hire of 14 nights then reads `Long hire discount (100%)`. That is `hollow-guess.ts`. Two other guesses are as wrong: a fraction of one (`rate * 100`, which gives 10000%), and hundredths of a percent (`rate / 100`, which gives 1%). `hollow-fraction.ts` takes the rate for a fraction when it is under 1 and for a percentage when it is not, so it too writes 100% for 10%.

**Other wrong answers.**

- A percentage worked back from the two amounts, `off / boat`, by a reader who does not know the unit and will not guess. It is right until the cap bites: a heritage boat for 21 nights of high season earns 15% and has 500 pounds off 4515, which reads 11.1% (`hollow-worked.ts`). The ask says the label holds the percentage earned even then. `hollow-capshare.ts` writes `rate / 10` until the cap bites and the share worked back after.
- The right unit with a fixed number of places, `(rate / 10).toFixed(1)`, which gives `(10.0%)` (`hollow-fixed.ts`), or rounded to a whole number, which gives 8% for 7.5%.
- Change another function on the way. `hollow-lost.ts` has `addExtra` let a reduction take the total below nothing; it fails through the unchanged case of `addExtra` for that edge.

**The other hollow answers.** Ten more each change one other function a little, and fail through `unchanged`. They are the same in the three tasks: `hollow-reversed.ts` (`securedOn` turns the ledger round in place), `hollow-totalline.ts` (`quoteText` adds a Total line to the quote), `hollow-norefund.ts` (`lastPayment` with no kind passes over a refund), `hollow-zeroextra.ts` (`addExtra` adds no line for 0), `hollow-oneyear.ts` (the notice is brought round by one year at most), `hollow-overrefund.ts` (`balanceDue` counts a ledger below nothing as nothing paid), `hollow-wraponce.ts` (a day before day 1 is brought on by one year at most), `hollow-copyin.ts` (`recordPayment` enters a copy), `hollow-copyout.ts` (`lastPayment` gives a copy) and `hollow-message.ts` (other words for a hire of part of a night).

**A right answer that does not hold the fact.** `share(10000, rate) / 100` is the percentage whatever the unit is, since `share` knows it. A reader who writes that has leaned on the body of `share` through a call. The check passes it, as it must: it does what the ask says. A second route does the same: the share of the whole boat, which the cap does not hold back, over the boat's price, rounded to one place, as in `Math.round((share(boat, rate) / boat) * 1000) / 10`. Both pass the check; each was run on it. A reader of `region.md` holds what both need, since the lines of `quoteHire` call `share`. So a `region` failure on this task is not the arm's only because `region.md` lacks the fact. Read whether the try guessed the unit, or took one of these routes and slipped.

**Which unchanged case the check skips.** One: "quoteHire: the discount line follows the nights and comes before the pets", the only case that pins the label. The cases that pin the discount's amount, the cap and the total stay.

## Corrected 2026-11-22, after the ceiling

By Claude Opus 5.5, from what the ceiling's tries showed. The lines above are left as they were written.

- **The run's rule sorts a `region` failure here, not the sentence above.** By the rule in the run's README, a failure is sorted by what its failing part rested on. A `region` try that guessed the unit of the rate and got it wrong rested on a fact the message did not hold, so it is the arm's, even though a call to `share` could have passed. A try that took one of the two routes and slipped in what it held is the subject's.

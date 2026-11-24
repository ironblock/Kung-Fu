# PC2, inside: `refundDue` takes the fee first

**The right change.** In the body of `refundDue`, the lines after the guard. As the file stands, the part earned back is worked out on all that was paid, and the admin fee comes off the result: `share(paid, rate) - fee`. After the change the fee comes off what was paid, and the part is worked out on the rest: `share(paid - fee, rate)`. The fee is still `Math.min(ADMIN_FEE_PENCE, share(paid, 100))`: a tenth of what was paid, and no more than the flat fee. The minimum is still judged on the last amount.

**What it needs of the file.** The lines of `refundDue`. They show the call to `share`, how the fee is worked out, and the minimum; the change moves the fee and nothing else. Nothing in another body is needed.

**Why the body is needed.** The rule for the fee is only in the body: the outline shows `ADMIN_FEE_PENCE = 2500` and no tenth. A reader who writes `refundDue` anew from the outline and the ask takes 2500 from every customer, and fails the cases with a small payment, among them the unchanged case "refundDue: the fee is a tenth of what was paid, and no more than twenty-five pounds".

**What a wrong answer is likely to do.**

- Take the fee before the rate and leave the old line that takes it after, so the fee is taken twice (`hollow-twice.ts`).
- Keep the old amount and take off the fee's own share: `share(paid, rate) - share(fee, rate)`. That is the two amounts worked out apart. It is a penny over whenever the fee's share has a part of a penny and what was paid has none: 10010 paid at half gives 4505, and half of the 9009 that is left is 4504 (`hollow-scaled.ts`). The ask says the part is worked out on what is left and that a part of a penny is dropped.
- Work the fee out on the part earned back, and not on what was paid (`hollow-earnedfee.ts`).
- Judge the minimum on the amount before the fee, or drop the minimum, or hold back a refund of exactly the minimum (`hollow-atminimum.ts`).
- Round to the nearest penny where the file drops the part.
- From the outline alone: make up the body's text, and the edit is refused.
- Change another function on the way. `hollow-lost.ts` has `inSeason` count the day a season runs to as part of it; it fails through the unchanged cases of `seasonOn`, `nightlyRate`, `nightsBySeason` and `quoteHire`.

**The other hollow answers.** Ten more each change one other function a little, and fail through `unchanged`. They are the same in the three tasks: `hollow-reversed.ts` (`securedOn` turns the ledger round in place), `hollow-totalline.ts` (`quoteText` adds a Total line to the quote), `hollow-norefund.ts` (`lastPayment` with no kind passes over a refund), `hollow-zeroextra.ts` (`addExtra` adds no line for 0), `hollow-oneyear.ts` (the notice is brought round by one year at most), `hollow-overrefund.ts` (`balanceDue` counts a ledger below nothing as nothing paid), `hollow-wraponce.ts` (a day before day 1 is brought on by one year at most), `hollow-copyin.ts` (`recordPayment` enters a copy), `hollow-copyout.ts` (`lastPayment` gives a copy) and `hollow-message.ts` (other words for a hire of part of a night). The unchanged case that fails `hollow-oneyear.ts` is at the longest notice, where the change gives the same amount as before.

**Which unchanged cases the check skips.** The six of `refundDue` whose amounts the change alters: those at half and at a quarter. The cases at the longest notice stay, since all of what is left after the fee is the same amount as before.

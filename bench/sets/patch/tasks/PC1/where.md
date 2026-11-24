# PC1, beside: `cheapestStart`

**The right change.** A new exported function, put anywhere at the top level of `src/tariff.ts`; the reference adds it at the end of the file. It walks the start days from `fromDay` to `toDay`, both included, quotes a hire of the class and the nights with no pets for each, and keeps the first day with the lowest `totalPence`.

**What it needs of the file.** Only what the outline shows: `quoteHire(hire: Hire): Quote`, the four members of `Hire` (`boatClass`, `startDay`, `nights`, `pets`) and `Quote.totalPence`. `quoteHire` takes a start day past day 365 as it is, so the new function wraps nothing. An answer that adds up `nightlyRate` over the nights picks the same day and passes: the nights are as many for every start day, so the discount is the same share with the same cap, and the total rises and falls with the boat's price.

**What a wrong answer is likely to do.**

- Return the latest of several cheapest days, by comparing with `<=` (`hollow-latest.ts`).
- Stop before `toDay`, by looping while `day < toDay` (`hollow-open.ts`).
- Wrap the day it returns into 1 to 365.
- Add up `nightlyRate` from the start day to `start + nights` with that last day included, so a night too many is priced (`hollow-extranight.ts`). That a night belongs to the day it begins on is in a comment and a body only. An answer that calls `quoteHire` needs no guess about it, so the outline still holds what a right answer needs.
- Price another hire than the one asked: a fixed number of nights (`hollow-twonights.ts`), one boat class whatever the class given (`hollow-narrowonly.ts`), the first night's rate alone (`hollow-firstnight.ts`), or the seasons ranked with no price read (`hollow-seasonrank.ts`). The class changes the answer only on a long hire, such as the check's 68 nights from day 100 to day 241.
- Build a `Hire` with a member the interface does not have, such as `endDay`, or leave `pets` out. The file then does not compile under `tsc`, though the check may still run it.
- Write the file anew, or change another function on the way. `hollow-lost.ts` has `recordPayment` put a payment at the end of the ledger and not at its head; it fails through the unchanged cases of `recordPayment`, `lastPayment` and `securedOn`. `hollow-leastday.ts` has `securedOn` take the deposit with the least day number.

**The other hollow answers.** Ten more each change one other function a little, and fail through `unchanged`. They are the same in the three tasks: `hollow-reversed.ts` (`securedOn` turns the ledger round in place), `hollow-totalline.ts` (`quoteText` adds a Total line to the quote), `hollow-norefund.ts` (`lastPayment` with no kind passes over a refund), `hollow-zeroextra.ts` (`addExtra` adds no line for 0), `hollow-oneyear.ts` (the notice is brought round by one year at most), `hollow-overrefund.ts` (`balanceDue` counts a ledger below nothing as nothing paid), `hollow-wraponce.ts` (a day before day 1 is brought on by one year at most), `hollow-copyin.ts` (`recordPayment` enters a copy), `hollow-copyout.ts` (`lastPayment` gives a copy) and `hollow-message.ts` (other words for a hire of part of a night).

**Sorting a failure.** An `outline` reader holds all it needs, so a failure in `outline` or above is the subject's unless the patch was refused for quoting text the outline does not show.

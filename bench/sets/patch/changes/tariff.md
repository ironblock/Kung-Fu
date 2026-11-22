# Changes to `tariff` and its three tasks, after the adversary's findings

The findings are the adversary's, in `/home/build/patch/tariff/findings.md`.

The mender before me left no line here and no change in W. When I began on 2026-11-22, `check-tasks` ended `window: none; 52 WRONG`, and every WRONG line was an adversary file. `holds.py check` ended `all as they must be`. Every file in W still had the time the writer or the adversary gave it on 2026-11-20, and the scratch directory held no work of a mender on `tariff`. So no finding had been answered, and there were no earlier lines to keep.

**Another mender took over here.** Written by Claude Opus 5.5 on 2026-11-22. One line for each change, with the finding it answers. "adv-n" is the adversary's `hollow-adv-<n>.ts`, and the name after the arrow is what that file is called now. Files adv-01 to adv-16 held the same change in all three tasks, so each is named once here for the three. Each renamed file is the adversary's, byte for byte.

The module `files/tariff.ts` did not change. No ask changed. No `plain.ts`, `reference.ts`, `reference.edits.md` or `other.ts` changed. `holds.py make` was run again, and no held text changed.

## `checks/helpers-tariff.ts`: 12 cases added to `unchanged`, from 74 to 86

All three checks run them. None is a case that a task's change alters, so no skip list changed.

- New case "securedOn: leaves the ledger as it was". adv-01 → `hollow-reversed.ts` (`securedOn` turns the caller's ledger round in place).
- New case "quoteText: leaves the quote as it was, and gives the same lines a second time". adv-02 → `hollow-totalline.ts` (`quoteText` pushes a Total line into the quote).
- New case "lastPayment: with no kind, a refund is a payment like any other". adv-03 → `hollow-norefund.ts`.
- New case "addExtra: an extra of nothing still has its line", on a total of 5000. adv-04 → `hollow-zeroextra.ts`. It is not pinned on a total of 0, as the adversary warned: there the module's line holds minus zero.
- New case "refundDue: a cancel day more than a year past the start still gives notice within the year ahead": `refundDue(paid(40000), 20, 500)` and `(…, 200, 600)` are 37500. adv-05 → `hollow-oneyear.ts`. Both are at the longest notice, where PC2's change gives the same amount, so PC2 need not skip the case.
- New case "balanceDue: a ledger that has given back more than it took owes more than the price and the bond": 127000. adv-06 → `hollow-overrefund.ts`.
- New case "seasonOn: a day more than a year before day 1 is brought into the year all the same": day -456 is mid, day -500 is high. adv-07 → `hollow-wraponce.ts`.
- New case "recordPayment: enters the very payment it is given, not a copy of it". adv-08 → `hollow-copyin.ts`.
- New case "lastPayment: gives the ledger's own entry, not a copy, and leaves the ledger as it was". adv-09 → `hollow-copyout.ts`. It also answers the module finding that no case checks that `lastPayment` leaves its argument alone.
- New case "quoteHire: refuses a hire of no nights and a hire of part of a night in the same words". adv-16 → `hollow-message.ts`. The helper pinned the words only for -3 nights.
- New case "depositDue: leaves the quote as it was". The module finding: "No helper case checks that `securedOn`, `quoteText`, `lastPayment`, `balanceDue` or `depositDue` leave their argument alone." No file breached it.
- New case "balanceDue: leaves the quote and the ledger as they were". The same finding. No file breached it.

## PC1 (beside)

- `check.test.ts`: new case "prices exactly the nights it is given": `cheapestStart("narrow", 3, 179, 250)` is 179, and `("narrow", 1, 181, 251)` is 181. adv-17 → `hollow-extranight.ts` (a night too many), adv-18 → `hollow-twonights.ts` (two nights whatever `nights` is).
- `check.test.ts`: new case "prices the boat class it is given": 68 nights from day 100 to day 241 is day 100 for a narrow or a heritage boat, and day 241 for a wide boat or a cruiser. adv-19 → `hollow-narrowonly.ts`, adv-20 → `hollow-seasonrank.ts`. It fails adv-17 and adv-18 as well.
- `check.test.ts`: the case "returns a day whose total no other day in the span beats" also walks `[3, 179, 250]` and `[68, 100, 241]`. The finding that its four spans "never make the class or the exact night count matter". The spans moved into a `const` so that the line stays under 120 columns.
- The near misses kept their places under words: adv-21 → `hollow-firstnight.ts` (the first night's rate alone), adv-22 → `hollow-leastday.ts` (`securedOn` by the least day number). The adversary's "Kept though the check failed them". They failed before and fail now.
- `where.md`: the new wrong answers are named, with a paragraph on the ten hollow answers that change another function. For the person who sorts failures; it answers PC1's breaches.

## PC2 (inside)

- `check.test.ts` did not change. No file breached PC2's own cases.
- The near misses kept their places under words: adv-17 → `hollow-earnedfee.ts` (the fee worked out on the part earned back), adv-18 → `hollow-atminimum.ts` (a refund of exactly the minimum held back). The adversary's "Kept as near ones".
- `where.md`: the two near misses are named among the likely wrong answers, with the same paragraph on the ten hollow answers.

## PC3 (leans)

- `check.test.ts` did not change. No file breached PC3's own cases.
- The near misses kept their places under words: adv-17 → `hollow-capshare.ts` (the share really taken once the cap bites), adv-18 → `hollow-fraction.ts` (a fraction under 1, a percentage above). The adversary's "Kept as near ones".
- `where.md`: a second right answer that does not hold the fact, `Math.round((share(boat, rate) / boat) * 1000) / 10`, and the words that a `region` failure on this task is not the arm's only because `region.md` lacks the fact. Answers "Kind: holds, with one caveat". I ran both routes, this one and `share(10000, rate) / 100`, on the check, and both pass.
- `where.md`: the two near misses are named, with the same paragraph on the ten hollow answers.

## Taken out of W

- adv-10 to adv-15, in each of the three tasks: 18 files. Copies, byte for byte, are in `SCRATCH/mend-tariff-opus55/removed/`, a scratch directory that may be cleared. Each still passes its check. The reasons are below.

## Left alone, and why

- **adv-10 to adv-15, the breaches on input the module is not meant to take.** The adversary set them apart as such, and wrote "I would mend few of these; the mender decides." I judge none of them a wrong answer that a case should fail. A right patch for any of the three tasks touches none of these functions, so a case for them would not help tell a right patch from a wrong one. It would only fix what the module happens to do with input it was not written for. One by one:
  - adv-10, `nightsBySeason` throws for nights below 0. A count of nights below 0 is no hire. `quoteHire` refuses it before it calls `nightsBySeason`, and nothing else in the module calls it. The edge the module does take, no nights, is pinned.
  - adv-11, `petSupplement` never below 0, and adv-12, `quoteHire` with a pets line for pets below 0. A count of pets below 0 is not a count.
  - adv-13, `quoteText` prints a bond line for a bond below 0. Every bond in the module comes from its table, and each is above 0. A bond of 0 is pinned.
  - adv-14, `paidSoFar` takes a refund off whatever its sign. The comment in its body says "A refund is entered as a positive amount, like any payment", and `recordPayment` enters no payment of 0 or less.
  - adv-15, `formatPence` rounds a part of a penny. The file's first comment says every amount of money is a whole number of pence, and the module prints `£0.12.5` for 12.5. A case would pin a fault.
  The menders of `fuel` and `moorings` left wrong answers of this sort without a case too, though their adversaries had not filed them.
- **The minus zero from `addExtra` on a total of 0.** Only `Object.is` can see it: `formatPence` prints `£0.00` and the total stays 0. No case pins it either way, as the adversary advised.
- **Cancelling after the start earns everything back** (`refundDue(paid(40000), 200, 201)` is 37500). It follows from the rule in `daysUntil`'s comment, "a day that looks earlier is taken to be in the next year". That rule is pinned already: an answer that gives nothing back once the cancel day's number is past the start day's fails the two cases counted over the new year, and the new case for adv-05. I ran one. To change the rule would change the module and every file of the three tasks, and no task turns on it.
- **`seasonOn`'s last `return "low"` cannot be reached.** Harmless, as the adversary says. A developer leaves such a line.
- **PC3's way round the fact.** It stays open. `quoteHire` hands the rate to `share`, and a reader of its lines may call `share` again. To close it would mean a change to the module and to what the task turns on. `where.md` now names both routes, so a passing `region` try can be read for them.
- **PC1, an answer that leaves `pets` out of the `Hire` or adds a member `Hire` lacks.** It passes the check and fails `tsc --strict`. The adversary kept no file, since it is right in effect, and `where.md` already says so. The grader runs vitest and not `tsc`; that is in `bench/box.py`, outside W.

## What was run after the last change

- Each renamed breach was graded alone on its task's check, in all three tasks where it is filed. Each now fails, and the case that fails is the one written for it, named above. In PC1, adv-17 and adv-18 fail three cases, adv-19 and adv-20 two. The near misses fail as before.
- The 18 files taken out still pass the mended checks, as no case was written for them.
- `tsc --strict` on `files/tariff.ts`: no output, exit 0. The same on the three `reference.ts` and the three `other.ts`, copied to my scratch directory. Each `plain.ts` is the module byte for byte.
- `holds.py make W`: `3 tasks: name, outline, region, whole written for each`. `holds.py check W`: `all as they must be`.
- `box.py check-tasks W --window none`: `window: none; all as they must be`.

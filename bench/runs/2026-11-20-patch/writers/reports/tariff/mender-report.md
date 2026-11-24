## changes

I took over with nothing done. The earlier mender left no CHANGES.md and changed nothing in W. When I began, check-tasks ended "window: none; 52 WRONG", every one an adversary file. So W/CHANGES.md (/home/build/patch/tariff/set/CHANGES.md) opens by saying there were no earlier lines to keep, then "Another mender took over here", then my lines. "adv-n" below is the adversary's hollow-adv-<n>.ts. Files adv-01 to adv-16 held the same change in all three tasks. Each renamed file is the adversary's, byte for byte.

The module, the three asks, every plain.ts, reference.ts, reference.edits.md and other.ts, and every held text are unchanged.

checks/helpers-tariff.ts: 12 cases added to unchanged, from 74 to 86. No skip list changed.
- "securedOn: leaves the ledger as it was". Answers adv-01, now hollow-reversed.ts.
- "quoteText: leaves the quote as it was, and gives the same lines a second time". Answers adv-02, now hollow-totalline.ts.
- "lastPayment: with no kind, a refund is a payment like any other". Answers adv-03, now hollow-norefund.ts.
- "addExtra: an extra of nothing still has its line", on a total of 5000 and not 0, to keep clear of the minus-zero trap. Answers adv-04, now hollow-zeroextra.ts.
- "refundDue: a cancel day more than a year past the start still gives notice within the year ahead" (20, 500 and 200, 600 give 37500). It is at the longest notice, where PC2's change gives the same amount. Answers adv-05, now hollow-oneyear.ts.
- "balanceDue: a ledger that has given back more than it took owes more than the price and the bond" (127000). Answers adv-06, now hollow-overrefund.ts.
- "seasonOn: a day more than a year before day 1 is brought into the year all the same" (-456 is mid, -500 is high). Answers adv-07, now hollow-wraponce.ts.
- "recordPayment: enters the very payment it is given, not a copy of it". Answers adv-08, now hollow-copyin.ts.
- "lastPayment: gives the ledger's own entry, not a copy, and leaves the ledger as it was". Answers adv-09, now hollow-copyout.ts, and the module finding that lastPayment's argument is never checked.
- "quoteHire: refuses a hire of no nights and a hire of part of a night in the same words". Answers adv-16, now hollow-message.ts.
- "depositDue: leaves the quote as it was" and "balanceDue: leaves the quote and the ledger as they were". These answer the module finding that five functions are never checked for leaving their argument alone. No file breached either.

PC1:
- check.test.ts: new case "prices exactly the nights it is given" ("narrow", 3, 179, 250 gives 179; "narrow", 1, 181, 251 gives 181). Answers adv-17, now hollow-extranight.ts, and adv-18, now hollow-twonights.ts.
- check.test.ts: new case "prices the boat class it is given" (68 nights from day 100 to 241: day 100 for narrow and heritage, day 241 for wide and cruiser). Answers adv-19, now hollow-narrowonly.ts, and adv-20, now hollow-seasonrank.ts.
- check.test.ts: the last case also walks the spans [3,179,250] and [68,100,241]. Answers the finding that its spans never make the class or the night count matter.
- The near misses adv-21 and adv-22 are now hollow-firstnight.ts and hollow-leastday.ts.
- where.md names the new wrong answers and the ten module-wide hollow answers.

PC2:
- check.test.ts did not change, since no file breached PC2's own cases.
- The near misses adv-17 and adv-18 are now hollow-earnedfee.ts and hollow-atminimum.ts.
- where.md names them, with the same paragraph on the module-wide hollow answers.

PC3:
- check.test.ts did not change.
- The near misses adv-17 and adv-18 are now hollow-capshare.ts and hollow-fraction.ts.
- where.md names a second right answer that does not hold the fact, Math.round((share(boat, rate) / boat) * 1000) / 10. It also says a region failure on this task is not the arm's only because region.md lacks the fact. This answers the caveat on PC3's kind. I ran both routes, this one and share(10000, rate) / 100, on the check, and both pass.
- where.md also names the near misses and the module-wide hollow answers.

Taken out of W: adv-10 to adv-15 in each task, 18 files. Byte-for-byte copies are in SCRATCH/mend-tariff-opus55/removed/, a scratch directory that may be cleared. Each still passes its check (reasons under left_alone).

Run after the last change: I graded each renamed breach alone in every task where it is filed. Each now fails at the case written for it.

## tsc_last_line

No output, exit 0, for files/tariff.ts. The three reference.ts and three other.ts, copied to scratch, also type-check with exit 0.

## holds_check_last_line

all as they must be

## check_tasks_last_line

window: none; all as they must be

## left_alone

- adv-10 to adv-15, which differ from the module only on input it is not meant to take. The adversary set these apart: "I would mend few of these; the mender decides." No right patch for any of the three tasks touches these functions. So a case for them would not help tell a right patch from a wrong one; it would only pin what the module does with input it was not written for.
  - adv-10, nightsBySeason throws for nights below 0. quoteHire refuses such a hire first, and 0 nights is pinned.
  - adv-11 and adv-12: a count of pets below 0.
  - adv-13: a bond below 0. Every bond comes from the module's table and is above 0.
  - adv-14: a refund of negative pence. The comment says a refund is entered as a positive amount, and recordPayment enters no payment of 0 or less.
  - adv-15, formatPence on a part of a penny. The module prints "£0.12.5", and its first comment says all money is whole pence, so a case would pin a fault.
  The fuel and moorings menders treated answers of this kind the same way.
- The minus zero from addExtra on a total of 0. Only Object.is can see it, and the adversary advised against pinning it.
- Cancelling after the start earns everything back. It follows from daysUntil's stated rule, and that rule is already pinned: an answer that gives nothing back once the cancel day is past the start day fails the two new-year cases and the new adv-05 case (I ran one). Changing the rule would change the module and every task file, and no task turns on it.
- seasonOn's unreachable last return "low". It is harmless.
- PC3's way round the fact through share. It stays open, because closing it means changing the module and what the task turns on. where.md now names both routes.
- PC1, an answer that leaves pets out of the Hire or adds a member Hire lacks. It passes the check and fails tsc; the grader runs vitest only, in bench/box.py outside W. The adversary kept no file for it, and where.md already says so.

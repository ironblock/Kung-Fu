# PJ1: where the change is, and how it goes wrong

**The right change.** A new exported function `stillOut(loans)` is added to `src/keys.ts`. The reference adds it at the end of the file, after `receiptLines`. It starts every kind of `ALL_KINDS` at 0, passes over each loan for which `isOpen` is false, and adds `outstanding(loan, kind)` for each kind. Nothing that is there already changes.

**What the outline gives.** Everything the function needs is in a first line: the six kinds (line 4 and line 43), the fields of `GearLine` and `Loan`, `isOpen(loan: Loan): boolean` (line 90) and `outstanding(loan: Loan, kind?: GearKind): number` (line 137). The ask says the one thing the outline does not: that `back` already holds the damaged items.

**What a wrong answer is likely to do.**

- Count settled loans too, by leaving out the test for an open loan. `hollow-settled.ts` does this.
- Test for an open loan by its own guess at `settledDay`, such as `settledDay < 0` or `settledDay === -1`, and not by `isOpen`. An open loan has `settledDay` 0, which shows only in the bodies of `openLoan` and `isOpen`. Such an answer counts settled loans, or counts none.
- Give a key only for the kinds it met, so that an empty list gives `{}`. `hollow-sparse.ts` does this.
- Take `damaged` off as well as `back`, and so count too few. `hollow-damaged.ts` does this.
- Read each line with `lineFor`, which adds a line where the loan has none, and so change the loans. `hollow-linefor.ts` does this. The outline shows `lineFor`'s first line, and only its body says that it adds.
- Put each loan's `lines` in the order of `ALL_KINDS` before counting, and so change the loans. `hollow-sorted.ts` does this.
- Count one loan for each booking reference, so that two loans with one reference count once. `hollow-booking.ts` does this. The ask says "all the loans in the list".
- Write the whole file anew and change another function without meaning to. `hollow-lost.ts` has the right `stillOut` and a `lateDays` that calls 10:00 on the due day late; the cases of `unchanged` fail it.

**More files with the right `stillOut` and one other function changed.** Each is failed by one or two cases of `unchanged`.

- `hollow-latefee.ts`: `settle` charges the late fee only while gear is still out.
- `hollow-closed.ts`: `issue` ignores a loan that has been settled.
- `hollow-holder.ts`: `keyHolder` gives the last open loan with the tag, not the first.
- `hollow-spaces.ts`: `openLoan` takes every space out of the booking reference, not only those at its ends.
- `hollow-uncut.ts`: `takeBack` adds its log entry itself, and the log grows past 40 entries.
- `hollow-tally.ts`: `summary` counts damaged items only on lines with gear still out.

**If the patch is refused.** The reference edit has an empty SEARCH, which adds at the end of the file. An edit that quotes a body the reader was not shown, such as the last lines of `receiptLines`, is refused unless the guess is exact.

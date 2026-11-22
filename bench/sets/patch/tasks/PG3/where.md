# PG3, `leans`: give part of the deposit back when a hire is cancelled

**The right change.** In `BookingBook.cancel` (lines 459 to 473), the refund of a confirmed hire becomes what it
is now, `Math.max(0, b.paidPence - b.depositPence)`, plus a share of the deposit:
`b.depositPence * refundShare(b.fromDay - dayOf(at)) / 100`. A hold still gets 0. The lines after it already use
`refund` for `paidPence`, the note and the event, so nothing else changes.

**Where.** Lines 465 and 466: the comment and the line that sets `refund`.

**The other declaration.** `refundShare(noticeDays: number): number`, lines 255 to 264.

**The fact.** It returns a whole number of per cent: 100, 75, 40 or 0. It does not return a fraction from 0 to 1.

**The lines that show it.**

- Line 257, the comment inside its body: `// whole per cent, so 75 is three quarters; the steps run from the
  longest notice down`.
- Lines 132 to 136, the table it reads: `[42, 100], [28, 75], [14, 40]`.
- Line 329, in `refundTerms`, the one caller in the file: `` `${share}% of the ... deposit goes back` ``.

None of these is in the outline or in the lines of `cancel`. The outline shows
`export function refundShare(noticeDays: number): number {` and `REFUND_STEPS: readonly (readonly [number, number])[] = [`.

**The natural wrong guess.** A "share" is a fraction, so the refund is `b.depositPence * refundShare(notice)`,
perhaps with `Math.floor` round it. That pays back 100, 75 or 40 times the deposit (`hollow-guess.ts`). Every
case of the check with 14 days of notice or more fails it; the cases with less notice pass, since 0 is 0 either
way.

**What else a wrong answer is likely to do.**

- Make up its own scale in place of the yard's. The ask gives no numbers, so the steps will be wrong.
- Count the notice by the clock: whole days of 1440 minutes from the stamp to the first midnight of the hire,
  rounded down (`hollow-clock.ts`). The ask says "from the day of cancelling to the first day of the hire", which
  is `b.fromDay - dayOf(at)`. A cancelling at 23:59 on day 28 for a hire from day 70 gives 42 days, not 41.
- Give a hold a share of a deposit it never paid.
- Take the share of what was paid, not of the deposit.
- Forget that the refund is also taken off `paidPence` and written in the note and the event. A change that only
  alters the `refund` line cannot forget it.

Deposits are whole pounds (`depositFor` rounds up to the pound, and never goes under 100 pounds for any hire the
book will place), so a whole per cent of one is whole pence. The ask therefore says nothing of rounding, and the
check has no case where rounding could matter.

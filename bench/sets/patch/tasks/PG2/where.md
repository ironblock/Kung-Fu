# PG2, `inside`: a bigger discount for a fortnight or more

**The right change.** In `hireCharge` (lines 232 to 247), inside `if (nights >= LONG_HIRE_NIGHTS)`: a hire of
14 nights or more has 15 per cent taken off where it has a tenth taken off now. The 15 per cent is worked out
on the same `total` (night rates, weekend extra and berth extra all in) and rounded as the tenth is: the
discount, not the charge, is rounded up to the whole pound, `Math.ceil(off / 100) * 100`. Hires of 7 to 13
nights and shorter hires are charged as before.

**Where.** Lines 243 and 244, the comment and the line `total -= Math.ceil(total / 10 / 100) * 100;`.

**Why it needs the body.** The first line of `hireCharge` says nothing of a discount. The sum the discount is
taken from, and the rounding in the hirer's favour to the whole pound, are only in the body. The ask leans on
both with "the same sum as today's tenth" and "rounded in the same way".

**What a wrong answer is likely to do.**

- Write the function anew from the ask and the first line. The rates, the weekend nights and the berth extra are
  then guesses, and `unchanged` fails nearly every `hireCharge` case.
- Take 15 per cent off with no rounding, or round the charge and not the discount (`hollow-unrounded.ts`). The
  check has sums that end in 50 pence (Heron for 21 nights: 207450 before the discount) so that rounding the
  charge down and rounding the discount up give different answers.
- Start the second step after 14 nights and not at 14 (`hollow-edge.ts`).
- Take the tenth off and then 15 per cent as well.
- Quote the line to replace with a wrong indent: it has eight spaces. The edit is refused.

The numbers in the check were chosen so that 15 per cent of each sum is not a whole number of pounds. A right
answer written as `total * 0.15` and one written as `(total * 15) / 100` then agree, whatever the last binary
digit of the product is.

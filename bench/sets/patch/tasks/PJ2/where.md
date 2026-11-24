# PJ2: where the change is, and how it goes wrong

**The right change.** Inside `gearCharge` (lines 145 to 154 of `src/keys.ts`), in the body of its loop over `loan.lines`. Two things change, and nothing outside the function.

- The missing items of a line are `line.issued - line.back`. For the kind `boatKey` the charge for them becomes one key's cost when any is missing, and nothing when none is. The reference multiplies by `Math.min(missing, 1)`.
- The damaged items of a line are charged `Math.ceil(each / 2)` each. For the kind `lifejacket` that becomes `each`.

**Why it needs the body.** The first line, `export function gearCharge(loan: Loan): number`, does not say that damaged gear is charged at all, that the charge is half, or that the half is rounded up for each item. A water key costs 725 pence, so three damaged ones cost 1089 pence and not 1088. A body written anew from the first line will miss one of these, and the cases of `unchanged` fail it.

**What a wrong answer is likely to do.**

- Charge one key for any loan that has a line for boat keys, even when every key is back. `hollow-always.ts` does this.
- Do the keys and leave the lifejackets at half. `hollow-jacket.ts` does this.
- Add the full cost of a damaged lifejacket on top of the half it already pays, 4800 pence for one. `hollow-added.ts` does this.
- Let the one charge for missing keys also swallow the damaged keys, which the ask says are charged as now.
- Charge the one key when the loan has a key tag, and not when keys are missing. `hollow-tag.ts` does this. The two agree while keys go out through `issueKeys`. They differ for keys issued with no tag, and the check has a case for that.
- Charge a change of lock for a damaged key too. `hollow-lock.ts` does this.
- Charge a missing water key only once, by carrying the rule for boat keys over to it. `hollow-waterkey.ts` does this.
- Charge a missing lifejacket only once, by carrying the rule for keys over to it.
- Round the half for the whole line and not for each item.

`hollow-lost.ts` has the right `gearCharge` and a `jacketSize` that puts a weight exactly at a limit in the smaller size. The cases of `unchanged` fail it.

**More files with the right `gearCharge` and one other function changed.** Each is failed by one case of `unchanged`.

- `hollow-closed.ts`: `takeBack` gives 0 for a loan that has been settled.
- `hollow-onetag.ts`: `issueKeys` refuses a loan that ever had boat keys, though its tag is back on the board.
- `hollow-kit.ts`: `standardKit` gives one windlass to a boat of 2 berths or fewer.
- `hollow-negative.ts`: `isOpen` takes a settled day below 0 for "not settled", as well as 0.
- `hollow-twice.ts`: `issue` ignores an issue entered twice for one kind, day and minute.

**If the patch is refused.** The lines to quote are in the function's body, and one of them is a comment 91 columns long. A reader who was not shown the body cannot quote them.

## Corrected 2026-11-22, after the ceiling

By Claude Opus 5.5, from what the ceiling's tries showed. The lines above are left as they were written.

- **The body is needed to change it in place, not to pass.** The ceiling's `outline` try kept the old body as `previousGearCharge` and wrapped it, with two right guesses, and passed. Read an `outline-1` pass for this shape.

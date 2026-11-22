# PO2, inside: `lateCharge`

**The right change.** In `lateCharge` (lines 305 to 310 of `src/handover.ts`, the comment included), the last line, `return Math.min(steps * LATE_STEP_PENCE, LATE_CAP_PENCE);` (line 309). The steps after the fourth count twice: the reference adds `const counted = steps + Math.max(0, steps - 4);` and multiplies `counted` by the price. The test for no lateness, the rounding up to a whole step and the cap stay as they are.

**Why it needs the body.** The ask says "steps", "as they are now" and "the cap stays". What a step is (a started 30 minutes, `Math.ceil(lateMin / LATE_STEP_MIN)`), that nothing is charged for 0 or less, and that the cap is on the whole sum are in the body only. The three constants are in the outline with their values (lines 99 to 101).

**The numbers.** Up to 120 minutes nothing changes: 1200, 2400, 3600, 4800. Then 7200 from minute 121, 9600 from 151, 12000 from 181, 14400 from 211, and the cap of 15000 from minute 241, where the sum would be 16800. Before the change the cap was reached at minute 361.

**What a wrong answer is likely to do.**

- Charge every step double once there are more than four. `hollow-all.ts` does this: 12000 at minute 121.
- Charge the fourth step double already. `hollow-fourth.ts` does this: 6000 at minute 91.
- Put the cap on the plain part and add the doubled part on top. `hollow-cap.ts` does this: 16800 at minute 241.
- Write the function anew from its first line and round the steps down, or drop the cap.
- `hollow-lost.ts` has the right `lateCharge` and a `fuelCharge` that bills to the nearest litre where the file bills every started litre; one case of `unchanged` fails it.
- Reach the cap at the wrong step, or let the price grow with each step. `hollow-capeighth.ts` gives the cap from the eighth step, and `hollow-doubling.ts` doubles each step after the fourth on the one before it. The case "charges every step after the fourth at twice the price" fails each.
- Seventeen more files have a right `lateCharge` and change one other declaration a little. Each fails the case of `unchanged` written for it: `hollow-gonesheet` (`daySheet` drops the departure of a boat that has gone), `hollow-forboatclosed` (`forBoat` leaves out a closed hire), `hollow-dropeither` (`dropDamage` works on either side), `hollow-tickkeepsnote` (`tick` with no note keeps the old one), `hollow-readkeepsfuel` (`read` keeps the earlier fuel figure), `hollow-heldcharged` (`held` takes off what was charged), `hollow-mergezero` (`mergeCharges` drops a code that comes to 0), `hollow-cancelreason` (`cancel` wants a reason), `hollow-markonemm` (`noteDamage` refuses 1 mm), `hollow-removeback` (`remove` takes a hire whose boat is back), `hollow-ticksame` (`tick` does not note a tick that changes nothing), `hollow-pastmidnight` (`nextFree` offers a slot past midnight), `hollow-fuellitre` (`charges` drops a part of a litre), `hollow-owespound` (`close` notes a debt under £1 as a refund), `hollow-emptywarn` (`warnings` says nothing of an empty tank), `hollow-readorder` (`read` refuses a reading timed before the one it replaces), `hollow-fuelhalf` (`fuelUsed` drops under half a litre).

**A right answer from the outline alone.** Two answers that quote only the first line, `export function lateCharge(lateMin: number): number {`, which the outline prints, pass the whole check.

- The wrapper. The edit puts a new `lateCharge` before the old body and renames the old one, as `function lateChargeBefore(lateMin: number): number {`. The new body takes `lateChargeBefore(lateMin) / LATE_STEP_PENCE` as the steps and charges the steps after the fourth twice, under the cap. It needs nothing from the old body: the old charge is a whole number of steps until its cap, and the new cap comes sooner.
- A guess. The edit writes a new body and renames the old one, or leaves it unused. With `Math.ceil(lateMin / LATE_STEP_MIN)` and nothing for 0 minutes or less it is right; with `Math.floor` it fails eleven cases. Those two facts are in the body and the comment above it, not in the outline.

So an `outline-1` pass on PO2 must be read before it is counted. A wrapper is a right answer that did not need the body; a guess is two facts of the body guessed right. A change written in place does need the body. The same route is open in any `inside` task whose new result can be made from the old one, so closing it is for the run's author.

**The check.** Five cases on `lateCharge`, and one that reads the charge through `Handover.charges`, which calls it. Two old cases are skipped, the two that pin the price of a step after two hours and where the cap begins: `lateCharge: a step costs the same after two hours` and `lateCharge: stops at the cap`. Every other old case stays; those that go through `Handover.charges` use a lateness of 120 minutes or less, and so do the cases added to `unchanged` after the adversary's findings.

# PD1 (beside): where the change is

**The right change.** A new exported function `usageByBoat(ledger, fromDay, toDay)` anywhere at the top level of `src/fuel.ts`; the reference adds it at the end of the file. It walks `ledger.entries`, keeps entries with `kind === "draw"`, a boat other than `YARD` (`""`), and `fromDay <= day < toDay`, sums `volume` by boat, and sorts the pairs by volume downward, then by name upward.

**What it needs of the file.** Only what the outline shows: `Ledger.entries`, the fields of `Entry` (`kind`, `day`, `boat`, `volume`), the three words of `EntryKind`, and `export const YARD = "";`. The order of the ledger and the unit of a volume do not matter to a sum.

**What a wrong answer is likely to do.**

- Count `toDay` (`day <= toDay`): `hollow-ends.ts`. The case "does not count a draw on toDay" fails it.
- Keep the yard's draws, as a pair named `""`: `hollow-yard.ts`.
- Leave the kind out and go by the boat alone: `hollow-kind.ts`. Passes on a ledger where only draws carry a boat's name, so one case posts a delivery and an adjustment that carry one.
- Sort by volume only and leave ties in the order met: `hollow-order.ts`.
- Put ties in order by part of the name: `hollow-initial.ts` goes by the first letter only. The case "puts names that begin alike in order by the whole name" fails it, with Kestrel, Kingfisher and Kite.
- Give a tie comparator that answers true or false where a number is wanted: `hollow-boolean.ts`. The case "puts boats with the same volume in name order" fails it, and no other does.
- Turn a backward range round, so that `toDay` before `fromDay` gives the days between: `hollow-backward.ts`. The ask's days run from `fromDay` up to `toDay`, so there are none, and the case "gives an empty array when toDay is before fromDay" fails it.
- Call `drawnBetween` for each boat. That is right: its days run the same way. An answer that calls `drawsOf` and takes the days itself is right too.
- An answer written as a whole file from the outline fails the cases of `fuel as it was`: `hollow-lost.ts` is the reference with `chargeFor` rounding to the nearest penny. Five more are the reference with one other function a little changed, and one case of `fuel as it was` fails each: `hollow-room.ts` (`recordDelivery` counts the room at the delivery's own time), `hollow-price.ts` (`priceOn` takes the later of two points for one day), `hollow-plus.ts` (`describeEntry` puts a plus sign on an adjustment above zero), `hollow-words.ts` (`openLedger` refuses in other words) and `hollow-comma.ts` (`formatPence` puts a comma in the thousands).
- "Name order, A before B" does not say how capitals compare. The check's names are all plain words with one capital, so an answer that compares code units and one that sets capitals aside both pass. Keep any new case to such names.
- An edit that quotes a line the outline prints will be refused when it copies the outline's two-space indent or drops a member's semicolon. An empty SEARCH, which adds at the end, always applies.

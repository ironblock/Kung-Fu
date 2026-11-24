# PN2, inside: `PartsStore.receive`

**The right change.** In `receive`, lines 334 to 352 of the file with the comment above it, the line that sets `line.avgPence` (line 346, under the comment on line 345) runs only when `packPence` is above 0:

```ts
if (packPence > 0) {
    // the average of what is on the shelf and what has come in, to the nearest penny
    line.avgPence = Math.round((line.onHand * line.avgPence + packs * packPence) / (line.onHand + units));
}
```

Nothing else in the method moves. `line.onHand += units`, `line.deliveredDay = day`, the `log` call and `return units` stay outside the `if`. `unitPence` is `Math.round(0 / packSize)`, which is 0 already.

**Why it needs the body.** The first line of `receive` says nothing of an average. The text to replace is the line that sets `avgPence`, and it cannot be quoted from the outline.

**What a wrong answer is likely to do.**

- Return early for a price of 0, having put the units on the shelf, and so skip the day of the last delivery and the log. This is `hollow-skip.ts`.
- Leave a free delivery out of the log. This is `hollow-quiet.ts`.
- Keep the average only while there is stock, and let an empty shelf take the price of 0. This is `hollow-empty.ts`. The ask says "whether or not there is any of the part on the shelf".
- Log the free units at the average price and not at 0. This is `hollow-priced.ts`.
- Leave the free units out of `onHand` when the next paid delivery is averaged in.
- Treat a price of 1 as free, with a test such as `packPence < part.packSize`.
- Go by the unit price, `Math.round(packPence / part.packSize)`, and not by the pack price, so that a paid pack of 4 at 1p is left out of the average. This is `hollow-unitprice.ts`. The ask says "any price above 0".
- Handle a free delivery in a branch of its own at the top, and in it refuse less than the method refuses now: a bad number of packs (`hollow-unrefused.ts`) or a part the store does not have (`hollow-unknownfree.ts`). The ask says "A delivery that is refused now is still refused."
- Quote the long `line.avgPence = …` line from memory and get a bracket or a space wrong, so that the edit is refused.
- Write the whole file anew. `hollow-lost.ts` stands for this: the change is right, and `correct` takes from the earliest hold, not the latest, when a count cannot cover the holds. Six more are the reference with one other method a little changed, and one case of `unchanged` fails each: `hollow-ceil.ts` (`receive` logs the unit price rounded up), `hollow-partpack.ts` (`receiveAll` lets through part of a pack), `hollow-countday.ts` (`correct` never moves the day of the last count back), `hollow-byday.ts` (`correct` cuts the hold with the latest day, not the one made last), `hollow-joinplace.ts` (`moveHold` puts a joined hold where the moved one stood) and `hollow-issueprice.ts` (`giveBack` logs the price of the job's last issue).

**Right answers that need no body.** Added by Claude Opus 5.5 on 2026-11-22, as the second mender, after the adversary's finding on this task's kind. A reader of the outline alone can make the change in two ways, each with one edit whose SEARCH is the first line of `receive` as the outline prints it. I applied both with the bench's own applier and ran them on the check as it is now.

- A wrapper. The REPLACE is a new `receive` that reads `this.avgPence(partNo)`, calls the old body under a new name such as `receiveAsItWas`, and for a price of 0 puts the average back through `this.lineOf(...)`. Then comes the new first line for the old body. It needs no fact of the body, and it passes all 143 cases.
- A branch. Under the first line, a price of 0 does the whole delivery itself with `known`, `lineOf`, `log` and `NO_JOB`, from the effects the ask lists. It passes only if it refuses a bad number of packs with a `RangeError`. That a refusal is a `RangeError` is in the bodies only. The same branch with `throw new Error(...)` fails the case "still refuses what it refuses now, and changes nothing".

So a pass in `outline-1` on this task does not show that the outline holds what the change needs. Read each such reply, say which way it went, and count those passes beside the score. Written in place, the change needs the body, and for the reader of `region.md` the task is of its kind.

**The one case of `unchanged` the check skips:** `receive: a pack that cost nothing pulls the average down`. It pins what the ask changes.

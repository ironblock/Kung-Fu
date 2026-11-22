# Adversary's findings: module `parts`, tasks PN1 (beside), PN2 (inside), PN3 (leans)

W = /home/build/patch/parts/set. I changed no file of the writer's. I added only `tasks/<id>/other.ts` and `tasks/<id>/hollow-adv-<n>.ts`.

Last lines as W stands now:
- `python3 bench/box.py check-tasks W --window none` ends `window: none; 20 WRONG`. All 20 are my breaching files. Every reference, plain, `other` and writer's hollow is as it must be.
- `python3 bench/holds.py check W` ends `all as they must be`.

## Summary

- **20 breaches.** 17 are the ask done right with one other function changed, so the hole is in `checks/helpers-parts.ts` and one mend there serves all three tasks. 3 are PN2's ask done wrong (`hollow-adv-8`, `-9`, `-10`).
- **All three `other.ts` pass.** I wrote them from the ask and the module before opening any `reference.ts` or check. No check tests something its ask does not say.
- **PN2 is not strictly `inside`.** Two replies written from the ask and the outline alone are applied by the bench's own applier and pass the check. Details under PN2.
- PN1 and PN3 are of their kinds, with small notes.
- The module is sound.

Every breaching file type-checks under `tsc --strict`. For each I ran one call on the module and on the file, and give both results below.

## PN1 (beside): `PartsStore.shortfall`

**Breaches** (ask done right, something else changed; each passes all 128 cases):

| File | What it gets wrong | A call that shows it: module, then file | Why the helper misses it |
| --- | --- | --- | --- |
| `tasks/PN1/hollow-adv-1.ts` | `formatPence` cuts a part of a penny off (`Math.trunc`), where the module rounds to the nearest | `formatPence(12.6)`: `£0.13`, `£0.12` | every `formatPence` case passes whole pence |
| `tasks/PN1/hollow-adv-2.ts` | `byText` is `a.localeCompare(b)`, so `sortByBin`, `partNos`, `reorderList` and `slowMovers` order by locale, not by code unit | `reorderList` with suppliers `de Wyck` and `Pellow & Tarn`: `[Pellow & Tarn, de Wyck]`, `[de Wyck, Pellow & Tarn]`. `sortByBin` with bins `b1`, `C1`: `[C1, b1]`, `[b1, C1]` | every bin, part number and supplier that is sorted in the helper is in one letter case |
| `tasks/PN1/hollow-adv-3.ts` | `keyOf` is `raw.trim().replace(/ /g, "").toUpperCase()`: a tab inside stays | `keyOf("eng\t-0412")`: `ENG-0412`, `ENG\t-0412`; `isPartNo` of it: `true`, `false` | "keyOf: drops spaces wherever they are" has its only tab at the end: `mod.keyOf("  eng - 04 12\t")` |
| `tasks/PN1/hollow-adv-4.ts` | `describeMove` writes `+0` for a movement of no units (`>= 0`) | count of 0 units: `day 3: count 0 ENG-0412, £0.00`, `day 3: count +0 ENG-0412, £0.00` | no `describeMove` case has 0 units |
| `tasks/PN1/hollow-adv-5.ts` | `mergeKit` drops a line only at 0 units or under (`<= 0`), where the module drops under 1 | `mergeKit([{partNo:"ENG-0001",units:0.5}])`: `[]`, the line kept | "mergeKit: drops lines that ask for nothing" has units 0 and -2 only |
| `tasks/PN1/hollow-adv-6.ts` | the refusal of an unknown part has other words | `shelve("ENG-9999","A1")`: `unknown part: ENG-9999`, `no part ENG-9999 in the store` | every refusal is tested as `toThrow(RangeError)`; no message is pinned |

Low weight, by my judgement: adv-3, adv-4, adv-5 (inputs the store never makes) and adv-6 (words of a message). adv-1 and adv-2 are what a file written anew would plausibly get wrong.

**Kept, though the check fails it (came close):** `tasks/PN1/hollow-adv-9.ts`. It looks the part up as typed (`this.parts.has(partNo)`). It fails one case of 128: "takes a part number typed in any case".

**The ask done wrong, tried and failed by the check (deleted):** no stop at 0; all the job's holds of any part counted; the larger of own hold and free stock, not the sum; other jobs' holds taken off twice. I found no wrong `shortfall` the check passes.

**`other.ts`: passed.** It guards with `this.part(partNo) === undefined` and sits at the end of the class, before `private known`.

**Kind: it is `beside`.** The reference edit quotes `avgPence(partNo: string): number {`, a line of the outline. What is only in a body:
- `freeOf` and `heldFor` give 0, and do not throw, for a part the store has not. The ask says "For a part the store does not have, it returns `units`". The plain sum gives that only because of this fact. The outline also shows `private known(partNo: string): Part`, which hints that some lookups refuse.
- A reader who adds a guard needs a lookup that takes any case. That `part()` and `keyOf` do so is only in bodies. The ask says it only of `freeOf` and `heldFor`: "Both take a part number in any letter case."
- No trap follows. Unguarded, guarded by `part()`, by `this.parts.has(keyOf(partNo))`, or by try and catch round `known`: all are right. One sentence would close it: "Both give 0 for a part the store does not have." The ask is 169 words by `wc -w`, so a word must go to make room.
- Small ambiguity: "it returns `units`, a whole number of 1 or more." The last words can be read as a rule for the unknown-part case only, or as a duty to refuse a bad `units`. The check passes no `units` under 1, so neither reading fails. Clearer as its own sentence: "`units` is always a whole number of 1 or more."

## PN2 (inside): `PartsStore.receive`

**Breaches, the ask done wrong (each passes all 129 cases):**

- `tasks/PN2/hollow-adv-8.ts`: goes by the unit price as logged (`if (unitPence > 0)`), so a paid delivery whose unit price rounds to 0 is not averaged in. Packs of 4, 4 on the shelf at 100, then `receive(…, 1, 1, 2)`: right answer 50, file 100. The ask: "A delivery with any price above 0 is averaged in as it is now". The check's only price under a penny a unit is `const s = store(2); … s.receive("ENG-0412", 1, 1, 3);`, where the unit price is `Math.round(0.5)`, which is 1. With packs of 4 that case would catch it.
- `tasks/PN2/hollow-adv-9.ts`: a branch at the top for a price of 0 that does not refuse a bad number of packs. `receive("ENG-0412", 0, 0, 2)`: module throws `RangeError`, file returns 0 and logs a delivery of 0 units. `receive("ENG-0412", 1.5, 0, 2)`: module throws, file puts 1.5 units on the shelf.
- `tasks/PN2/hollow-adv-10.ts`: the same kind of branch, refusing bad packs but returning 0 for a part the store has not. `receive("ENG-9999", 1, 0, 2)`: module throws `RangeError: unknown part: ENG-9999`, file returns 0.
- For both: the ask says "Everything else about such a delivery stays as it is now". No case refuses anything at a price of 0. The helper's refusals are `store.receive("ENG-9999", 1, 100, 2)`, `("ENG-0412", 0, 100, 2)`, `("ENG-0412", 1.5, 100, 2)`, `("ENG-0412", 1, -1, 2)` and `("ENG-0412", 1, 10.5, 2)`.

**Breaches, the ask done right and something else changed:**

| File | What it gets wrong | Module, then file | Why the helper misses it |
| --- | --- | --- | --- |
| `tasks/PN2/hollow-adv-1.ts` | `receive` logs the unit price rounded up (`Math.ceil`), not to the nearest | packs of 4 at 401: `unitPence` 100, 101 | its two odd prices, 101 over 3 and 301 over 2, both round up |
| `tasks/PN2/hollow-adv-2.ts` | `receiveAll` checks only `line.packs < 1 \|\| line.packPence < 0`, so a note with 1.5 packs is half booked | note of a good line then 1.5 packs: throws with 0 on hand, throws with 2 on hand | "receiveAll: a bad line anywhere" has an unknown part, 0 packs and a price of -5; no part of a pack, no part of a penny |
| `tasks/PN2/hollow-adv-3.ts` | `correct` never moves the day of the last count back (`Math.max`) | count on day 12, then one booked for day 9: `lastCounted` 9, 12 | the counts are on days 12 then 13. The same edge is pinned for deliveries (9 then 6), not for counts |
| `tasks/PN2/hollow-adv-4.ts` | `correct` takes from the hold with the latest day, where the module takes from the hold made last | J-1 set aside on day 5, then J-2 booked for day 3, 10 counted as 5: held `[4, 1]`, `[1, 4]` | in "the latest hold gives way first" the holds are made on days 2 then 3, so day and order agree |
| `tasks/PN2/hollow-adv-5.ts` | `moveHold` onto a job that has a hold puts the joined hold where the moved one stood | holds J-1, J-2, J-3 of 4 each, move J-1 to J-3, count 9: J-2 and J-3 hold `[4, 5]`, `[1, 8]` | "moveHold: to a job with a hold, which grows" reads only `holdsFor` of the two jobs; no third job, no short count after |
| `tasks/PN2/hollow-adv-6.ts` | `giveBack` logs the price of the job's last issue, not the price carried now | issue at 100, a delivery lifts the average to 200, return: `unitPence` 200, 100 | in the `giveBack` case the average is 250 at the issue and at the return |

**Kept, though the check fails it (came close):** `tasks/PN2/hollow-adv-11.ts`, `if (packPence >= part.packSize)`. It fails one case of 129: "is averaged in as before when no free pack has come".

**Tried and failed by the check (deleted):** free units left out of the next average; `setAside` giving a grown hold the new day.

**`other.ts`: passed.** It tests `packs * packPence !== 0` and works the average from the shelf count taken before the units go on.

**Kind: everything a right answer needs is in the ask and `region.md`. But the change can be written from the outline alone, in two ways.** I wrote each as a reply in the run's form. `small.parse_edits` and `small.apply_edits` gave `applied` for each, and the check passed each file. I then deleted the files, since they are right answers and `check-tasks` would call them WRONG for ever. Both quote only `receive`'s first line as the outline prints it.

1. A wrapper. It needs no fact from the body, and its behaviour is right in every case, refusals too:

```
<<<<<<< SEARCH
receive(partNo: string, packs: number, packPence: number, day: number): number {
=======
receive(partNo: string, packs: number, packPence: number, day: number): number {
        const before = this.avgPence(partNo);
        const units = this.receiveAsItWas(partNo, packs, packPence, day);
        if (packPence === 0) {
            this.lineOf(this.known(partNo).partNo).avgPence = before;
        }
        return units;
    }

    private receiveAsItWas(partNo: string, packs: number, packPence: number, day: number): number {
>>>>>>> REPLACE
```

2. A branch at the top that does the whole free delivery itself. After the first line it inserts: `if (packPence === 0) { const free = this.known(partNo); const shelf = this.lineOf(free.partNo); if (!Number.isInteger(packs) || packs < 1) { throw new RangeError(...); } const added = packs * free.packSize; shelf.onHand += added; shelf.deliveredDay = day; this.log({ partNo: free.partNo, kind: "delivery", units: added, day, jobId: NO_JOB, unitPence: 0 }); return added; }`.
   - It is open because the ask lists every effect: "the units go on the shelf, the day of the last delivery is set, the movement is logged with a unit price of 0, and the units added are returned".
   - The outline shows the rest: `known`, `lineOf`, `log`, `NO_JOB`, and the members of `StockLine`, `Movement` and `Part`.
   - `hollow-adv-9` and `-10` are careless forms of this branch, and they pass too.

What this means for the mender:
- `WRITER.md` says of an `inside` change: "it cannot be written from the first line." The run's README sends PN2 to `outline-1` as one of "the tasks where an outline cannot be enough". For PN2 that is not so.
- Refusal cases at a price of 0 (0 packs, 1.5 packs, an unknown part, each `toThrow(RangeError)` with the store unchanged) would close `hollow-adv-9` and `-10`. They would also make the branch need a body-only fact: that refusals are `RangeError`.
- They do not close the wrapper. Any change of the shape "in case X, leave field Y as it was" is open to a wrapper. Closing it needs another change, one that alters a step in the middle of a body.
- Whether a wrapper is within what the kind rule means to shut out is the mender's call. I judge a small model unlikely to write one, and the ceiling model able to.

## PN3 (leans): `PartsStore.history`

**Breaches** (ask done right, something else changed; each passes all 127 cases):

| File | What it gets wrong | Module, then file | Why the helper misses it |
| --- | --- | --- | --- |
| `tasks/PN3/hollow-adv-1.ts` | `stocktake` hands its lines back sorted by part number, where the module keeps the sheet's order | sheet GAS-0002 then ENG-0412, both out: `[GAS-0002, ENG-0412]`, `[ENG-0412, GAS-0002]` | the sheet is `eng-0412`, `ELE-0003`, `GAS-0002`, and ELE is not out, so sheet order and sorted order agree |
| `tasks/PN3/hollow-adv-2.ts` | `slowMovers` leaves out a part whose stock is all set aside (`freeOf === 0`), where the module goes by `onHand` | 4 on the shelf, all set aside, never drawn: `[ENG-0412]`, `[]` | no `slowMovers` case sets anything aside |
| `tasks/PN3/hollow-adv-12.ts` | `usage` never goes under 0 | 2 given back in a period with no issue: -2, 0 | no case has more come back than went out in its period. `coverOf` gives -1 either way |
| `tasks/PN3/hollow-adv-13.ts` | `giveBack` refuses more units than the job has been issued | `giveBack` of 2 for a job issued none: 11 on hand, throws `RangeError` with 9 on hand | every `giveBack` in the helper and in the three checks follows an issue of at least as many units to the same job |
| `tasks/PN3/hollow-adv-14.ts` | `setAside` moves a hold that grows to the back of the queue | J-1 3, J-2 3, J-1 one more, 10 counted as 5: held `[4, 1]`, `[2, 3]` | "setAside: a second time for the same job" reads only `holdsFor("J-1")` |

**The natural wrong guess, in other forms: all failed, as they must.** I wrote four, each from the belief that the log grows at its end:
- a walk back from the end, put back in the log's order: failed 5 cases;
- `found.slice(found.length - limit)` only when there are more than the limit: failed 5. Kept as `tasks/PN3/hollow-adv-7.ts`;
- a walk back handed out as walked: failed 6;
- turn round, cut, turn back: failed 5.

**Kept, though the check fails it (came close):** `tasks/PN3/hollow-adv-10.ts`, where the movements are not copies when a limit is given. It fails one case of 127: "still hands out copies".

**Tried and failed by the check (deleted):** a cut one short; `dueForCount` a day late; `movesBetween` with its last day in; `reorderList` by part number only.

**`other.ts`: passed.** It is a loop over `this.moves` that stops at the limit.

**Kind: it is `leans`.**
- The ask does not give the fact away. It says "the ones the store recorded last" and "in the same order, one against another, as the method returns them now". It never says which end is newest, and it names no other declaration in a code span.
- `region.md` does not show it. It shows `return this.moves.filter((m) => m.partNo === key).map((m) => ({ ...m }));` and nothing of how `this.moves` is filled.
- The other declaration's first line, `private log(move: Movement): void {`, does not show it. Nor does `private moves: Movement[] = []`.
- The natural guess is wrong. A log that grows at its end gives `slice(-limit)`, which here returns the part's oldest movements. The check fails it in every form above.
- The whole file shows the fact plainly: lines 651 and 652, `// newest first: the store screen shows the top of the log` and `this.moves.unshift(move);`. Line 565 and 566 show it again: "the report reads oldest first" and `.reverse()`.
- A careful reader of `region.md` would see that another declaration matters. The body reads `this.moves`, the ask rules out the day number, and the ask's word "logged" points at `log` in the outline.

Three notes, none a fault I would mend:
- The ask opens "The store screen shows a part's history". The comment in `log` gives that same screen as the reason for newest first. A reader may reason that a screen shows the newest at the top and land on `slice(0, limit)` without the fact. I judge that a weak hint, not the fact given away.
- The check runs through vitest, which does not type-check. An answer with `limit: number`, not optional, passes at run time, though the ask says "an optional second parameter". No behaviour differs.
- A region reader has a route that needs no fact: quote `log`'s first line from the outline, record a sequence number there, and pick by it. I did not write it out. It is far from likely.

## The module

- **Nothing broken, nothing that changes from run to run.** No clock, no random number, no import. Its sorts are stable and its maps are read in the order they were filled.
- **Form.** 654 lines. No line over 120 columns. No line the bench reads as a mark. `tsc --strict` is clean on the module, on the three references, on my three `other.ts` and on every `hollow-adv` file.
- **Outline.** `holds.py check` says `first lines the outline shows with a bracket left open, by file: src/parts.ts 0`.
- **It reads as real code.** Comments are sparse and placed where a developer would leave one. The conventions a guess gets wrong are in bodies: the log newest first, `movesBetween` oldest first, the half-open `inDays`, `sortByBin` sorting its argument, a reorder level of 0 meaning never, a hold keeping its day and place, the latest hold giving way first.
- **One case of the helper tests nothing.** In "dueForCount: parts never counted, in shelf order", the line `expect(store.partNos()).toEqual([...])` stands under the comment "the store's own list of parts is not put in shelf order by this". `partNos()` sorts on every call, so it would pass whatever `dueForCount` did to the list.
- **The helper is thorough on ends of ranges and on refusals at ordinary values.** It failed all 9 of my other changes of that sort. Its holes are of four kinds:
  - rounding pinned only where up and nearest agree (adv PN2-1, PN1-1);
  - order pinned only where two orders agree (PN3-1, PN2-4, PN1-2);
  - the place of a hold in the queue after `setAside` or `moveHold` (PN3-14, PN2-5);
  - a few edges with no case: a count booked late, a negative `usage`, a return with no issue, a part of a pack in `receiveAll`.

## What I did not do

- I did not read the writer's notes. I read `where.md`, the references and the writer's hollows only after my `other.ts` files had passed.
- I did not send any request to a model. "Likely" and "unlikely" above are my judgement.
- My working files are in `SCRATCH/adv-parts`: `cands.py` and `cands2.py` make every candidate, `probe.mjs` runs the calls quoted above, and `reply-wrapper.md` and `reply-branch.md` are the two outline-only replies for PN2. The scratchpad may be cleared; everything the mender needs is in this report and in W.
# PN3, leans: `PartsStore.history`

**The right change.** In `history`, lines 558 to 561 of the file, a second parameter and a cut from the front of the list:

```ts
history(partNo: string, limit?: number): Movement[] {
    const key = keyOf(partNo);
    return this.moves.filter((m) => m.partNo === key).slice(0, limit).map((m) => ({ ...m }));
}
```

**The other declaration.** `PartsStore.log`, lines 650 to 653:

```ts
private log(move: Movement): void {
    // newest first: the store screen shows the top of the log
    this.moves.unshift(move);
}
```

**The fact.** The log is kept newest first. Every movement is put at the front of `this.moves`. So the movements recorded last are at the start of what `history` filters, and "the latest `limit`" is `slice(0, limit)`.

**The lines that show it.** Lines 651 and 652, in the body of `log`. Its first line, `private log(move: Movement): void {`, leaves the order open, and so does the field's line, `private moves: Movement[] = []`. `movesBetween`, lines 563 to 567, shows it a second time: it ends in `.reverse()` under the comment "the report reads oldest first". Nothing in `history`'s own lines shows it: they filter and copy.

**Why the reader must look.** `history` reads `this.moves`, and the ask wants "the ones the store recorded last" in the order the method returns now. Which end of `this.moves` those are at depends on how `log` adds to it. The ask rules out going by day number, so the order of the list is the only thing that can say.

**The natural wrong guess.** A log grows at its end, so the latest are the last: `found.slice(-limit)`. This is `hollow-guess.ts`. With the log as it is, that returns the part's oldest movements.

**What else a wrong answer is likely to do.**

- Sort by day and take the highest. This is `hollow-day.ts`. The check books a count late, with a lower day number than the movements before it, and a delivery later still.
- Cut `this.moves` to the limit before it picks out the part. This is `hollow-early.ts`.
- Take the right movements and turn them round, to put the "latest last". This is `hollow-turned.ts`.
- Drop the `.map` that copies.
- Write the whole file anew. `hollow-lost.ts` stands for this: the change is right, and `usage` counts the last day of its period too. Five more are the reference with one other method a little changed, and one case of `unchanged` fails each: `hollow-sorted.ts` (`stocktake` hands its lines back by part number, not in the sheet's order), `hollow-setaside.ts` (`slowMovers` leaves out a part that is all set aside), `hollow-floor.ts` (`usage` never goes under 0), `hollow-overreturn.ts` (`giveBack` refuses more than the job was issued) and `hollow-requeue.ts` (`setAside` sends a hold that grows to the back of the queue).

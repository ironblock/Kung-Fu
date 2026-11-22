# PN1, beside: `PartsStore.shortfall`

**The right change.** A new method on `PartsStore`, anywhere in the class:

```ts
shortfall(partNo: string, units: number, jobId: string): number {
    const reach = this.freeOf(partNo) + this.heldFor(partNo, jobId);
    return Math.max(0, units - reach);
}
```

The reference puts it before `avgPence`, at line 322 of the file, straight after `freeOf`. Its edit quotes `avgPence(partNo: string): number {`, which is one line of the outline and is in the file once.

**What the outline gives.** The first lines of `freeOf`, `heldFor`, `held`, `onHand` and `keyOf`, the private fields `holds: Hold[]` and `stock`, and the members of `Hold` and `StockLine`. The ask says what `freeOf` and `heldFor` return, since only their bodies do.

**What a wrong answer is likely to do.**

- Leave the job's own hold out: `units - this.freeOf(partNo)`. This is `hollow-free.ts`.
- Count the whole shelf: `units - this.onHand(partNo)`, which lets a job reach other jobs' holds. This is `hollow-shelf.ts`.
- Return what can be handed over, not what is short. This is `hollow-reach.ts`.
- Not stop at 0, and give a negative number when more is within reach than was asked.
- Read `this.holds` or `this.stock` directly with the part number as typed, and miss a part number in lower case. `freeOf` and `heldFor` pass it through `keyOf`.
- Throw for a part the store does not have, by calling a helper that refuses one. The ask wants `units` back.
- Quote a line the file does not hold as the outline prints it. The outline prints a member's first line with two spaces before it and a field with no `;`. The file has four spaces and the `;`.
- Add the method at the end of the file with an empty SEARCH. That lands outside the class and the file does not load.
- Write the whole file anew from the outline. `unchanged` then fails on the bodies it guessed. `hollow-lost.ts` stands for this: the method is right, and `reorderPacks` orders only under the reorder level, not at it. Six more are the reference with one other function a little changed, and one case of `unchanged` fails each: `hollow-trunc.ts` (`formatPence` cuts a part of a penny off), `hollow-locale.ts` (`byText` compares by locale), `hollow-tab.ts` (`keyOf` keeps a tab inside), `hollow-pluszero.ts` (`describeMove` writes `+0`), `hollow-halfunit.ts` (`mergeKit` keeps a line for half a unit) and `hollow-wording.ts` (the refusal of an unknown part has other words).

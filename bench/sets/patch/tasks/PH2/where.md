# PH2, inside: `Manifest.addLoad` folds an item into a row only at the same unit weight

## The right change

In the method `addLoad` of the class `Manifest` (lines 562 to 576 of the file). The body now is:

```ts
this.mustBeDraft();
if (!(item.count > 0) || !(item.unitKg >= 0)) {
    return false;
}
const label = squash(item.label);
const same = this.load.find((l) => l.stowed === item.stowed && l.label.toLowerCase() === label.toLowerCase());
if (same !== undefined) {
    // the same thing in the same place is one row, and the unit weight first given stands
    same.count += item.count;
} else {
    this.load.push({ ...item, label });
}
return true;
```

A right change adds the unit weight to what `find` looks for, so that the row found is one with the same place, the same label and the same unit weight:

```ts
const same = this.load.find(
    (l) =>
        l.stowed === item.stowed &&
        l.unitKg === item.unitKg &&
        l.label.toLowerCase() === label.toLowerCase(),
);
```

The reference also rewords the comment. Nothing else in the file changes.

## Why it needs the body

The first line, `addLoad(item: LoadItem): boolean {`, shows none of what the ask says must stay: that a sealed manifest throws before anything else, that a count of nought or less and a unit weight below nought are refused with `false`, that the label is tidied with `squash` and matched without regard to case, and that the row kept is a copy with the tidied label. The change is to the test inside `find`, which is not in the outline, so it cannot be quoted from there. A branch put in front of the old body from a guess gets at least one of those wrong.

## What a wrong answer is likely to do

- **Test only the row `find` already gives** (`hollow-first.ts`): keep `find` as it is and write `if (same !== undefined && same.unitKg === item.unitKg)`. `find` gives the first row of that thing in that place. Once there are rows at 13.5 and at 15, a third item at 15 is compared with the 13.5 row and becomes a third row. The check fails it at "an item is folded into the row of its own unit weight, whichever row that is".
- **Put a new branch before the old body** (`hollow-early.ts`): look for a row of the same thing and place at another weight, and if there is one, push the item and return. It skips the refusals and the tidying, and it makes a new row when a row at the item's own weight is there too. The check fails it at the cases on labels, on what is refused, and on which row is folded into.
- **Compare the unit weights loosely** (`hollow-halfkilo.ts`, within half a kilo; `hollow-tenth.ts`, to one place; `hollow-ceil.ts`, after rounding up). The check fails each at "unit weights that differ by a little are still different", with 13.5, 13.54 and 13.9 kg.
- **Move the sealed check after the refusal** (`hollow-sealedlast.ts`), **refuse a part of one** (`hollow-countone.ts`), or **let a count or a weight that is not a number through** (`hollow-nan.ts`). Each changes what is refused or what is given back, which the ask says stays. The check fails each through `unchanged`, at "Manifest: a sealed manifest throws before it looks at what it is given" and at "Manifest.addLoad: a part of one is taken, and a count or a weight that is not a number is refused".
- **Match the label exactly** in the new test, dropping `toLowerCase` or `squash`. The check's case on labels fails it.
- **Change the kept row's unit weight** to the new one. The first case fails it.
- **Quote the body from a guess.** The edit is refused: the body's text is not in the outline.
- **Write the file anew.** `hollow-lost.ts` is the reference with `isAboard` taking `leaveLeg` for the last leg aboard (`<=` for `<`). The check fails it through `unchanged`.
- **One other function a little off.** `hollow-jacketage.ts`, `hollow-tieorder.ts`, `hollow-metrefloor.ts`, `hollow-sealperson.ts`, `hollow-pencetrunc.ts` and `hollow-aboardnegative.ts` are the six of PH1's `where.md` of that name, each on a right `addLoad`. The check fails each through `unchanged`.

## A right answer from the outline alone

The change can be written without the body. Keep the old method under a new name, which quotes only its first line, `addLoad(item: LoadItem): boolean {`, and put a new `addLoad` in front of it that hands the old one only the rows at the item's unit weight and then puts the rows back in their places. It passes the check. So a pass in `outline-1` is possible, and it is not by luck. Read such a pass for that shape: a new method that calls a renamed old one and works on `this.load` around the call. A reply that guesses the body and quotes it is refused, as above.

The check skips one case of `unchanged`: "Manifest.addLoad: when the unit weights differ it is still one row, at the first unit weight". No other case of the helper adds the same thing to the same place at two unit weights.

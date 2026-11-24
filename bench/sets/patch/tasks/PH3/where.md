# PH3, leans: `renderManifest` shows the latest amendment

## The right change

In `renderManifest` (lines 778 to 823 of the file), at its foot:

```ts
const notes = m.amendments();
if (notes.length > 0) {
    out.push("");
    out.push(`Amendments: ${notes.length}`);
}
```

A right change adds one line after the count, for the first entry of `notes`:

```ts
out.push(`Latest: ${notes[0].text} (${notes[0].by})`);
```

Nothing else in the file changes.

## What it leans on

- **The other declaration:** the method `Manifest.amendments` (lines 681 to 684).
- **The fact:** it gives the amendments newest first. So the most recent amendment is `notes[0]`.
- **The lines that show it:**

  ```ts
  amendments(): Amendment[] {
      // newest first: the office reads these from the top
      return this.log.map((entry) => ({ ...entry })).reverse();
  }
  ```

  `amend` (lines 671 to 679) and `seal` add to the end of `this.log` with `push`, so the log itself is oldest first, and `amendments` turns it round.
- **What the first line leaves open:** `amendments(): Amendment[] {` says nothing of the order. `Amendment` holds `by` and `text` and no time or number, so the order cannot be worked out from the entries.
- **The natural wrong guess:** that a list of notes is in the order they were made, so the most recent is the last: `notes[notes.length - 1]`. `hollow-guess.ts` is the reference with that in place of `notes[0]`.
- **Why a careful reader of the region sees that it matters:** the named function's own lines hold `const notes = m.amendments();`, and the ask wants "the most recent" of them. Which end is the most recent is the one thing the region does not say.

The ask does not say the order and does not name `amendments`.

## What a wrong answer is likely to do

- **Take the last entry** (`hollow-guess.ts`). With one amendment the sheet is right. With two or more it shows the oldest. The check fails it at every case with more than one amendment.
- **Put the line before the count** (`hollow-before.ts`), or after a blank line. The check compares the whole sheet.
- **Move the count, or show the line only on a clean sheet** (`hollow-aboveproblems.ts` puts the amendments above the problems; `hollow-cleanonly.ts` shows the latest only when there are no problems). The check fails both at "on a draft with problems, after the problems and the count".
- **Pass over the yard's own notes** (`hollow-notsealed.ts` passes over "sealed"; `hollow-officenotes.ts` passes over "sealed" and "reopened: ..." too). `seal` and `reopen` write to the same log, and the count counts their notes, so the ask's "the most recent of the amendments that line counts" takes them. The check fails both at "the note of the sealing is counted, so it can be the latest", and `hollow-officenotes.ts` also at the case on a reopening. Only a reader of the whole file knows that these notes are there. A reader of the region who takes `notes[0]` gets them right without knowing.
- **Give every amendment a line.** The check's whole-sheet cases fail it, and one case says the older note is not on the sheet.
- **Sort or reverse the list first,** which turns a right order into a wrong one.
- **Write the file anew.** `hollow-lost.ts` is the reference with `gearKg` rounding to the nearest kilo and not up. The check fails it through `unchanged`.
- **One other function a little off.** `hollow-jacketage.ts`, `hollow-tieorder.ts`, `hollow-metrefloor.ts`, `hollow-sealperson.ts`, `hollow-pencetrunc.ts` and `hollow-aboardnegative.ts` are the six of PH1's `where.md` of that name, each on a right `renderManifest`. The check fails each through `unchanged`.

The check skips two cases of `unchanged`, the two that render a sheet with amendments: "renderManifest: a sealed sheet with its amendments counted" and "renderManifest: amendments on a draft with problems".

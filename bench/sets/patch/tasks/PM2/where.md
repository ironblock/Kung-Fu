# PM2, inside: `Invoice.pay` refuses a reference the invoice already has

**The right change.** In the body of `Invoice.pay` (lines 380 to 389 of the file as it starts; the comment above it begins at line 376), after the two checks that throw and before a payment is recorded: when `ref` is not empty and a payment in `this.payments` has the same `ref` with letter case aside, return `pence` and record nothing. The reference adds two lines above `const taken = ...`.

**What the region gives.** The method's lines show the list (`this.payments`), the shape of what is recorded (`{ day, pence: taken, method, ref }`), what comes back (`pence - taken`, and the comment above the method: "it gives back the pence it did not take"), and where the checks that throw stand. With the outline's `Payment` members that is all a right answer needs.

**What the ask leaves to the method's lines.** Mended 2026-11-22: the ask said "all of its pence come back as not taken", which let a reader with the outline alone write the change, by a guard or by a wrapper around the old method. It now says only that a refused payment does not throw, is not recorded and has none of it taken. What number then comes back is said by the comment above `pay` and by its last line, and not by its first line: a reader with the outline must guess between the pence given and 0. The ask also now says that outer spaces and accents count, so that the one reading of "the same reference" is the reference's.

**What a wrong answer is likely to do.**

- It compares the references as they are, and misses `bacs-17` against `BACS-17`. `hollow-case.ts`.
- It refuses the second payment with no reference too, because two empty references are the same. `hollow-empty.ts`. The cases of `unchanged` that pay twice with no reference fail it as well.
- It puts the new test first in the body, above the checks that throw, so a call with 0 pence and a reference used before returns 0 where it threw. `hollow-first.ts`.
- It records the reference in lower case. `hollow-folded.ts`.
- It matches a part of a reference: `startsWith` or `includes`. `hollow-part.ts`.
- It returns 0, or the pence taken, for a refused payment: the first line of the method does not say what the number is. The method's own lines do, and the ask does not.
- It trims the references before comparing them, as the module trims a hirer's name and a line's label, or records the reference trimmed. `hollow-trim.ts`, `hollow-storetrim.ts`.
- It compares with `localeCompare` at base sensitivity, so accents do not count; or it builds a `RegExp` from the reference. `hollow-accent.ts`, `hollow-regexp.ts`.
- It remembers a reference before the checks that throw, so a call that threw still blocks its reference. `hollow-remembered.ts`.
- With an outline only, it makes up the body's text and its edit is refused, or it writes the file anew. `hollow-lost.ts` stands for the second: the new behaviour is right and the late fee starts a day early.

One case of `unchanged` is skipped, `pay: the same reference twice on one invoice is taken twice`, since the change is to stop exactly that.

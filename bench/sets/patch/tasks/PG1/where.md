# PG1, `beside`: what is still owed on a boat

**The right change.** One new method of the `BookingBook` class, `outstanding(boatId: string): Pence`. It goes
over `this.bookings`, takes the bookings of that boat whose state is `"held"` or `"confirmed"`, and sums
`Math.max(0, chargePence - paidPence)` over them. It reads and changes nothing else.

**Where.** Inside the class, which runs from line 332 to line 625 of the file. The reference puts it before
`addNote` (line 547), because `addNote` has no comment above it, so a method put before its first line does not
land between another method and its comment. Any place inside the class is right.

**What the outline gives.** Everything the method needs: the private field `bookings: Booking[]`, the fields
`boatId`, `state`, `chargePence` and `paidPence` of `Booking`, the four states, and `isLive(b: Booking): boolean`
for a reader who trusts the name. `forBoat(boatId)` and `all()` would also do.

**What a wrong answer is likely to do.**

- Add the method with an empty SEARCH. That puts it at the end of the file, outside the class, and the file no
  longer loads: every case fails.
- Quote a first line with an indent or a semicolon the file does not have. The outline prints members with two
  spaces after the line number and prints fields without their semicolon. The edit is refused and the check
  fails the file as it was (`plain.ts`).
- Take the larger of 0 and the whole sum, and not of each booking. An overpaid booking then brings the sum down
  (`hollow-total.ts`). Or take no larger-of at all (`hollow-negative.ts`).
- Count only confirmed hires, on the thought that a hold owes nothing yet (`hollow-confirmed.ts`), or count
  every state.
- Write the whole file anew from the outline. `unchanged` fails it (`hollow-lost.ts` is the mildest such file:
  `lapse` names the holds newest first).

## Corrected 2026-11-22, after the ceiling

By Claude Opus 5.5, from what the ceiling's tries showed. The lines above are left as they were written.

- **An edit copied from the outline is not refused for its indent or a missing `;`.** A SEARCH is matched as text, and may begin and end inside a line. So the outline's two spaces are found inside the file's four, and a field printed without its `;` is found in the file's line that has one. Such edits apply. An edit copied from the outline is refused only where the copied text holds something the file does not have in that place: two spaces right before a member whose `readonly` the outline leaves off, or two printed lines joined, since the lines between them are not shown.

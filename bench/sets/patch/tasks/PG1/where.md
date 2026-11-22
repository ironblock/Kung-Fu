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

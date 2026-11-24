# PI2: where the change is, and how an answer goes wrong

**The right change.** In `nextStart` (lines 67 to 82 of `src/pumpout.ts`, with the comment above it), a start is also passed over when its visit would overlap the lunch closure, minutes 750 up to but not including 790. The overlap test is the one the body already uses for a taken visit: `start < 790 && end > 750`. The reference adds two lines inside the `while` loop and puts `!lunch &&` into the `if` under them. Nothing else changes.

**Where.** Only inside the loop of `nextStart`. `serve` calls `nextStart`, so it follows without a change.

**What it needs from the body.** The loop walks the slot grid, which is counted from `OPENS` and not from midnight; a visit may end exactly at `CLOSES`; a visit holds the point from its start up to, not including, its end; only the visits of the same day count; the answer for "none" is `NO_START`. None of this is in the first line. An answer that writes the body anew from the first line gets some of it wrong, and the `unchanged` cases for `nextStart` then fail.

**What a wrong answer is likely to do.**

- Treat the closure as shut at both ends, so that a visit may not end at 12:30 or may not start at 13:10. `hollow-edge.ts` does both. The two edges are tested apart: "lets a visit end exactly at 12:30" and "lets a visit start exactly at 13:10".
- Look only at whether the start is inside the closure. A pump-out from 12:10 then runs to 12:50. `hollow-startonly.ts` does this.
- Move every start after lunch off the grid, or drop a logged visit that sits in the closure. "keeps to the grid after it" and "leaves a logged visit inside the closure alone" test these.
- Put the closure in as a made-up visit in `taken`. That is right, when the visit is not put into the caller's log.
- Shut on some days only. The ask says "every day". `hollow-weekdays.ts` shuts on five days in seven. It fails one case only: "shuts on every day".
- Pass over a start only when its start or its end is strictly inside the closure, so that "both" from 12:10 to 13:10 gets through. `hollow-strictinside.ts` does this. It fails one case only: "gives no start whose visit would run into the closure".
- Let a logged visit that starts inside the closure no longer block. `hollow-loggedlunch.ts` does this. It fails one case only: "leaves a logged visit inside the closure alone, and it blocks as before".
- Lose another function while writing the file anew. `hollow-lost.ts` stands for that: its `joinQueue` takes the service asked for last, where the module makes it "both". It fails through `unchanged` only.
- Nine more files stand for the same, each with one other function a little changed. Each fails one case of `unchanged` only: `hollow-dashes.ts`, `hollow-wrap.ts`, `hollow-emptybatch.ts`, `hollow-askboth.ts`, `hollow-skiphead.ts`, `hollow-recordcopy.ts`, `hollow-offgrid.ts`, `hollow-sameday.ts` and `hollow-negative.ts`. PI1's `where.md` says what each one changes.

**A right answer that needs no body.** The change can be made from the outline alone, without the lines of `nextStart`. One way: an edit whose SEARCH is the first line of `nextStart` as the outline prints it renames the old function, and an edit with an empty SEARCH adds a new `nextStart` that calls the old one on a copy of the log with a made-up visit for lunch added (that `day`, start 750, 2 slots). Another way: one edit puts a guard under that first line that calls the function again with the same visit added. Both pass the check. They take on trust that a logged visit blocks from its start up to, not including, its start and its slots times `SLOT_MIN`, which `endOf`, `slots` and `SLOT_MIN` in the outline suggest. So an `outline-1` pass may not show that the outline was enough to change the body. Read each one before it is counted, and count the ones written this way beside the score.

**Cases of `unchanged` that are skipped.** Two, whose answers were starts inside the closure: "nextStart: finds the gap behind a morning of visits" and "nextStart: an ask in the middle of the day". The check asks the same questions again with the new answers.

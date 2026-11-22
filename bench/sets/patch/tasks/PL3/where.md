# PL3, leans: `describe`

**The right change.** In `describe` (lines 340 to 352 of the file, with the comment above it), a notice whose `to`
is not `OPEN_ENDED` gets `, last day N` after `from day F`, where N is `notice.to - 1`. The reference adds an
`else` to the `if (notice.to === OPEN_ENDED)` that is there.

**The other declaration.** `inForce`, line 162:

    export function inForce(notice: Notice, day: number): boolean {
        // `to` is the day the stretch is open again, so the notice is not in force on it.
        return day >= notice.from && (notice.to === OPEN_ENDED || day < notice.to);
    }

**The fact.** A notice's `to` is not its last day. It is the day the stretch is open again: the range of days
includes `from` and does not include `to`. So the last day in force is `to - 1`.

**The lines that show it.** Lines 163 and 164, in `inForce`: the comment and `day < notice.to`. The same fact
shows in `over` (line 110, `notice.to <= day`), in `issue` (line 124, a notice with `to <= from` covers no day), in
`lift` (lines 144 to 146) and in `sharesDay` (line 116). None of these is in `describe`'s own lines, and the first
line of `inForce` says only `(notice: Notice, day: number): boolean`. The interface `Notice` gives `to: number`
with no comment.

**How the reader is led to it.** The ask says "the last day on which the notice is still in force". The outline
shows a function `inForce(notice, day)`. Its body is what settles which day that is.

**The natural wrong guess.** That `to` is the last day of the stoppage, as a notice on a towpath reads: "closed
from the 3rd to the 14th". The answer then prints `notice.to`. `hollow-guess.ts` is the reference with that in
place. The check fails it in its first six cases.

**What else a wrong answer is likely to do.**

- Add the last day to every notice, the open-ended ones too, which then read `last day -2`. `hollow-always.ts`
  does this. The last case fails it, and so do the helper's two cases for open-ended notices.
- Put the addition somewhere else in the line, or word it another way. The cases that compare the whole line fail
  that.
- Take any `to` below zero for no end date. `hollow-negend.ts` does this, and a notice whose days are all below zero
  then reads "until further notice". The case "a notice whose days are all below zero still has an end date" fails
  it.
- Change the rest of the line while adding to it. `hollow-fromstart.ts` writes "from the start" for day 0. The
  check's own case for a dated restriction fails it, and so does the helper's case for a restriction's times, which
  this check does not skip.
- Write the whole file anew. `hollow-lost.ts` is such a file: `describe` is right, and `canPass` lets a boat in at
  the minute a restriction shuts. So is `hollow-clockwrap.ts`, whose clock reads 24:00 as 00:00. The same two cases
  fail it.

**Near misses the check fails.** `hollow-oneday.ts` prints `to`, but the first day for a notice of one day, and
fails five cases. `hollow-changesnotice.ts` takes a day off the notice's own `to` and prints it. It fails only the
two cases that use the notice again after describing it.

**Wrong answers in the rest of the file.** The same thirteen as in PL1 and PL2, each with the right `describe` and
one other function changed a little: `hollow-throughbroken.ts`, `hollow-openfirst.ts`, `hollow-ringnull.ts`,
`hollow-timeslate.ts`, `hollow-samestretch.ts`, `hollow-negstart.ts`, `hollow-furlongslegs.ts`,
`hollow-lockslegs.ts`, `hollow-prunenoday.ts`, `hollow-sharesnoday.ts`, `hollow-inforcesign.ts`,
`hollow-oversign.ts` and `hollow-tallysign.ts`. PL1's `where.md` names the function each one changes.

**A pass that does not show the fact.** Two right answers need no knowledge of what `inForce` does.

- One asks it at run time which day is the last:
  `` line += `, last day ${inForce(notice, notice.to) ? notice.to : notice.to - 1}`; ``. The check compares the line,
  and asks `inForce` about the day the line gives, so this passes, and it should.
- One keeps the old `describe` under a new name and calls it from a new `describe` written in place of the first
  line, putting the last day in before the cause. That needs the fact, or the run-time question above, but not the
  body of `describe`.

So a pass in the `region` arm, or in `outline-1`, does not by itself show that the reader knew which end of a
notice's days `to` is. Read each pass, count the ones that ask `inForce` or keep the old body under a new name, and
give that count beside the score.

The two cases of the helper that pin the old line of a dated notice are skipped by this check, and no other.

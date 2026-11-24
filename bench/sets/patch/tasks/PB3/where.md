# PB3, leans: `planDeparture` returns null when the lock is done for the day

**The right change.** In `planDeparture` (lines 143 to 149 of the starting file, with its comment): the return
type becomes `Departure | null`, and after `const entry = nextEntry(windows, ready + cruise);` at line 145 comes
`if (entry === DAY) return null;`. Two edits, both inside the function's lines.

**The other declaration.** `nextEntry`, lines 86 to 95. Its first line is
`export function nextEntry(windows: LockWindow[], at: number): number {`.

**The fact.** When no entry is left that day, `nextEntry` returns `DAY`, which is 1440. It does not return -1, and
it cannot return null or undefined.

**The lines that show it.** Lines 93 and 94, the end of `nextEntry`'s body:

    // Nothing is left today. DAY and not -1, so a caller that takes the earlier of two times needs no special case.
    return DAY;

Nothing in `planDeparture`'s own lines shows it. The outline shows `export const DAY = 1440;` at line 25 and
`nextEntry`'s first line, and neither says what `nextEntry` gives when there is nothing.

**The natural wrong guess.** That a function returning `number` says "none" with -1: `if (entry === -1) return null;`
or `if (entry < 0) return null;`. That is `hollow-guess.ts`. It never returns null, so every case of the check's
first group fails. Guesses of the same kind: `entry === null`, `entry === undefined`, `Number.isNaN(entry)`,
`entry === Infinity`, `!Number.isFinite(entry)` (`hollow-finite.ts`).

**Answers that are right another way, and pass.** `entry >= DAY`; `entry + 12 > DAY`; a test that covers both
guesses, such as `entry < 0 || entry >= DAY`; and `!isOpen(windows, entry)`, which asks the outline's `isOpen`
whether the lock is open at the minute `nextEntry` gave. A real entry is from 0 to 1428, so none of these takes a
real plan away.

**A pass does not show that the reader knew the fact.** The last two of those cover every guess at once, and a
reader who holds only the region can write them. No check can fail them, because they are right. So for every try
that passes, and above all in the `region` arm, read which it is and write it down beside the sort: the fact used
(`=== DAY`, `>= DAY`), or a hedge that needs no fact (a test of both ends, `isOpen`, `Number.isFinite` with a
range). The count of `region` passes that are hedges belongs beside the score, since the run's fourth question
is about readers who do not hold the other body.

**What the check cannot see.** The ask also wants the return type changed to say `null`. The check runs the code
and no type checker, so a try that returns null and leaves the type as `Departure` passes. It used the fact, and
it does not pass `tsc --strict` ("Type 'null' is not assignable to type 'Departure'"). Note it when you read the
try.

**What else a wrong answer is likely to do.**

- Not ask `nextEntry` at all, and test whether a window is still open when the boat arrives (`hollow-shut.ts`). That
  misses a boat that arrives with fewer than 12 minutes left, which cannot lock through.
- Return null when the boat must be held at the yard, taking "cannot go in" to mean "cannot go in on arrival".
- Hedge one step too far and take minute 0 for "none" as well: `entry <= 0 || entry >= DAY` (`hollow-midnight.ts`).
  A lock that is open at midnight gives a real entry at 0.
- Take any entry in the last 12 minutes of the day for "none": `entry >= DAY - 12` (`hollow-late.ts`). An entry at
  1428 is real.
- Change the return type and nothing else.
- Write the whole file anew and get another function slightly wrong. `hollow-lost.ts` stands for that: its
  `windowFor` rounds the minutes after high water to the nearest and not down. Seven more files stand for other
  such slips: `hollow-inplace.ts` (`closeFor`), `hollow-opening.ts`, `hollow-overlap.ts`, `hollow-chain.ts`
  (`windowsFor`), `hollow-entrysort.ts`, `hollow-plansort.ts` (a caller's list sorted in place) and
  `hollow-board.ts`.

The check skips one pinned case, "planDeparture gives a plan even when nothing is left", which is what the change
undoes.

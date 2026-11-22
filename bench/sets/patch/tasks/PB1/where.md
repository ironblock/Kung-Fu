# PB1, beside: add `openMinutes`

**The right change.** One new exported function, `openMinutes(windows, from, to)`. For each window it adds the
length of the part that lies between `from` and `to`, and never less than nothing:
`Math.max(0, Math.min(to, w.closes) - Math.max(from, w.opens))`. The reference adds it at the end of the file, after
`planDeparture` (line 149 of the starting file is the last line). It may stand anywhere at the top level.

**What it needs of the file.** Only the type `LockWindow` and its members `opens` and `closes`, which the outline
shows at lines 10 to 12. No convention of the module bears on it: the ask says the unit, that windows do not overlap,
that they come in any order, and what an empty or backward stretch gives.

**What a wrong answer is likely to do.**

- Count the whole of every window that touches the stretch, with no cutting (`hollow-whole.ts`).
- Take the list to be in opening order and stop at the first window that opens at or after `to`
  (`hollow-sorted.ts`). The file's own lists are in that order, and the ask says this one need not be.
- Stop at, or pass over the rest after, a window that ends before the stretch starts (`hollow-stops.ts`). The same
  mistake about order, from the other end.
- Sort the caller's list in place before counting. The check's last case fails it.
- Give a number below zero when `to` is before `from`, by clamping each window but not the sum, or by not clamping.
  `hollow-sum.ts` clamps the sum only, and a window outside the stretch then takes minutes away from one inside it.
- Write the whole file anew and get another function slightly wrong. `hollow-lost.ts` stands for that: its
  `isOpen` takes in the minute a window closes, and `unchanged` fails it. Ten more files stand for other such slips,
  each the reference with one other function changed: `hollow-inplace.ts`, `hollow-split.ts` (`closeFor`),
  `hollow-opening.ts`, `hollow-overlap.ts`, `hollow-chain.ts` (`windowsFor`), `hollow-entrysort.ts`,
  `hollow-plansort.ts`, `hollow-opensort.ts` (a caller's list sorted in place), `hollow-board.ts` and
  `hollow-length.ts`.
- With only the path, or a wrong memory of the file: quote a last line that is not there, so the edit is refused,
  or name the members `start` and `end`.

A patch that adds the function with an empty SEARCH, or that quotes any one line the outline shows, applies.

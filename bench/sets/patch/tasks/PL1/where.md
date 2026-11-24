# PL1, beside: `closedDays`

**The right change.** One new exported function, `closedDays(register, route, fromDay, toDay)`. It walks the days
from `fromDay` up to, not including, `toDay`, and keeps each day on which `routeOpen(register, route, day)` is false.
The reference puts it straight after `nextOpenDay`, before `tally` (line 271 of the file). Anywhere at the top level
is as good, and so is the end of the file.

**What it needs of the file.** The names and parameter orders of `Register`, `Route` and `routeOpen`. The outline
shows all three. The ask says the one thing the outline does not: which end of the span is looked at.

**What a wrong answer is likely to do.**

- Look at `toDay` too (`day <= toDay`). `hollow-inclusive.ts` does this. The check's second case fails it.
- Decide for itself whether a day is shut, and not ask `routeOpen`: for example, call a day shut when any closure
  for a stretch of the route is in force. The file's rule is that only the newest notice in force for a stretch
  counts, so a restriction issued over a closure opens the stretch again. `hollow-anyclosure.ts` does this. The
  case "goes by what routeOpen says for each day" fails it.
- Call something the file does not have, or pass `routeOpen` its parameters in another order. That fails every case
  of `closedDays`.
- Write the whole file anew. Then some other function is likely to differ, and the `unchanged` cases fail it.
  `hollow-lost.ts` is such a file: `closedDays` is right, and `prune` keeps a notice that ends on the day.

**Wrong answers that change what they are given, or share their answer.** The ask says `closedDays` changes neither
the register nor the route, and gives each call a new list of its own. None of these is likely, and each gives the
right days. The case "changes neither a notice that is over by fromDay nor a route out of order" fails the first
two, and "gives each call a new list of its own" fails the third.

- `hollow-prunes.ts` prunes the register at `fromDay` before it looks.
- `hollow-sorts.ts` sorts the route's stretches in place.
- `hollow-sharedlist.ts` fills and hands back one list that it keeps between calls.

**Near misses the check fails.** `hollow-backwards.ts` turns a span given backwards round, and the case "gives an
empty list when toDay is not after fromDay" fails it. `hollow-jumps.ts` jumps over each closure by `nextOpenDay`
and stops at one with no end, and the case "goes by what routeOpen says for each day" fails it.

**Wrong answers in the rest of the file.** Each of these files has the right `closedDays` and changes one other
function a little. The same thirteen are kept in PL2 and PL3, and the helper's `unchanged` fails each by a case of
its own: `hollow-throughbroken.ts` (`throughBy`), `hollow-openfirst.ts` and `hollow-ringnull.ts` (`wayRound`),
`hollow-timeslate.ts`, `hollow-samestretch.ts` and `hollow-negstart.ts` (`issue`), `hollow-furlongslegs.ts`
(`routeFurlongs`), `hollow-lockslegs.ts` (`routeLocks`), `hollow-prunenoday.ts` (`prune`), `hollow-sharesnoday.ts`
(`sharesDay`), `hollow-inforcesign.ts` (`inForce`), `hollow-oversign.ts` (`over`) and `hollow-tallysign.ts`
(`tally`).

# PE2, inside: `Rota.decideSwap`

**The right change.** In `Rota.decideSwap` (lines 381 to 395), inside the `if (approve)` block and after the two
checks that can throw, go through `this.swaps` and set every other request with the same `shiftId` and the status
`"pending"` to `"refused"`, with `decidedAt = at`. The reference adds six lines after
`shift.staffId = swap.toStaffId;` at line 390. Doing it after the block, under a second `if (approve)`, is as
right.

**What it needs from the file.** The method's own lines: that the requests are in `this.swaps`, that the request
in hand is `swap`, that the time is the parameter `at`, and where the two throws are. The outline gives the
members of `SwapRequest` and the three values of `SwapStatus`.

**What a wrong answer is likely to do.**

- Refuse the others and not stamp them, so their `decidedAt` stays `-1`. `hollow-stamp.ts`.
- Do the sweep whether the request is approved or refused. `hollow-refusal.ts`.
- Do the sweep at the top of the `if (approve)` block, before the checks that throw, so that a failed approval
  leaves the other requests refused. `hollow-early.ts`.
- Sweep by person and not by shift, or sweep requests that were decided already. The check's third and fourth
  cases catch these. `hollow-adv-3.ts` sweeps every request for the shift that is not approved, and so stamps
  again one that was refused before.
- Sweep only the requests that the present holder asked, and leave pending one that an earlier holder of the
  shift asked. The ask says "every other request for the same shift". The check's fifth case catches it:
  `hollow-sameasker.ts`.
- With the outline alone: make up the body's text and have the edit refused, or write the method anew and lose
  one of its two checks, their order, or the exact words of an error. `unchanged` pins those; the order of the
  holder test and the `whyNot` test is `hollow-decideorder.ts`.
- `hollow-lost.ts` is the reference with `pendingSwaps` giving the newest request first. The check fails it
  through `unchanged`. So it fails each of the files that are right on `decideSwap` and differ from the module
  in one other thing: `hollow-askedfrom.ts`, `hollow-clashorder.ts`, `hollow-clockround.ts`, `hollow-dayform.ts`,
  `hollow-decideorder.ts`, `hollow-hashtrim.ts`, `hollow-hourdigits.ts`, `hollow-lapseopen.ts`,
  `hollow-leavelast.ts`, `hollow-leaveorder.ts`, `hollow-linessort.ts`, `hollow-loadall.ts`,
  `hollow-movetimes.ts`, `hollow-needscopy.ts`, `hollow-parseorder.ts`, `hollow-personcopy.ts`,
  `hollow-shiftorder.ts`, `hollow-swaporder.ts` and `hollow-wholeminute.ts`.

**An answer from the outline alone that passes.** The change can be written without the body. One edit quotes
only the method's first line as the outline prints it, `decideSwap(swapId: string, approve: boolean, at: number):
SwapRequest {`, and puts in its place a new `decideSwap` that calls the old body under a new private name, then,
when approving, refuses the other pending requests for the shift with the returned request's `decidedAt`. The old
body keeps both throws and their words, and a throw leaves before the sweep, so "no request may change at all"
holds with no knowledge of the body. It passes the whole check. So a pass in `outline-1` on this task may be
earned. Read what the answer did before it is counted: a wrapper is a right answer from the outline, and
question 5 should be read with this task in mind. Written in place, the change needs the body, and for a reader
of `region.md` the task is of its kind.

**The case `unchanged` skips.** "Rota.decideSwap approving one request leaves the others for the shift pending":
it pins what this task changes.

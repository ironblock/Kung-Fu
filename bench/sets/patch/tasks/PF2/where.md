# PF2, inside: `WorkLog.move`

Rewritten on 2026-11-22 by the mender, after the adversary showed that the task as first written could be done from the outline: its change was a new refusal, which can stand straight after the method's first line. The module now holds a refusal of its own, and the task asks to change it.

**The right change.** In the body of `WorkLog.move` (lines 413 to 434 of the file), the refusal on lines 422 to 425. As the file stands, a move to `"signed"` is refused when any move to `"done"` in the history has the `by` given. It must be refused only when the job's most recent move to `"done"` has it. The reference changes one line, 423:

```ts
        if (to === "signed" && job.history.find((m) => m.to === "done")?.by === by) {
```

**What it needs, and where that is.** The body, which the region shows:

- The refusal to change, lines 422 to 425: `job.history.some((m) => m.to === "done" && m.by === by)`. The outline does not show it, and nothing put after the first line can undo it.
- The history is kept newest first: `job.history.unshift({ to, day, by })` on line 432, and the comment on line 418. So the first move to `"done"` that `find` meets is the most recent one.
- A job can only be signed from `"done"`, so at that point `job.history[0]` is the move to `"done"`. An answer that compares `job.history[0].by` is right too, and passes.

**What a wrong answer is likely to do.**

- Leave the old refusal where it is and add a new one for the latest finish, at the top of the method or beside the old one. The old refusal still refuses the first finisher, so it acts as the file does now: "after a second finish, the person who finished it first may sign" fails, as for `plain.ts`. An answer written from the outline that does not rewrite the method does this.
- Read the history from the other end and take the oldest move to `"done"` (`hollow-oldest.ts`). The cases "after a second finish", "after two finishes on one day" and "after three finishes" fail.
- Take the last item of the history as the latest move, which is the opening (`hollow-opener.ts`). Then the opener cannot sign and the finisher can.
- Take the finish with the greatest day as the latest, and on a tie the one further down the history (`hollow-sameday.ts`). "After two finishes on one day, the later one is the most recent" fails.
- Compare without regard to case or spaces, on either side. "Compares the names exactly as written" fails for the signer, "compares the finisher's name exactly as it was written too" for the finisher (`hollow-trimmed.ts`).
- Put the new refusal before the test for a job the log does not hold (`hollow-unknown.ts`). It throws on a signing of such a job, and `unchanged`'s "WorkLog.move: a job the log does not hold is refused" fails.
- Put the refusal after the state or the history has been changed. The cases that compare the job before and after fail.
- Refuse the finisher's other moves, such as reopening. "May still reopen it" fails.
- Quote the old refusal from a guess, so that the patch does not apply.
- Write the method or the file anew. `unchanged` then fails where the guess differs, as it does for `hollow-lost.ts`, where `forBoat` gives the oldest job first. Five more hollow answers each change one more thing and fail through `unchanged`: a drop sets the closing day (`hollow-dropday.ts`), `open` trims the name (`hollow-openby.ts`), `addTime` checks the last entry only (`hollow-lastentry.ts`) or trims the fitter (`hollow-fittertrim.ts`), and `logTime` refuses a done job (`hollow-logdone.ts`).

**Two right answers that do not need the body, for whoever reads an `outline-1` pass.** The mender wrote both and both pass. Neither changes the old refusal's text.

- Keep the old body under a new name, quoting only the first line of `move`, and put a new `move` in front of it. For a signing that only the old refusal stands in the way of, the new `move` calls the old body with a stand-in name that no finish has, then writes the real name into the move it made. This road is open in any `inside` task whose result can be made from the old one's.
- Do the whole signing at the top of the method and return, so that the old refusal is never reached. That needs the rule on the day, which only the body and its comment show, guessed right: a move may not be dated before the latest one, and may be dated on the same day. Without it, "still refuses a signing the table does not allow" fails.

A pass in `outline-1` is to be read for these shapes before it is counted.

**The one case of `unchanged` the change alters,** and the check skips: "WorkLog.move: nor may anyone who finished it before it was reopened".

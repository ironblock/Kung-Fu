# PI3: where the change is, and how an answer goes wrong

**The right change.** `visitsOf` (lines 174 to 176 of `src/pumpout.ts`) takes an optional `latest`. When it is given, the function returns the first `latest` of the boat's visits as the log holds them: `visits.slice(0, latest)`. The reference changes the first line and the `return`, and adds one comment line.

**The other declaration.** `record`, lines 170 to 172.

**The fact.** The log is kept newest first. `record` puts each visit at the front of the log.

**The lines that show it.** Line 171, the whole body of `record`:

    log.unshift(visit); // newest first: the desk screen shows the top of the log

Its first line, `export function record(log: Visit[], visit: Visit): void`, leaves the order open. Nothing in the outline, and nothing in the lines of `visitsOf`, says which end of the log is new.

**Why a reader should look.** The ask wants the visits "recorded most recently", and says that every visit gets into the log through the module's own function for recording one. It does not name that function in a code span, and it does not say the order.

**The natural wrong guess.** That a log is added to at its end, so the most recent visits are the last ones: `visits.slice(-latest)`. `hollow-guess.ts` is the reference with the end of the list taken in place of the top (written as `visits.slice(Math.max(0, visits.length - latest))`, so that it differs from the reference in this fact and nothing else). It fails "gives the boat's most recently recorded visits, in the log's order" and "goes by when a visit was recorded, not by its day or start".

**Other wrong answers.**

- Sort by day and start, and take the newest. The ask rules this out: a visit can be entered late. `hollow-bytime.ts` does this, and keeps the log's order in what it returns. It fails the same two cases, on the visit entered late.
- Treat a `latest` of 0 as "not given" (`latest ? ... : visits`). `hollow-zero.ts` does this.
- Take the first `latest` of the whole log and then keep the boat's. It fails the first case.
- The natural guess in two more forms, each failing the same two cases as `hollow-guess.ts`: the end of the list with a `latest` of 0 guarded (`hollow-tail.ts`), and a loop from the end of the log with what it finds put back in the log's order (`hollow-fromend.ts`).
- Give copies of the visits when `latest` is given, not the ones in the log. `hollow-latestcopy.ts` does this. It fails one case only: "gives the log's own visits, not copies of them". That case asks for every visit of a boat, so which end of the log is new does not matter in it.
- Lose another function while writing the file anew. `hollow-lost.ts` stands for that: its `nextStart` counts the slot grid from midnight. It fails through `unchanged` only.
- Nine more files stand for the same, each with one other function a little changed. Each fails one case of `unchanged` only: `hollow-dashes.ts`, `hollow-wrap.ts`, `hollow-emptybatch.ts`, `hollow-askboth.ts`, `hollow-skiphead.ts`, `hollow-recordcopy.ts`, `hollow-offgrid.ts`, `hollow-sameday.ts` and `hollow-negative.ts`. PI1's `where.md` says what each one changes.

**What the region adds.** The lines of `visitsOf` are not needed. One edit that quotes only its first line as the outline prints it, and puts under it `if (latest !== undefined) { return visitsOf(log, boat).slice(0, latest); }`, passes. The same edit with the natural guess fails. So an `outline-1` reader fails this task for want of the fact, not for want of the body.

**What the check does not ask.** A `latest` below 0, or one that is not a whole number. Whether the list returned is a new one.

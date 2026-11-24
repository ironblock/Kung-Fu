# PM1, beside: `Invoice.writeOff`

**The right change.** A new method on the `Invoice` class, anywhere among its members. It reads `this.owedPence()`, returns 0 when that is 0, and otherwise calls `this.credit(day, owed, "written off")` and returns the amount. The reference puts it above `paidPence`, which is at line 414 of the file as it starts.

**What the outline gives.** `owedPence(): Pence`, `credit(day: Day, pence: Pence, reason: string): CreditNote`, and the class's fields. That is all a right answer needs. The ask says that the note must come from `credit`, and that a draft, a void invoice and a paid one owe nothing.

**What a wrong answer is likely to do.**

- It builds the note itself and pushes it on `this.credits`, with an id it made up. The outline shows `id: string` in `CreditNote` and nothing of its form, which is `CN<number>-<count from 1>` and is written only in the body of `credit` (line 404). The check sets the invoice beside a twin that called `credit`, so a made-up id fails. `hollow-byhand.ts` is this.
- It calls `credit` with no guard. `credit` throws `RangeError` for 0 pence, and throws on a draft and on a void invoice, which only its body says. The ask does say that no note is raised when nothing is owed. `hollow-zero.ts` is this.
- It works the amount out itself and forgets a part: `totals().grossPence - paidPence()`, without the credit notes. `hollow-gross.ts` is this.
- It writes the whole file anew. Then `unchanged` fails it on whatever body it guessed. `hollow-lost.ts` stands for this: the new method is right and `taxSummary` works tax out line by line.
- Its edit quotes a member line with the wrong indent or with a body line it could not see, and is refused.

## Corrected 2026-11-22, after the ceiling

By Claude Opus 5.5, from what the ceiling's tries showed. The lines above are left as they were written.

- **An edit copied from the outline is not refused for its indent or a missing `;`.** A SEARCH is matched as text, and may begin and end inside a line. So the outline's two spaces are found inside the file's four, and a field printed without its `;` is found in the file's line that has one. Such edits apply. An edit copied from the outline is refused only where the copied text holds something the file does not have in that place: two spaces right before a member whose `readonly` the outline leaves off, or two printed lines joined, since the lines between them are not shown.

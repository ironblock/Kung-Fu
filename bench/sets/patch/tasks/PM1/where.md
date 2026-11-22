# PM1, beside: `Invoice.writeOff`

**The right change.** A new method on the `Invoice` class, anywhere among its members. It reads `this.owedPence()`, returns 0 when that is 0, and otherwise calls `this.credit(day, owed, "written off")` and returns the amount. The reference puts it above `paidPence`, which is at line 414 of the file as it starts.

**What the outline gives.** `owedPence(): Pence`, `credit(day: Day, pence: Pence, reason: string): CreditNote`, and the class's fields. That is all a right answer needs. The ask says that the note must come from `credit`, and that a draft, a void invoice and a paid one owe nothing.

**What a wrong answer is likely to do.**

- It builds the note itself and pushes it on `this.credits`, with an id it made up. The outline shows `id: string` in `CreditNote` and nothing of its form, which is `CN<number>-<count from 1>` and is written only in the body of `credit` (line 404). The check sets the invoice beside a twin that called `credit`, so a made-up id fails. `hollow-byhand.ts` is this.
- It calls `credit` with no guard. `credit` throws `RangeError` for 0 pence, and throws on a draft and on a void invoice, which only its body says. The ask does say that no note is raised when nothing is owed. `hollow-zero.ts` is this.
- It works the amount out itself and forgets a part: `totals().grossPence - paidPence()`, without the credit notes. `hollow-gross.ts` is this.
- It writes the whole file anew. Then `unchanged` fails it on whatever body it guessed. `hollow-lost.ts` stands for this: the new method is right and `taxSummary` works tax out line by line.
- Its edit quotes a member line with the wrong indent or with a body line it could not see, and is refused.

# PM3, leans: `Invoice.statementLines` shows each payment

**The right change.** In the body of `Invoice.statementLines` (lines 452 to 470 of the file as it starts), above the line that pushes the `Paid` line: one line for each payment, `  Payment  <isoDay(day)>  <formatPence(pence)>  <method>`, the payment recorded first on top. The reference walks `this.payments` from its last element to its first.

**The other declaration.** `Invoice.pay`, lines 380 to 389, with its comment from line 376.

**The fact.** `this.payments` is kept newest first. `pay` puts each new payment at the front of the list. So the order of recording is the list read backwards.

**The lines that show it.** In the body of `pay`, lines 385 and 386:

    // newest first: the desk asks for the latest payment far more often than for the first
    this.payments.unshift({ day, pence: taken, method, ref });

`lastPaymentDay` (line 396) reads `this.payments[0].day`, which shows it a second time.

**What the first lines leave open.** `pay(day: Day, pence: Pence, method: PayMethod = "transfer", ref: string = ""): Pence`, `paymentList(): Payment[]` and the field `private payments: Payment[] = []` say nothing of the order. The lines of `statementLines` use `this.payments` only for its length.

**The natural wrong guess.** That a list of payments is in the order they were added, so `for (const payment of this.payments)` gives the order of recording. It gives the reverse. `hollow-guess.ts` is the reference with that loop. The ask says "recorded first", and "whatever days the payments carry", so a reader sees that the list's order matters; it does not say what the order is, and does not name `pay`.

**Other wrong answers.**

- It sorts the payments by day. That is not the order of recording when a payment is keyed in late. `hollow-byday.ts`.
- It puts the lines under the `Paid` line. `hollow-below.ts`.
- It knows the list is newest first and calls `this.payments.reverse()`, which turns the invoice's own list round. The first statement is right; after it `paymentList` and `lastPaymentDay` are wrong, and a second statement prints the payments the other way up. `hollow-reverse.ts`; the case of `unchanged` that makes a statement twice fails it.
- It leaves out a payment dated after the statement's day. `hollow-future.ts`.
- It prints the day as a number, the pence as a number, or leaves the method out.
- It writes the file anew with a list kept in the order of recording, and a forward loop. The statement is then right, and `paymentList` and `lastPaymentDay` are not what they were. `hollow-lost.ts` is this, and `unchanged` fails it.

Three cases of `unchanged` are skipped, the three whose statements hold a payment. The check pins each of them again with the new lines.

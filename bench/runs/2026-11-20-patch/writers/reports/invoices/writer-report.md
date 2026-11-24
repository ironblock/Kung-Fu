Module `invoices` and its three tasks are written in /home/build/patch/invoices/set, and every command in the brief ends as it must. Nothing was committed and nothing under /home/user/Kung-Fu was edited. No rule of the brief had to be broken.

## The module: files/invoices.ts
- 593 lines by `wc -l` (target about 600). Longest line 119 columns. No import. The outline shows no first line with a bracket left open.
- Exports (45):
  - types `Pence`, `Day`, `LineKind`, `TaxBand`, `PayMethod`, `InvoiceStatus`, `ReminderLevel`
  - interfaces `InvoiceLine`, `Payment`, `CreditNote`, `TaxRow`, `Totals`, `AgeingRow`, `AccountSummary`
  - constants `NO_DAY`, `DEFAULT_TERMS_DAYS`, `MAX_LINES`, `FIRST_NUMBER`
  - functions `formatPence`, `parsePence`, `parseLine`, `dayOf`, `isoDay`, `dayOfIso`, `taxRate`, `lineNet`, `taxSummary`, `totalsOf`, `taxWithin`, `describeLine`, `sortLines`, `mergeLines`, `lateFee`, `instalments`, `reminderLevel`, `nextNumber`, `invoicesOf`, `owedBy`, `overdue`, `ageing`, `allocate`, `accountSummary`, `reminderText`, `statement`
  - class `Invoice`: five private fields of state, 22 public methods (`addLine`, `removeLine`, `lineList`, `issue`, `issuedDay`, `dueDay`, `totals`, `pay`, `paymentList`, `lastPaymentDay`, `credit`, `creditList`, `paidPence`, `creditedPence`, `owedPence`, `status`, `daysLate`, `isOverdue`, `cancel`, `statementLines`, plus the constructor) and two private ones.
- Not exported: eight tables and constants, and eight helpers.

## Conventions a guess would get wrong, and where each shows
Shown only in a body or a comment, not in a first line:
1. Payments are kept newest first: `pay` body, lines 385-386 (`unshift`), and again in `lastPaymentDay`, line 396. Credit notes are kept oldest first (line 406).
2. `pay` returns the pence it did not take, never takes more than is owed, and records only what it took: lines 376-389.
3. Tax is worked out once per band on the band's net, a part of a penny dropped: `taxSummary`, lines 243-248.
4. Tax rates are tenths of a percent (200 is 20%): the table's comment, line 85. `taxRate(kind): number` leaves it open.
5. A quantity is in hundredths of a unit, and half a penny goes up: the field's comment at line 23, and `lineNet`, line 231.
6. A due day on a Saturday or Sunday moves to the Monday: `dueDay`, line 368.
7. The due day itself is on time, and nothing is late once nothing is owed: `daysLate`, line 436.
8. A draft and a void invoice owe 0: `owedPence`, line 423.
9. `sortLines` sorts the array it is given and returns it (line 271). `issue` merges and sorts the invoice's lines (line 358).
10. Values that stand for "none": `NO_DAY` (-1) from `dueDay`, `issuedDay`, `lastPaymentDay`, `dayOfIso` and in `AccountSummary`; `NaN` from `parsePence`; `"-"` from `isoDay` for a day under 0.
11. Ranges with one end in: no late fee through day 7 (line 292); ageing bands 1-30 and 31-60 (line 515); reminders from day 4, 15 and 29 (line 309).
12. Credit note ids are `CN<number>-<count from 1>` (line 404); a credit note for more than is owed throws.
13. `instalments` puts the odd pence on the first part. `taxWithin` gives the part penny to the net (line 262).
14. Hirers match with case and outer spaces aside (line 141). `invoicesOf` leaves out drafts and void invoices (line 490).
15. `formatPence` puts a comma at each thousand and the minus before the pound sign.

Shown in a first line: money in pence (`Pence`), days as numbers (`Day`; day 0 is 1 January 2000, said in the file's head comment).

## The regression helper: checks/helpers-invoices.ts
- `unchanged(mod, skip)` registers 128 named cases; every exported function and every public method has at least two.
- It adds two cases of its own: every skipped name must be a case's name, and no two cases share a name.
- It also exports the fixtures the checks use: `MON`, `HIRE`, `FUEL`, `BERTH`, `STANDARD_GROSS`, `standard`, `flat`.
- Strength: I ran 101 variants of the module against it, each with one body guessed another way. 100 fail. The one that passes removes the draft guard from `credit`, which still throws there because a draft owes 0, so only the error's class differs.

## The tasks
**PM1, beside: "Write off what is left on an invoice".**
- Adds `writeOff(day: Day): Pence` to `Invoice`.
- It turns on what the outline shows: `owedPence(): Pence` and `credit(day, pence, reason): CreditNote`. The ask says the note must come from `credit` and that a draft, a void and a paid invoice owe nothing.
- The reference edit quotes the member line `paidPence(): Pence {` and puts the method before it (7 lines added).
- Hollows: `lost` (tax line by line), `byhand` (a note built by hand with a made-up id), `zero` (no guard when nothing is owed), `gross` (forgets earlier credit notes).
- `unchanged` skips nothing.

**PM2, inside: "Do not take the same payment twice".**
- `Invoice.pay` refuses a payment whose non-empty reference matches, letter case aside, one already recorded on that invoice; all its pence come back and nothing is recorded.
- It turns on the body of `pay`: the list, the shape of what is recorded, what the returned number is, and where the checks that throw stand.
- The reference adds 2 lines above `const taken = ...`.
- Hollows: `lost` (late fee a day early), `case`, `empty`, `first` (refuses before the checks that throw), `folded` (records the reference in lower case), `part` (`startsWith`).
- `unchanged` skips one case: `pay: the same reference twice on one invoice is taken twice`.

**PM3, leans: "Show each payment on an invoice's statement".**
- `Invoice.statementLines` gets one line for each payment above the "Paid" line, the payment recorded first on top.
- The other declaration is `Invoice.pay`. The fact is that `this.payments` is kept newest first (lines 385-386).
- The first lines of `pay`, `paymentList` and the field say nothing of order, and `statementLines` uses the list only for its length.
- The natural wrong guess is `for (const payment of this.payments)`; `hollow-guess.ts` is that, and it fails four cases.
- The ask says "recorded first ... whatever days the payments carry"; it does not say the order of the list, and does not name `pay`.
- The reference adds 4 lines above the `Paid` line.
- Other hollows: `lost` (a list kept oldest first with a forward loop: the statement is right, and `paymentList` and `lastPaymentDay` are not), `byday`, `below`.
- `unchanged` skips the three cases whose statements hold a payment, and the check pins each again with the new lines.

Each hollow fails for the reason it was written for: each `lost` fails only inside `unchanged`, every other hollow fails cases of the new behaviour, and none fails to load. Three other right answers, written as edit replies and applied by `small.apply_edits`, pass: PM1 from the outline alone with a status guard, PM2 with `find` and upper case, PM3 with a reversed copy of `paymentList()`.

## Last line of each command
- `tsc --strict --noEmit ... files/invoices.ts`: no output, exit 0. The same for each `reference.ts`, each `plain.ts` and each hollow file copied to a temporary `.ts`, and for the helper with each check against its reference.
- `holds.py make`: `3 tasks: name, outline, region, whole written for each`
- `holds.py check`: `all as they must be`
- `box.py check-tasks W --window none`: `window: none; all as they must be`
- `holds.py sizes`: `PM3   leans          593       117      5762      6927     22378   Invoice.statementLines`

Sizes in bytes, the same for all three tasks except the region: name 117, outline 5,762, whole 22,378; region 6,724 (PM1), 6,530 (PM2), 6,927 (PM3).

The task directories were assembled by a scratch script, SCRATCH/inv/build.py, which makes each `reference.ts` from its edits and each hollow from the reference by a text swap. If the module changes, the tasks must be built again.

## Unsure

1. The helper's strength was tried on 101 one-body variants, not on a whole file written anew from the outline by a fresh reader. 100 fail; the survivor (no draft guard in `credit`) still throws, with another error class, and I did not pin the class.
2. PM3: the whole file shows the fact twice, in `pay` (comment and `unshift`) and in `lastPaymentDay` (`this.payments[0].day`). That makes the `whole` arm easier than one mention would. The outline's `lastPaymentDay(): Day` says nothing of the list's order, but a region reader could call it and still not learn the order.
3. PM3: an answer that sorts by day is failed on purpose, since the ask says "recorded first ... whatever days the payments carry". Someone sorting failures may still judge such an answer a reasonable reading.
4. PM1: the ask names `Invoice.credit` and `Invoice.owedPence` in code spans, so its region text holds those two bodies. The run does not send `region` on `beside` tasks, but a ceiling that does will see more than the outline there.
5. PM1: plain and `hollow-zero` fail by an error thrown inside a case (no such method; `credit` throwing on 0 pence), not by a value that differs. The grader counts these as failed cases, not as a file that would not load.
6. PM2: the check does not test references that differ only in spaces, nor accents, because the ask does not speak of them. An answer that trims before comparing passes.
7. PM2's region shows the "newest first" comment inside `pay`. It has no bearing on PM2, but it is in front of that reader.
8. `isoDay` prints "-" for any day under 0, so days before 2000 cannot be printed. I took that as a sensible limit for this app.
9. The module is 593 lines, the helper 1,065. The brief sets no limit on the helper.
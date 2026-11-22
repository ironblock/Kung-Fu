# Adversary's findings: module `invoices`, tasks PM1 (beside), PM2 (inside), PM3 (leans)

W = /home/build/patch/invoices/set. I changed none of the writer's files. I added `tasks/<id>/other.ts` (3 files) and `tasks/<id>/hollow-adv-<n>.ts` (33 files).

Last lines, as they stand now:
- `python3 bench/box.py check-tasks W --window none` ends `window: none; 31 WRONG`. All 31 are `WRONG <id> hollow-adv-<n> passed`. Every reference, plain, other and writer's hollow is `ok`.
- `python3 bench/holds.py check W` ends `all as they must be`.

## In short
- **31 breaches:** 12 in PM1, 12 in PM2, 7 in PM3.
- **23 of them are gaps in `checks/helpers-invoices.ts`.** Each of those files is my right answer plus one small change to another function. All but one pass under all three checks (I ran each against the three). The one is the `pad2` change, which PM3's own check fails. One case added to `unchanged` closes each for all three tasks.
- **8 are in the tasks' own checks:** 1 in PM1, 5 in PM2, 2 in PM3.
- **The one most likely to pass a real try is PM3 hollow-adv-6:** it reverses the invoice's own payment list in place.
- **All three `other.ts` pass.** I found no unfair case and no ask with two readings, except the question of outer spaces in PM2 (hollow-adv-8).
- **PM1 and PM3 are of their kind. PM2 is only weakly `inside`:** see its section.
- **The module is sound.**

How I screened: I ran candidates in one vitest run in a scratch copy, then placed each chosen file in W and confirmed it with `check-tasks`. I also made 638 one-change copies of the file (a comparison moved, a number one up or down, floor/ceil/round swapped, a line taken out, and so on), each with a right answer added, and ran them against each task's check. For PM1 and PM2: 590 failed, 3 would not load, 45 passed. For PM3: 591, 3, 44. The 45 are accounted for under "The module".

## PM1 (beside): `Invoice.writeOff`

**Breaches.** Files 1 to 11 are `other.ts` plus one change, so the gap is in `unchanged`.

| File | What it gets wrong | A case that fails it (values read from the module) |
| --- | --- | --- |
| hollow-adv-1 | `pad2`: `n < 9`, so 9 prints as one digit | `formatPence(9)` is `"£0.09"`; `isoDay(9748)` is `"2026-09-09"`. No pinned case has 9 pence, month 9 or date 9. |
| hollow-adv-2 | `withCommas` is right for 4 and 7 digits of pounds and wrong for 5 and 6: it gives `£1,234,5.67` | `formatPence(1234567)` is `"£12,345.67"`; `formatPence(12345678)` is `"£123,456.78"` |
| hollow-adv-3 | `parsePence` strips only the first comma (`.replace(",", "")`) | `parsePence("1,000,000")` is `100000000` |
| hollow-adv-4 | `parsePence` takes a pound sign anywhere | `parsePence("3£")` is NaN |
| hollow-adv-5 | `parsePence` strips spaces inside the number | `parsePence("1 250")` is NaN |
| hollow-adv-6 | `hundredths`: `\d{0,2}`, so `"12."` reads | `parsePence("12.")` is NaN; `parseLine("fuel; diesel; 1.; 1.35")` is null |
| hollow-adv-7 | `parseLine`: `parts.length < 4`, so five parts read as a line | `parseLine("fuel; diesel; 1; 1.35; extra")` is null |
| hollow-adv-8 | `taxSummary`: `net[band] > 0` in place of `seen.has(band)`, so a band whose lines come to nothing gets no row | `taxSummary([{ kind: "sundry", label: "", qty: 100, unitPence: 0 }])` is `[{ band: "standard", netPence: 0, taxPence: 0 }]` |
| hollow-adv-9 | `sortLines` orders labels with `localeCompare` | two sundry lines labelled `"aft cabin"` then `"Zander"` sort to `["Zander", "aft cabin"]` |
| hollow-adv-10 | `isoDay`: `+ 3` for `+ 2` in `shifted`, so 31 January, 31 March and 31 August print as day 00 of the next month | `isoDay(9527)` is `"2026-01-31"`; `isoDay(MON + 29)` is `"2026-03-31"` |
| hollow-adv-11 | `dayOf`: the century rule is off for 2100 to 2398 | `dayOf(2100, 3, 1)` is `36584`, and `isoDay(36584)` is `"2100-03-01"` |
| hollow-adv-12 | The task's own check; see below | |

- **hollow-adv-9, more.** Label order is pinned by one pair, given in one order (`"gas"` before `"diesel"`). Five one-change files on line 276 passed, among them `a.label > b.label ? 0 : 0` and `a.label >= b.label ? 1 : 0`. A case that gives the labels in the other order, and one with a tie, would fail them.
- **hollow-adv-10, more.** `isoDay` is pinned on four days and on days early in March 2026. Seventeen one-change files on lines 204 to 209 passed. A sweep in the helper would close them all: every day of a few years against `new Date(Date.UTC(2000, 0, 1) + d * 86400000).toISOString().slice(0, 10)`. The helper may use `Date`; it gives the same answer on every run.
- **hollow-adv-12 breaks the ask's letter only.** `writeOff` builds the note by hand, with the id in `credit`'s own form, and pushes it on `this.credits`. It behaves exactly as the reference does. The ask says "The note must come from the class's own `Invoice.credit`". The check's line `expect(one.creditList()).toEqual(twin.creditList());` cannot tell the two apart. Either watch the call (`vi.spyOn(invoice, "credit")` on the instance, called once), or judge that the same behaviour is a pass and delete the file. I lean to the second: the ask's reason, "so that it is numbered and kept like any other note", is met.
- **hollow-adv-13 came close and is kept.** `dayOf` with the century rule dropped altogether fails two cases, `dayOf: 1 January 2000 is day 0, and months run from 1` and `dayOfIso: reads a day, with spaces around it`. It fails only because January 2000 counts in year 399 of the era before.

**Wrong answers the check failed** (not kept):
- it voids the invoice after the note: 1 case;
- it returns `creditedPence()`: 2;
- the reason is `Written off`: 3;
- it guards a draft and a void invoice but not a paid one: 3.

**`other.ts` passed.** It stands after `cancel` and returns `this.credit(...).pence` from a ternary. Two more right styles also pass: `try { return this.credit(...).pence } catch { return 0 }`, and one added at the end of the file as `export interface Invoice { writeOff(day: Day): Pence }` with `Invoice.prototype.writeOff = ...`.

**Kind: it is `beside`.**
- A right answer needs `owedPence(): Pence` (line 422), `credit(day: Day, pence: Pence, reason: string): CreditNote` (line 400) and `CreditNote.pence` (line 40). The outline shows all three.
- Two facts are only in bodies, and the ask covers both. `credit` throws for 0 pence, a draft and a void invoice (lines 401 to 403). The id's form is on line 404. The ask says "When the invoice owes nothing, the method raises no note and returns 0. A draft, a void invoice and a paid invoice all owe nothing", and "The note must come from the class's own `Invoice.credit`".
- I found nothing that is only in a body or a comment and that a right answer needs.
- Each of the class's 31 first lines, as the outline prints it, is in the file exactly once, so an edit that quotes any of them applies. The file's indent of four spaces is not in the outline. A SEARCH with no leading spaces still applies.

## PM2 (inside): `Invoice.pay` refuses a reference the invoice already has

**Breaches.** Files 1 to 7 are `other.ts` plus one change, so the gap is in `unchanged`.

| File | What it gets wrong | A case that fails it |
| --- | --- | --- |
| hollow-adv-1 | `addLine`: `line.qty === 0`, so a quantity below 0 goes in | `addLine({ ...FUEL, qty: -100 })` throws RangeError |
| hollow-adv-2 | `addLine`: `line.qty <= 1`, so a quantity of 1 is refused | `addLine` with `qty: 1` returns 1 |
| hollow-adv-3 | `issue` no longer throws on a void invoice | a draft with a line, cancelled, then `issue(MON)` throws (`cannot issue invoice 1002: it is void`). Only "issue: throws with no lines, and throws the second time" is pinned. |
| hollow-adv-4 | `removeLine` no longer throws on a void invoice | the same draft: `removeLine(0)` throws. Only "removeLine: throws once the invoice is issued" is pinned. |
| hollow-adv-5 | `credit`: `pence <= 1`, so a note of one penny is refused | `credit(MON, 1, "a penny")` gives `{ id: "CN1003-1", day: MON, pence: 1, reason: "a penny" }` |
| hollow-adv-6 | `status`: an issued invoice that comes to nothing reads `open` (contrived, unlikely) | one sundry line at `unitPence: 0`, issued: `status()` is `"paid"` |
| hollow-adv-7 | `statementLines` of a draft gives `[]` | a draft with one `damage` line of 8000: `["Invoice 1003  issued -  due -", "  Damage: lost windlass  1 x £80.00  £80.00", "  Net £80.00  Tax £0.00  Total £80.00", "  Owed £0.00"]` |

Files 8 to 12 are the task's own check. Each starts from the file as it is, with the change made in a wrong but likely way.

| File | What it gets wrong | The check's words |
| --- | --- | --- |
| hollow-adv-8 | It compares references trimmed. `" BACS-17"` is refused after `"BACS-17"`, and a reference of spaces only is never refused. I expect real tries to do this. | The ask sets aside letter case and nothing else: "Letter case does not count". The case `a reference that only looks like an earlier one is taken` tries `BACS-1`, `BACS-171`, `BACS17` and `ACS-17`, none with outer spaces. |
| hollow-adv-9 | It records `ref.trim()`. | The ask: "recorded with its reference exactly as it was given". The case `a reference is recorded exactly as it was given` uses `Bacs-17` and `C-881x`, neither with an outer space. |
| hollow-adv-10 | It compares with `localeCompare(ref, undefined, { sensitivity: "base" })`, so accents do not count either: `RÉF-1` is refused after `REF-1`. | No case has an accent. |
| hollow-adv-11 | It compares with `new RegExp("^" + ref + "$", "i")`: `C.881` is refused after `C-881`, and `A(1` throws SyntaxError. | No case has a character a pattern reads specially. |
| hollow-adv-12 | It keeps a `Set` of references and fills it before the pence are checked. `pay(d, 0, "transfer", "X-1")` throws, and then `pay(d, 100, "transfer", "X-1")` is refused, though no payment with that reference is recorded. Unlikely. | The case `a call that throws RangeError for its pence still throws, with a reference used before` throws only with a reference already recorded. |

For hollow-adv-8: add `"BACS-17 "` and `" BACS-17"` to that case. If the mender judges trimming a fair reading, the ask has two readings and should say which.

**Wrong answers the check failed** (not kept):
- it compares with the latest payment only: 2 cases;
- it returns 0 for a refused payment: 5;
- it refuses only the same reference with the same method: 2;
- the guard stands between the two checks that throw: 1.

**`other.ts` passed.** It uses a `for` loop and `toUpperCase`, placed as the reference places its lines.

**Kind: everything a right answer needs is in the ask and `region.md`. But the change can be written from the outline alone.**

The outline shows three things: `pay`'s whole first line (line 380, not cut), the field `private payments: Payment[] = []` (line 319) and `Payment.ref` (line 33). I wrote three files from those alone, and kept none in W.

1. **The guard as the first line of the body.** It fails exactly one case of 141, `a call that throws RangeError for its pence still throws, with a reference used before`. This is the writer's `hollow-first`. So the need for the body rests on one sentence of the ask, "A call that throws now must still throw.", and on one case.
2. **The same guard with a guess at what throws.** It passes all 141:

   ```ts
   if (ref !== "" && Number.isInteger(pence) && pence > 0
       && this.payments.some((earlier) => earlier.ref.toLowerCase() === ref.toLowerCase())) return pence;
   ```

3. **A wrapper, with no guess.** It passes all 141. It is one edit whose SEARCH is `pay`'s first line as the outline prints it, replaced by:

   ```ts
       pay(day: Day, pence: Pence, method: PayMethod = "transfer", ref: string = ""): Pence {
           const before = [...this.payments];
           const left = this.payAsBefore(day, pence, method, ref);
           if (ref !== "" && before.some((earlier) => earlier.ref.toLowerCase() === ref.toLowerCase())) {
               this.payments = before;
               return pence;
           }
           return left;
       }

       private payAsBefore(day: Day, pence: Pence, method: PayMethod = "transfer", ref: string = ""): Pence {
   ```

By the brief's test ("Could the change be written from the outline alone, without the body? If so it is not an `inside` task") this task fails, through the wrapper. In practice a reader with the outline alone will most likely write the first form and fail on the one case. The second form shows how thin that is. A wrapper like the third defeats almost any task whose change is a guard. A change to what the body works out in its middle would be `inside` without doubt. I leave the choice to the mender.

## PM3 (leans): `Invoice.statementLines` shows each payment

**Breaches.** Files 1 to 5 are `other.ts` plus one change, so the gap is in `unchanged`.

| File | What it gets wrong | A case that fails it |
| --- | --- | --- |
| hollow-adv-1 | `lateFee` rounds each 30 days' share down on its own: `Math.floor((owedPence * LATE_FEE_RATE) / 1000) * months` | `lateFee(3333, 60)` is `1599`; the file gives 1598. Two lots of 30 days are pinned only for 10000, which has no part of a penny. |
| hollow-adv-2 | `nextNumber` passes over void invoices | invoices 1003 and a cancelled 1009: `nextNumber` is `1010` |
| hollow-adv-3 | `ageing`: `row.notDue = owed`, so only the last invoice not yet due is counted | two invoices not yet due. The pinned cases have one invoice in `notDue` and one in `to60`. |
| hollow-adv-4 | `accountSummary`: `lastPaidDay` is the latest day among all payments | one invoice paid on `MON + 9` and then on `MON + 2`: `lastPaidDay` is `MON + 2`; the file gives `MON + 9` |
| hollow-adv-5 | `accountSummary`: `overduePence = owed`, so only the last overdue invoice is counted | two overdue invoices of one hirer. The pinned case has one. |

Files 6 and 7 are the task's own check.

- **hollow-adv-6: `for (const payment of this.payments.reverse())`.** It reverses the invoice's own list in place.
  - The first statement is right. After it `paymentList()` is oldest first, `lastPaymentDay()` gives the first payment's day, and a second statement prints the payments the other way up.
  - No case of the check, and none of `unchanged`, looks at the invoice after `statementLines` or calls it twice.
  - I expect this in real tries of the `whole` arm: a reader who knows the list is newest first reaches for `.reverse()`.
  - A case that fails it: after `statementLines`, `paymentList()` and `lastPaymentDay()` are as before, and a second call gives the same lines. A general case in `unchanged`, "statementLines leaves the invoice as it was", would also guard PM1 and PM2.
- **hollow-adv-7: it leaves out a payment dated after `today`.** The ask says "one line for each payment" and "whatever days the payments carry". Every payment in the check is dated on or before `today`. Unlikely.
- **hollow-adv-8 came close and is kept.** It is the `pad2` change of PM1's hollow-adv-1. This check fails it on 2 cases, only because its statements happen to print 9 March.

**The natural wrong guess, in other forms: all failed** (not kept):
- `this.paymentList().forEach` forward: 4 cases;
- `out.push(...this.payments.map(...))`: 4;
- sorted by day, latest first: 3;
- the line with the reference added: 5;
- the lines above the credit notes: 1.

**`other.ts` passed.** It goes through `this.paymentList().reverse()` and builds the line with `join("  ")`.

**Kind: it is `leans`.**
- **The ask does not give the fact.** It says "The lines go in the order in which the payments were recorded: the payment recorded first is the top one, whatever days the payments carry". It does not say how the list is kept, and it does not name `pay`.
- **`region.md` does not show it.** `this.payments` appears there only as `this.payments.length > 0`. Its loop `for (const note of this.credits)` prints the notes in list order, which makes the wrong guess more natural.
- **The first lines leave it open:** line 319 `private payments: Payment[] = []`, line 380 `pay(...)`, line 391 `paymentList(): Payment[]`, line 395 `lastPaymentDay(): Day`.
- **The natural guess is wrong:** a forward loop fails 4 cases.
- **The whole file shows the fact plainly:** lines 385 and 386 (`// newest first: ...` and `this.payments.unshift(`), and line 396 (`this.payments[0].day`).
- **A careful reader of `region.md` can see that another declaration matters.** `Payment` (lines 29 to 33) has no member that says when it was recorded. So the order can come only from how the list is filled, and the region does not show where that is.
- The format needs nothing more: `isoDay` and `formatPence` are in the region, and the ask gives an example line.

## The module

- **It type-checks.** `tsc --strict` exits 0 on the module, on each `reference.ts` and on each `other.ts`.
- **It keeps the format rules.** 593 lines. No line over 120 columns. No line the bench reads as a mark. The outline has no cut line.
- **Nothing changes from run to run.** No clock, no random number, no import, no call that depends on the locale.
- **I found nothing broken.** Four things are odd and are not faults:
  - `sameHirer` trims the invoice's hirer, which the constructor has already trimmed (line 141).
  - `isoDay` prints `-` for every day before 2000, not only for `NO_DAY`.
  - An issued invoice that comes to nothing is `paid` at once.
  - `credit`'s `mustBeLive` (line 401) shows only in the kind of error: line 403 throws RangeError for a draft or a void invoice anyway, and the case uses `toThrow()` with no kind.
- **It reads as real code.** The comments are sparse. The conventions sit in bodies: payments newest first, the due day moved off a weekend, tax by band with the part of a penny dropped, half a penny up in `lineNet`, the part of a penny to the net in `taxWithin`, the late fee's days of grace.
- **The check runs an answer without type-checking it.** A file with `readonly number: number;` or `private voided = false;` taken out passes. A reply that `tsc` would refuse can pass.

**The 45 one-change files that passed.**
- **Ten change nothing a caller can see:** line 141; lines 315, 316, 317 and 322 (a declaration taken out); line 401 (above); line 455 (`unshift` into an empty list); line 468 (`fee > 1`: a fee is 0 or at least 1500); line 512; line 558 (`<=` on a tie).
- **Thirty are covered by a kept file:** line 121 (PM1 hollow-adv-1), 157 (PM1 6), 197 (PM1 11), the 17 on lines 204 to 209 (PM1 10), the 5 on line 276 (PM1 9), 335 (PM2 2), 402 (PM2 5), 514 (PM3 3), 557 (PM3 5), 516 (PM3 3's kind).
- **Five have no file:**
  - Line 166, `formatQty` with `qty / 101` and with `qty / 99`. Only 42.50 and 1.05 are pinned. A line of quantity 9950 (`99.50`) fails both.
  - Line 527, `allocate` with `pence <= 1`; line 528, `allocate` with `owedPence() > 1`; line 558, `accountSummary` with `owed > 1`. No case has exactly one penny in `allocate`, or an invoice that owes one penny.

My screening files are in `SCRATCH/adv-invoices` (`m1.py` and `m2.py` hold each change as text; `auto.out`, `auto-PM2.out` and `auto-PM3.out` list the one-change files that passed). That directory may be cleared. Everything the mender needs is above and in W.
## changes

Nothing had been done before I started. W had no CHANGES.md, check-tasks ended `31 WRONG` (all of them adversary files) and the helper and checks were as the writer left them. So the takeover line opens /home/build/patch/invoices/set/CHANGES.md and every line below it is mine. That file has one line for each change.

1. Cases added to `unchanged` in /home/build/patch/invoices/set/checks/helpers-invoices.ts. They close 24 of the 31 breaches and the 5 one-change files that had no hollow file:
   - **Money and parsing:** formatPence for every count of pence from 1 to 99, and commas at 5 to 10 digits of pounds. parsePence drops every comma, takes a pound sign only at the front, and gives NaN for an inner space or a trailing point. parseLine gives null for more than four parts.
   - **Days:** isoDay and dayOf over every day of 2000–2101 and 2399–2400, compared with Date.UTC.
   - **Tax and lines:** taxSummary keeps a row for a band whose lines come to nothing. describeLine for qty 9950, 109 and 2. sortLines by code-unit label order, with labels given in both orders.
   - **Invoice methods:** lateFee over several lots of 30 days. addLine with a quantity below 0 and with a quantity of 1. removeLine and issue on a void invoice. A credit note of one penny. An issued invoice that comes to nothing has status paid. statementLines of a draft.
   - **statementLines changes nothing:** a new case makes a statement twice and checks the invoice is as it was. It answers PM3 hollow-adv-6 and guards PM1 and PM2 too.
   - **Lists of invoices:** nextNumber counts void invoices. ageing adds up each band. allocate with one penny. accountSummary adds up every overdue invoice, takes each invoice's last recorded payment day, and counts an invoice that owes one penny.
2. Renamed the breaching hollow files to names that say what each gets wrong:
   - **PM1:** pad, commas, onecomma, poundsign, spaces, point, fiveparts, zeroband, locale, monthend, century.
   - **PM2:** negqty, hundredth, issuevoid, removevoid, penny, nothing, draftlines, trim, storetrim, accent, regexp, remembered.
   - **PM3:** feeround, skipvoid, notdue, latestday, overdue, reverse, future.
3. PM1: deleted hollow-adv-12.ts, which I judge a right answer (see what I left alone). A copy is at SCRATCH/mend-invoices-opus55/PM1-hollow-adv-12.ts. PM1 hollow-adv-13 and PM3 hollow-adv-8 were not breaches, so they keep their names.
4. PM2 ask.md (now 147 words):
   - It now says "Nothing else is set aside: a space before or after a reference, or an accent on one of its letters, makes it another reference." This answers the two readings behind hollow-adv-8: the module trims hirers' names and line labels, so a reader could have trimmed references too.
   - "all of its pence come back as not taken" became "A refused payment does not throw. It is not recorded, and none of it is taken." This answers the finding that PM2 is only weakly inside. With the old words, a reader with only the outline could write the change as a guard or as a wrapper around the old method. Now only the comment above `pay` and its last line, which region.md has and the outline does not, say what number comes back.
5. PM2 check.test.ts:
   - New case: a space before or after a reference makes it another reference (answers adv-8).
   - Added `" Chq 0042 "` to the case that a reference is recorded exactly as given (adv-9).
   - New case: an accent makes it another reference (adv-10).
   - Added `BACS.17`, `BACS(17` and `BACS-17*` to the case that a reference which only looks like an earlier one is taken (adv-11).
   - New case: a call that throws records nothing, so its reference is taken afterwards (adv-12).
6. PM3 check.test.ts: new case that a payment dated after the statement's day still has its line (adv-7).
7. PM2 and PM3 where.md: notes on these mends and the new wrong answers, for whoever sorts failures.
8. Ran holds.py make again. The held texts did not change in content, and PM2's region is the same.

The module, every plain.ts, reference.ts and reference.edits.md, and the PM1 ask and check are unchanged.

How I checked the mends:
- Every reference and other.ts passes, and every hollow fails at an assertion.
- Five more right answers in other styles pass: PM2 with toLocaleLowerCase/find, with `taken = seen ? 0 : ...`, and with localeCompare at accent sensitivity; PM3 with slice().reverse() and with an index loop over paymentList().
- The helper and each check type-check against their reference.
- I re-ran the adversary's 638 one-change files against each check. 18 pass for every task, where 45, 45 and 44 passed before.

## tsc_last_line

(no output) — tsc exit 0

## holds_check_last_line

all as they must be

## check_tasks_last_line

window: none; all as they must be

## left_alone

1. **PM1 hollow-adv-12 (writeOff builds the note by hand in credit's own id form):** I judge this finding wrong. The note it makes has the same id, day, pence and reason that credit would give, and it goes on the same list, so the ask's stated purpose ("so that it is numbered and kept like any other note") is met. The check tests behaviour through the module's exports, and a right answer written another way must pass. Spying on whether `credit` is called would test how the method is written, not what it does. A made-up id, the likely fault, still fails as hollow-byhand.ts. I left the check and ask as they are and deleted the file, since a right answer cannot stay as a hollow.
2. **Eight one-change files that no case can tell from the module:**
   - Line 206 (isoDay's `leaps` with 1459, 36523 or 146095): SCRATCH/mend-invoices-opus55/probe.mjs finds they never print a different day in 1,200 years.
   - Line 276 (sortLines comparator): the five changes only alter how far below or above 0 the result is, or turn a tie from 0 to 1. Node's sort reads only whether the result is below 0, and node v22.23.4 sorted 20,000 random lists the same as the module. The adversary's suggested remedy (labels in the other order, and a tie) is in the new case and cannot fail them.
3. **The ten one-change files that change nothing a caller can see:** the adversary's own finding; there is nothing to pin.
4. **"The check runs an answer without type-checking it":** this belongs to the grader in /home/user/Kung-Fu/bench/box.py, which is outside W and which I must not edit. It is not a fault of these tasks.
5. **The module's four odd things** (sameHirer trims twice, isoDay prints - before 2000, an invoice of nothing is paid at once, credit's mustBeLive shows only in the kind of error): the finding calls them not faults. The module is left as it was.
6. **PM1's and PM3's kinds:** the findings say both are of their kind, so I changed nothing there.

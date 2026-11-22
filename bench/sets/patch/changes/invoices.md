# Changes to the `invoices` tasks, after the adversary's findings

The mender before me left no line here, and nothing in W was changed when I began on 2026-11-22: `check-tasks` ended `31 WRONG`, every one an adversary file, and the helper and checks were as the writer left them.

**Another mender took over here** (Claude Opus 5.5, 2026-11-22). One line for each change, with the finding it answers. "PMn adv-k" is the adversary's `tasks/PMn/hollow-adv-k.ts`, and the name after the arrow is what it is called now.

## `checks/helpers-invoices.ts`: cases added to `unchanged`

- `formatPence: two places for every count of pence from 1 to 99`. PM1 adv-1 → `hollow-pad.ts` (`pad2` with `n < 9`). It also fails PM3 adv-8 on more cases.
- `formatPence: a comma at each thousand, for every count of digits in the pounds`. PM1 adv-2 → `hollow-commas.ts` (wrong commas at 5 and 6 digits of pounds).
- `parsePence: every comma is dropped, and a pound sign is allowed only at the front`. PM1 adv-3 → `hollow-onecomma.ts`, PM1 adv-4 → `hollow-poundsign.ts`.
- `parsePence: NaN for a space inside the amount, and for a point with no figure after it`. PM1 adv-5 → `hollow-spaces.ts`, PM1 adv-6 → `hollow-point.ts`.
- `parseLine: null for more than four parts, and for a quantity with a point and no figure after it`. PM1 adv-7 → `hollow-fiveparts.ts`; PM1 adv-6 again.
- `isoDay: every day of 2000 to 2101 and of 2399 to 2400, as the calendar has it`, and the function `calendarDays` it walks. PM1 adv-10 → `hollow-monthend.ts`, and 14 of the 17 one-change files on lines 204 to 209. The days are checked against `Date.UTC`, which gives the same answer on every run. The other three are under "Left as it was".
- `dayOf: every day of 2000 to 2101 and of 2399 to 2400, as the calendar has it`. PM1 adv-11 → `hollow-century.ts`, and the one-change file on line 197.
- `taxSummary: a band whose lines come to nothing still has its row`. PM1 adv-8 → `hollow-zeroband.ts`.
- `describeLine: a part of a unit under a tenth, and a large quantity with a part`. The finding's "five have no file": line 166, `formatQty` with `qty / 101` and `qty / 99`.
- `sortLines: labels by their characters, capitals before small letters, in whatever order they come`. PM1 adv-9 → `hollow-locale.ts`. The finding's five one-change files on line 276 are under "Left as it was".
- `lateFee: the share for several lots of 30 days is worked out once, a part of a penny dropped`. PM3 adv-1 → `hollow-feeround.ts`.
- `addLine: a quantity below 0 throws RangeError, and one hundredth of a unit goes in`. PM2 adv-1 → `hollow-negqty.ts`, PM2 adv-2 → `hollow-hundredth.ts`.
- `removeLine: throws on a void invoice, and keeps its lines`. PM2 adv-4 → `hollow-removevoid.ts`.
- `issue: throws on a void invoice, which stays void and unissued`. PM2 adv-3 → `hollow-issuevoid.ts`.
- `credit: a note for a single penny`. PM2 adv-5 → `hollow-penny.ts`.
- `status: an issued invoice that comes to nothing is paid at once`. PM2 adv-6 → `hollow-nothing.ts`.
- `statementLines: a draft has no days and owes nothing`. PM2 adv-7 → `hollow-draftlines.ts`.
- `statementLines: leaves the invoice as it was, and gives the same lines a second time`. PM3 adv-6 → `hollow-reverse.ts` (`this.payments.reverse()` in place). It compares a statement with itself, so no task need skip it, and it guards PM1 and PM2 as well.
- `nextNumber: void invoices count, as their numbers are spent`. PM3 adv-2 → `hollow-skipvoid.ts`.
- `ageing: each band adds up every invoice in it`. PM3 adv-3 → `hollow-notdue.ts`, and the one-change files on lines 514 and 516.
- `allocate: a single penny, and an invoice that owes a single penny`. The finding's "five have no file": line 527 (`pence <= 1`) and line 528 (`owedPence() > 1`).
- `accountSummary: what is overdue adds up every overdue invoice`. PM3 adv-5 → `hollow-overdue.ts`.
- `accountSummary: the last paid day is the day of the payment each invoice recorded last`. PM3 adv-4 → `hollow-latestday.ts`.
- `accountSummary: an invoice that owes a single penny is still owed on`. The finding's "five have no file": line 558 (`owed > 1`).

## PM1 (beside)

- `hollow-adv-12.ts` deleted from W. A copy is at `SCRATCH/mend-invoices-opus55/PM1-hollow-adv-12.ts`, and it passes the check. The finding is judged wrong; see "Left as it was" below.
- `hollow-adv-13.ts` kept under its name. It was not a breach: it failed 2 cases, and fails 3 now.

## PM2 (inside)

- `ask.md`: "Nothing else is set aside: a space before or after a reference, or an accent on one of its letters, makes it another reference." PM2 adv-8: the ask had two readings, since the module trims a hirer's name and a line's label, and a reader could trim a reference too. The reading kept is the reference answer's.
- `ask.md`: "A refused payment is not recorded, and all of its pence come back as not taken" became "A refused payment does not throw. It is not recorded, and none of it is taken." The finding on PM2's kind: with the old words a reader of the outline alone could write the change, by a guard or by a wrapper round the old method. What number comes back is now said only by the comment above `pay` and its last line, which `region.md` holds and the outline does not. 147 words.
- `check.test.ts`, new case `a space before or after a reference makes it another reference`. PM2 adv-8 → `hollow-trim.ts`.
- `check.test.ts`, the case `a reference is recorded exactly as it was given` also pays with `" Chq 0042 "`. PM2 adv-9 → `hollow-storetrim.ts`.
- `check.test.ts`, new case `an accent on a letter makes it another reference`. PM2 adv-10 → `hollow-accent.ts`.
- `check.test.ts`, the case `a reference that only looks like an earlier one is taken` also pays `BACS.17`, `BACS(17` and `BACS-17*`. PM2 adv-11 → `hollow-regexp.ts`.
- `check.test.ts`, new case `a call that throws records nothing, so its reference is taken after it`. PM2 adv-12 → `hollow-remembered.ts`.
- `where.md`: what the ask now leaves to the method's lines, and the new wrong answers. For the person who sorts failures; it answers the same findings.

## PM3 (leans)

- `check.test.ts`, new case `a payment dated after the day of the statement has its line too`. PM3 adv-7 → `hollow-future.ts`.
- PM3 adv-6 is answered in `unchanged`, above.
- `hollow-adv-8.ts` kept under its name. It was not a breach: it failed 2 cases, and fails 5 now.
- `where.md`: the two new wrong answers, `hollow-reverse.ts` and `hollow-future.ts`.

## The held texts

- `holds.py make` run again after the PM2 ask changed. The texts are the file's, so none changed but their times; PM2's region still holds lines 376 to 389.

## Left as it was

- **PM1 adv-12, `writeOff` that builds the note by hand in `credit`'s own form.** It does what the ask is for: the note it raises has the id, day, pence and reason `credit` would give, and it is kept on the same list, so "numbered and kept like any other note" holds. The check tests behaviour through the exports, and a right answer written another way must pass; watching whether `credit` is called would test how the method is written. So the file is a right answer and cannot stay as a hollow one. A wrong id, the likely fault of a reader who copies by hand, is still failed (`hollow-byhand.ts`).
- **The check runs an answer without type-checking it.** That is the grader's, in `bench/box.py`, outside W. It is not a fault of these tasks.
- **The module.** The finding calls it sound, and its four odd things (`sameHirer` trims twice, `isoDay` prints `-` before 2000, a bill of nothing is paid at once, `credit`'s `mustBeLive` shows only in the error's kind) not faults. No task turns on them, so the module and every `plain.ts`, `reference.ts` and `reference.edits.md` are as they were.
- **The ten one-change files that change nothing a caller can see.** There is nothing to pin.
- **Eight more one-change files that no case can tell from the module.** After the mends, the adversary's screen of 638 one-change files (its `auto2.py`, each file with that task's `other.ts` change in it), run again against each task's check, passes the same 18 for all three tasks, where it passed 45, 45 and 44: the ten above and these eight. Three are on line 206 (`1460` to `1459`, `36524` to `36523`, `146096` to `146095` in `isoDay`'s `leaps`); `SCRATCH/mend-invoices-opus55/probe.mjs` (a scratch file that may be cleared) finds that none of them prints another day in 1,200 years from 2000. Five are on line 276 (`sortLines`): each changes only how far below or above 0 the comparison is, or turns a tie from 0 to 1, and node's sort reads only whether the number is below 0. On 20,000 random lists of up to 70 lines, node v22.23.4 sorts every one the same as the module. The finding's remedy, labels in the other order and a tie, is in the new case and does not fail them, because they are the same function to every caller.
- **PM1's and PM3's kinds.** The findings say they are of their kind.

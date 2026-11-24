# Adversary's findings: module `keys`, tasks PJ1 (beside), PJ2 (inside), PJ3 (leans)

W = /home/build/patch/keys/set. I changed none of the writer's files. I added only `tasks/<id>/other.ts` (three) and `tasks/<id>/hollow-adv-<n>.ts`. Numbers have gaps because failed attempts were deleted.

## The commands, last lines

- `python3 bench/box.py check-tasks W --window none`: `window: none; 23 WRONG`. All 23 are my `hollow-adv` files that passed. Every reference, plain, `other` and writer's hollow is `ok`.
- `python3 bench/holds.py check W`: `all as they must be`.
- `tsc --strict` passes on `files/keys.ts`, on the three `reference.ts`, and on every file I kept.

**Totals:** 23 breaching files (PJ1 8, PJ2 6, PJ3 9). All three `other.ts` passed.

## The regression helper, `checks/helpers-keys.ts`: 12 gaps in 9 functions

Each file below is the task's `reference.ts` with one other function changed a little. `unchanged` is the same in all three checks, so each gap should hold for every task. I ran each only in the tasks listed. "Module" is what `files/keys.ts` does; "file" is what the breaching file does.

| Function | Files | What the file gets wrong | Where it differs |
| --- | --- | --- | --- |
| `settle` | PJ1 adv-1, PJ3 adv-4 | Charges the late fee only while gear is still out. | 2 windlasses issued, both back at day 12 minute 660, `settle(loan, 12, 660)`: module `latePence: 2500, keptPence: 2500, refundPence: 5000`; file `0, 0, 7500`. |
| `issue` | PJ1 adv-2 | Ignores an issue to a settled loan. | `settle(loan, 12, 590)` then `issue(loan, "mallet", 1, 12, 595)`: module adds the line and a log entry; file adds nothing. |
| `issue` | PJ2 adv-5, PJ3 adv-3 | Ignores an issue entered twice (same kind, day and minute as the newest entry). | `issue(loan, "windlass", 1, 5, 540)` twice: module `issued: 2`, 2 log entries; file `issued: 1`, 1 entry. |
| `issueKeys` | PJ3 adv-5 | Refuses a settled loan. | After `settle`, `issueKeys(loan, 17, 1, 12, 595)`: module `true`, tag 17; file `false`, tag 0. |
| `issueKeys` | PJ2 adv-2 | Refuses a loan that ever had boat keys, though the tag is back on the board. | `issueKeys(loan, 17, 1, 5, 540)`, `takeBack(loan, "boatKey", 1, 6, 480)`, `issueKeys(loan, 18, 1, 6, 500)`: module `true`, tag 18; file `false`, tag 0. |
| `takeBack` | PJ2 adv-1, PJ3 adv-2 | Gives 0 for a settled loan. | 2 windlasses out, `settle(loan, 12, 590)`, `takeBack(loan, "windlass", 1, 13, 480)`: module gives 1, 1 still out; file gives 0, 2 out. |
| `takeBack` | PJ1 adv-5, PJ3 adv-1 | Writes its log entry with `loan.log.unshift` and not `record`, so a return does not cut the log to 40. | 40 issues, then one `takeBack`: module log length 40; file 41. |
| `keyHolder` | PJ1 adv-3, PJ3 adv-6 | Gives the last open loan with the tag, not the first. | Open loans BK-A and BK-B both on tag 17, `keyHolder([a, b], 17)`: module BK-A; file BK-B. |
| `openLoan` | PJ1 adv-4 | Takes every space out of the booking reference, not only those at its ends. | `openLoan(" bk 204 ", ...)`: module `"BK 204"`; file `"BK204"`. |
| `standardKit` | PJ2 adv-3 | One windlass for a boat of 2 berths or fewer. | `standardKit(2)[0].issued`: module 2; file 1. No case has under 4 berths. |
| `isOpen` | PJ2 adv-4 | `settledDay <= 0` in place of `=== 0`. | `settledDay = -1`: module `false`; file `true`. Reached only by setting the field by hand, as the helper's own `isOpen` cases do. The weakest of the twelve. |
| `summary` | PJ1 adv-16 | Counts damaged items only on lines with gear still out. | One mallet issued and back damaged: module `"BK-204 Heron: 0 out, 1 damaged"`; file `"BK-204 Heron: 0 out"`. |

Why they pass:

- No case of the helper or of any check calls `issue`, `issueKeys` or `takeBack` after `settle`.
- No case settles a loan that is late with everything back. The case "lateFee is charged whether or not gear is still out" pins `lateFee` only.
- The 40-entry limit is pinned only through `issue` ("issue keeps the newest 40 entries of the log and drops the oldest").
- No case issues one kind twice in one minute, has two open loans on one tag, or has a reference with a space inside it.
- In both `summary` cases with damage, every damaged line still has gear out.

The helper failed all 11 other changes I tried, each at an assertion: `LATE_DAYS_CAP` 4, an `overdueLoans` tie broken by count, the minus sign after the pound sign, `depositFor` with `<`, the late line shown at 0, `keyHolder` without its tag-0 line, `settle` overwriting the settled day, `summary` with key before damaged, `LOG_KEEP` 41, damaged clamped to `count`, and the line-rounded half in `gearCharge`. Those files are deleted.

## PJ1 (beside): `stillOut`

**Breaches of the task's own cases (2). Both are unlikely answers and cheap to close.**

- `hollow-adv-10.ts`: keeps one loan for each `bookingRef` before counting. Two open loans both "BK-1" with 2 and 3 windlasses out: right answer 5, file 3. The ask says "how many items are out over all the loans in the list". Every loan in the check has its own reference (BK-1, BK-2, BK-3).
- `hollow-adv-11.ts`: sorts each open loan's `lines` in place into the order of `ALL_KINDS`. Mallet issued before windlass: after the call the file leaves `["windlass", "mallet"]`. The ask says "The function changes neither the loans nor the list." The case "changes neither the loans nor the list" (check lines 75 to 88) builds loan `a` with `issueKit(a, 6, 5, 540)`, whose lines are already in that order.

Six more breaches are helper gaps, in the table: adv-1, adv-2, adv-3, adv-4, adv-5, adv-16.

**Kept, failed as it should:** `hollow-adv-12.ts` reads each line with `lineFor`, which adds a line where there is none. Only "changes neither the loans nor the list" fails it. This is the likely slip of an outline reader. The outline's line 94, `function lineFor(loan: Loan, kind: GearKind): GearLine {`, does not say it adds a line; only its body does.

Also tried, failed and deleted: a damaged item counted as out; settled judged by `settledDay > 1` (only "leaves out a loan settled on the first day of the season" fails it); settled loans spliced out of the list.

**`other.ts` passed.** It builds the result with `Object.fromEntries` over `ALL_KINDS`, `loans.filter(isOpen)` and `outstanding(loan, kind)`. I found nothing the check tests that the ask does not say.

**Kind: it is a `beside` task.** A right answer can be written from the ask and `outline.md`: the six kinds (lines 4 and 43), `issued` and `back` (10, 11), `isOpen` (90), `outstanding` (137). Three facts are only in bodies or comments:

- An open loan has `settledDay` 0 (bodies of `openLoan` and `isOpen`). The ask says "Only open loans count" and does not name `isOpen`. A reader who tests `settledDay` must guess the value for "none". Not needed, since `isOpen` is in the outline.
- `lineFor` adds a line. Not needed.
- `back` holds the damaged items (comment at line 12, which the outline drops). The ask says it: "A line's `back` counts every item that came back, the damaged ones too".

## PJ2 (inside): `gearCharge`

**Breach of the task's own cases (1).**

- `hollow-adv-10.ts`: charges the one key when `loan.keyTag !== 0`, not when the boat-key line has keys missing. `issue(loan, "boatKey", 2, 5, 540)` with none back: right answer 4500, file 0. The ask says "a loan with any boat keys missing is charged the cost of one boat key for them". Every boat key in the check and the helper goes out through `issueKeys`, and `takeBack` puts the tag back to 0 with the last key, so the tag and the missing keys always agree there.

Five more breaches are helper gaps, in the table: adv-1, adv-2, adv-3, adv-4, adv-5.

**Kept, failed as they should, each by one case:**

- `hollow-adv-12.ts` applies the one-charge rule to `waterKey` too. Failed by "still charges every missing item of the other kinds".
- `hollow-adv-14.ts` charges a lock when a key is missing or damaged. Failed by "charges damaged boat keys at half when none is missing".

Also tried, failed and deleted: the one charge swallowing the damaged keys; the half rounded for the line and not for each item.

**`other.ts` passed.** It sums the missing keys over the whole loan and adds one key's cost after the loop. The reference caps each line. Both pass. They differ only for a loan with two boat-key lines, which the module never makes and the check does not test. The ask has one reading.

**Kind: it is an `inside` task.** The ask and `region.md` (lines 145 to 154) hold all a right answer needs. It cannot be written from the outline alone. An edit must quote the body. A body written anew must know that damaged gear is charged `Math.ceil(each / 2)` for each item, which only the body says; the ask says only "as it is now".

## PJ3 (leans): `takeBack`

**Breaches of the task's own cases (5).**

- `hollow-adv-9.ts`: a form of the wrong guess. It takes the newest entry to be whichever end of the log has the later day and minute, and the last entry on a tie. Issue 3 windlasses at day 9 minute 480, return 1 at 9/480, enter it again: right answer gives 1 then 0 with 2 out; file gives 1 then 1 with 1 out.
- `hollow-adv-10.ts`: the same, with the first entry on a tie. Issue at 9/500, return entered for 9/480, entered again: right 1 then 0; file 1 then 1.
  - Both pass because in every case of "a repeat" the oldest entry is an issue of day 5 and the return is day 9 (`kitted`, check lines 7 to 12). In "the entry added last is not the one with the latest time" (lines 108 to 115) the newest entry, 9/300, is still later than the oldest, 5/540. So a reader who does not know the order, and settles it by the times at the two ends, passes without the fact.
- `hollow-adv-17.ts`: a repeat only when the call's count is at least the logged count. Return 3 lifejackets at 9/480, then enter 1 at 9/480: right 3 then 0; file 3 then 1. The ask says "The counts do not have to match." The only case with unequal counts, "is a repeat whatever the two counts are" (lines 24 to 31), repeats with 3 and 2 against a logged 1, both larger.
- `hollow-adv-1.ts` and `hollow-adv-2.ts`: the repeat rule is right, and `takeBack` is changed for a call that is not a repeat (the log grows past 40; a settled loan is refused). The ask says "A call that is not a repeat does exactly what it does now." Both are in the helper table.

Four more breaches are helper gaps in other functions: adv-3, adv-4, adv-5, adv-6.

**Kept, failed as they should, each by one case:**

- `hollow-adv-12.ts`: a repeat when either end of the log matches. Failed only by "takes back a return when the matching one is the oldest entry the log still holds" (lines 117 to 125).
- `hollow-adv-16.ts`: the log sorted by time, later first, stable. Failed only by "the entry added last is not the one with the latest time".

Also tried, failed and deleted:

- The guess as `loan.log.at(-1)`: 6 cases fail it.
- The newest return, not the newest entry.
- The newest entry of that kind.
- The last return of that kind found from the end.
- The first entry when it is a return, or else the last. Failed only by the same "oldest entry" case as adv-12. That one case is all that stands against two forms of the guess.

**`other.ts` passed.** It puts the test after `if (accepted <= 0) return 0;` and reads the newest entry as `const [newest] = loan.log`. The ask has one reading.

**Kind: it is a `leans` task.**

- The ask does not give the fact away. Its words are "the entry most recently added to the loan's log", with no end named. Its only code spans are `takeBack` and `src/keys.ts`.
- `region.md` does not show it. It has the outline and lines 123 to 135. The log appears there only as `record(loan, { action: "back", kind, count: accepted, day, minute });`.
- The other declaration's first line, `function record(loan: Loan, entry: LogEntry): void {`, leaves the order open.
- The natural guess, that a log grows at its end, is wrong: `record` uses `unshift`.
- The whole file shows the fact plainly: the comment at line 103, "The log is kept newest first, because the desk screen shows its top few entries. Old entries fall off the end.", and line 105.
- A careful reader of `region.md` sees that `record` is the only thing that adds to the log, so its order matters.
- One weakness, from the breaches: until the check fails adv-9 and adv-10, a `region` reader can pass by the times at the two ends, without holding the fact.

## The module, `files/keys.ts`

- **Nothing is broken, and nothing changes from run to run.** There is no clock and no random number. `overdueLoans` sorts a filtered copy, and the sort is stable.
- **Format:** 254 lines, longest line 119 columns, four spaces, every function header on one line. The outline shows 0 first lines cut.
- **It reads as real code.** Three small things:
  - `receiptLines` prints the raw kind names on a slip for the customer, such as `boatKey x1 not returned`.
  - The comment at line 61 says "Anyone heavier takes a large", but a person of exactly 70 kg also takes a large (`weightKg < limit`).
  - `issue`, `issueKeys` and `takeBack` all work on a settled loan with no guard. That may be meant or may be a slip. It is exactly where the helper is silent.
- **The asks keep to the brief:** 148, 137 and 146 words, each names `src/keys.ts`, none mentions a test. `where.md` agrees with the file in the line numbers I checked.
- **Not tried:** the grader runs vitest only, so I expect an answer that runs but fails `tsc --strict` to pass. I did not try one. It is a matter for the whole set, not this module.

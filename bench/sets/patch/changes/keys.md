# Changes to `keys` after the adversary's findings

Written by Claude Fable 5.2 on 2026-11-20. One line for each change, with the finding it answers. The module `files/keys.ts`, the three asks, the three reference answers and their edits are as the writer left them.

## The regression helper, `checks/helpers-keys.ts`: twelve new cases

Each case pins what the module does now. All three checks run them.

- Added "settle keeps the late fee when all is back, but late". Finding: `settle` charging the late fee only while gear is out passed (PJ1 adv-1, PJ3 adv-4).
- Added "issue still issues to a loan that has been settled". Finding: `issue` ignoring a settled loan passed (PJ1 adv-2).
- Added "issue counts and logs an issue entered twice for one day and minute". Finding: `issue` ignoring an issue entered twice passed (PJ2 adv-5, PJ3 adv-3).
- Added "issueKeys still gives keys to a loan that has been settled". Finding: `issueKeys` refusing a settled loan passed (PJ3 adv-5).
- Added "issueKeys gives a new tag once the last key of the old one is back". Finding: `issueKeys` refusing a loan that ever had keys passed (PJ2 adv-2).
- Added "takeBack still takes gear back from a loan that has been settled". Finding: `takeBack` giving 0 for a settled loan passed (PJ2 adv-1, PJ3 adv-2).
- Added "takeBack keeps the newest 40 entries of the log, as issue does". Finding: a `takeBack` that does not cut the log to 40 passed (PJ1 adv-5, PJ3 adv-1).
- Added "keyHolder gives the first loan in the list when two open loans have one tag". Finding: `keyHolder` giving the last such loan passed (PJ1 adv-3, PJ3 adv-6).
- Added "openLoan keeps a space inside the booking reference". Finding: `openLoan` taking out every space passed (PJ1 adv-4).
- Added "standardKit for the smallest boats still has two windlasses and three pins". Finding: one windlass for 2 berths or fewer passed (PJ2 adv-3).
- Added "isOpen is false for a settled day below 0: only 0 stands for not settled". Finding: `isOpen` with `settledDay <= 0` passed (PJ2 adv-4).
- Added "summary counts a damaged item of a kind that has nothing still out". Finding: `summary` counting damage only on lines with gear out passed (PJ1 adv-16).

## PJ1 (beside), `tasks/PJ1/check.test.ts`

- Added the case "counts each of two loans that have the same booking reference". Finding: an answer that keeps one loan for each booking reference passed (adv-10). The ask says "over all the loans in the list".
- Changed the case "changes neither the loans nor the list": the first loan's lines are now in the order issued, mallet before windlass, which is not the order of `ALL_KINDS`, and a third loan is open with no lines. Finding: an answer that sorts each loan's lines in place passed (adv-11). The first loan still lacks three kinds, so an answer that reads lines with `lineFor` still fails.
- `where.md`: three likely wrong answers and the six new regression files are named.

## PJ2 (inside), `tasks/PJ2/check.test.ts`

- Added the case "charges one key when the missing keys were issued with no tag". Finding: an answer that charges by `loan.keyTag` and not by the keys missing passed (adv-10). The ask says "a loan with any boat keys missing".
- `where.md`: three likely wrong answers and the five new regression files are named.

## PJ3 (leans), `tasks/PJ3/check.test.ts`

- Added the case "is a repeat when the return has the same day and minute as the issue before it". Finding: the newest entry taken as the end of the log with the later time, the last entry on a tie, passed (adv-9).
- Added the case "is a repeat when the return was entered for a time before every other entry in the log". Finding: the same guess in both its forms passed (adv-9, adv-10). After this, a reader who settles the order by the times at the two ends fails.
- Added the case "is a repeat when the second count is the smaller one". Finding: a repeat only when the call's count is at least the logged count passed (adv-17). The ask says "The counts do not have to match."
- Added the case "takes back a return when the matching one was the first entry of the log and an issue came after it". Finding: one case was all that stood against two forms of the guess. Now two cases do, and the new one does not lean on the log's limit of 40.
- `where.md`: the new wrong answers are named, and "a case" became "two cases" where the text counts them.

## Files renamed, none changed

Every `hollow-adv-<n>.ts` now has a word for what it gets wrong. The check fails each at an assertion.

| Task | Was | Now | What it gets wrong |
| --- | --- | --- | --- |
| PJ1 | `hollow-adv-1.ts` | `hollow-latefee.ts` | `settle`: late fee only while gear is out |
| PJ1 | `hollow-adv-2.ts` | `hollow-closed.ts` | `issue` ignores a settled loan |
| PJ1 | `hollow-adv-3.ts` | `hollow-holder.ts` | `keyHolder` gives the last loan with the tag |
| PJ1 | `hollow-adv-4.ts` | `hollow-spaces.ts` | `openLoan` takes out every space |
| PJ1 | `hollow-adv-5.ts` | `hollow-uncut.ts` | `takeBack` lets the log pass 40 |
| PJ1 | `hollow-adv-16.ts` | `hollow-tally.ts` | `summary` misses damage on lines with nothing out |
| PJ1 | `hollow-adv-10.ts` | `hollow-booking.ts` | one loan counted for each booking reference |
| PJ1 | `hollow-adv-11.ts` | `hollow-sorted.ts` | sorts each loan's lines in place |
| PJ1 | `hollow-adv-12.ts` | `hollow-linefor.ts` | reads lines with `lineFor`, which adds lines (it failed before, and still does) |
| PJ2 | `hollow-adv-1.ts` | `hollow-closed.ts` | `takeBack` gives 0 for a settled loan |
| PJ2 | `hollow-adv-2.ts` | `hollow-onetag.ts` | `issueKeys` refuses a loan that ever had keys |
| PJ2 | `hollow-adv-3.ts` | `hollow-kit.ts` | `standardKit`: one windlass for 2 berths or fewer |
| PJ2 | `hollow-adv-4.ts` | `hollow-negative.ts` | `isOpen` takes a settled day below 0 as not settled |
| PJ2 | `hollow-adv-5.ts` | `hollow-twice.ts` | `issue` ignores an issue entered twice |
| PJ2 | `hollow-adv-10.ts` | `hollow-tag.ts` | the one key charged by the key tag |
| PJ2 | `hollow-adv-12.ts` | `hollow-waterkey.ts` | one charge for water keys too (it failed before, and still does) |
| PJ2 | `hollow-adv-14.ts` | `hollow-lock.ts` | a lock charged for a damaged key (it failed before, and still does) |
| PJ3 | `hollow-adv-1.ts` | `hollow-uncut.ts` | `takeBack` lets the log pass 40 |
| PJ3 | `hollow-adv-2.ts` | `hollow-closed.ts` | `takeBack` gives 0 for a settled loan |
| PJ3 | `hollow-adv-3.ts` | `hollow-twice.ts` | `issue` ignores an issue entered twice |
| PJ3 | `hollow-adv-4.ts` | `hollow-latefee.ts` | `settle`: late fee only while gear is out |
| PJ3 | `hollow-adv-5.ts` | `hollow-keysclosed.ts` | `issueKeys` refuses a settled loan |
| PJ3 | `hollow-adv-6.ts` | `hollow-holder.ts` | `keyHolder` gives the last loan with the tag |
| PJ3 | `hollow-adv-9.ts` | `hollow-laterend.ts` | newest entry by the later end of the log, the last on a tie |
| PJ3 | `hollow-adv-10.ts` | `hollow-earlierend.ts` | the same, the first on a tie |
| PJ3 | `hollow-adv-17.ts` | `hollow-atleast.ts` | a repeat only for a count at least the logged one |
| PJ3 | `hollow-adv-12.ts` | `hollow-eitherend.ts` | a repeat when either end matches (it failed before, and still does) |
| PJ3 | `hollow-adv-16.ts` | `hollow-bytime.ts` | the log sorted by time (it failed before, and still does) |

The adversary's three `other.ts` are kept as they were. Each passes.

## Left alone

- **`receiptLines` prints the raw kind names on the customer's slip.** Not a fault of the measure. No task turns on it, the helper pins it, and a change to the module would mean every `plain.ts`, reference and hollow answer made again for no gain.
- **The comment at line 61, "Anyone heavier takes a large".** It is loose and not false: its first sentence says each size is for anyone under its weight, so a person of exactly 70 kg is not an adult, and the code and the helper's case agree. No task touches `jacketSize`. Left for the same reason.
- **`issue`, `issueKeys` and `takeBack` work on a settled loan with no guard.** The module is left as it is. The helper now pins this, since PJ3's ask says a call that is not a repeat "does exactly what it does now", and a file written anew that adds a guard has changed the module.
- **An answer that runs but fails `tsc --strict` would pass,** since the grader runs vitest only. The adversary did not try one and says it is a matter for the whole set. Nothing in this module's files can mend it.
- **The three kinds.** The adversary found each task to be of its kind, each ask to have one reading, and no check to test what its ask does not say. Nothing to mend.

## Another mender took over here

Written by Claude Opus 5.5 on 2026-11-22. The mender above was stopped by a usage limit after its last change and `holds.py make`, before it handed back. I changed no file but this one.

- No change. I checked each finding against the files: the twelve helper cases above are in `checks/helpers-keys.ts`, the PJ1, PJ2 and PJ3 cases above are in their checks, and no `hollow-adv-<n>.ts` is left. Each of the 23 breaching files now fails, each at an assertion, and the names of the cases it fails agree with each `where.md`.
- No change. Each `plain.ts` is still the module byte for byte, and the asks are still 148, 137 and 146 words. The module, the three `reference.ts`, the three `other.ts` and every hollow answer pass `tsc --strict`. So does each check with the helper, against its reference, with `--skipLibCheck` and the DOM lib.

# Changes to `parts` after the adversary's findings

The findings are in `/home/build/patch/parts/findings.md`. "PN1 adv-1" below means the file the adversary filed as `tasks/PN1/hollow-adv-1.ts`.

---

Another mender took over here: Claude Opus 5.5, on 2026-11-22. The mender before me was stopped by a usage limit. It left no line in this file and no change in W: every file was as the adversary left it, and `check-tasks` ended `window: none; 20 WRONG`, the adversary's 20 breaches. So every change below is mine.

## The helper, `checks/helpers-parts.ts`

One case serves all three checks, since each calls `unchanged`. Each file named below fails that case and no other, at an assertion, in its task's check.

- New case "formatPence: a part of a penny goes to the nearest penny": 12.6 is `£0.13`, 12.4 is `£0.12`, 99.5 is `£1.00`, -12.6 is `(£0.13)`. Answers PN1 adv-1, now `PN1/hollow-trunc.ts`.
- New cases "sortByBin: bins compare by character code, so capitals come before small letters" (bins `b1` and `C1`) and "reorderList: suppliers compare by character code, so capitals come before small letters" (`Pellow & Tarn` before `de Wyck`). Answers PN1 adv-2, now `PN1/hollow-locale.ts`.
- "keyOf: drops spaces wherever they are" also asks for `keyOf("eng\t-0412")`. Answers PN1 adv-3, now `PN1/hollow-tab.ts`.
- New case "describeMove: no units has no sign". Answers PN1 adv-4, now `PN1/hollow-pluszero.ts`.
- New case "mergeKit: drops a line for less than one unit", with a line of 0.5 units. Answers PN1 adv-5, now `PN1/hollow-halfunit.ts`.
- "shelve: refuses a part the store has not" also asks that the words hold `unknown part: ENG-9999`. Answers PN1 adv-6, now `PN1/hollow-wording.ts`.
- "receive: logs a delivery with no job and the unit price to the nearest penny" also has a pack of 4 at 401p, logged at 100p a unit. Answers PN2 adv-1, now `PN2/hollow-ceil.ts`.
- "receiveAll: a bad line anywhere and nothing is booked" also has a line of 1.5 packs and a line at 10.5p a pack. Answers PN2 adv-2, now `PN2/hollow-partpack.ts`.
- "lastCounted: the day of the last count, or NEVER" also books a count for day 9 after one for day 12, and the day goes back to 9. Answers PN2 adv-3, now `PN2/hollow-countday.ts`.
- New case "correct: the hold made last gives way first, whatever its day": J-1's hold is made first with day 5, J-2's second with day 3, and a short count takes from J-2. Answers PN2 adv-4, now `PN2/hollow-byday.ts`.
- New case "moveHold: to a job with a hold, which keeps its own place in the queue": three holds, J-1's moved onto J-3's, and a short count then takes from J-3. Answers PN2 adv-5, now `PN2/hollow-joinplace.ts`.
- New case "giveBack: at the price carried at the return, not the price of the issue": an issue at 100p, a delivery that lifts the average to 200p, and the return is logged at 200p. Answers PN2 adv-6, now `PN2/hollow-issueprice.ts`.
- New case "stocktake: the lines come in the order of the sheet": GAS-0002 then ENG-0412, both out. Answers PN3 adv-1, now `PN3/hollow-sorted.ts`.
- New case "slowMovers: a part that is all set aside is still on the shelf". Answers PN3 adv-2, now `PN3/hollow-setaside.ts`.
- "usage: units issued less units given back" also asks for a period with a return and no issue, which is -1. Answers PN3 adv-12, now `PN3/hollow-floor.ts`.
- New case "giveBack: takes units back from a job that was issued none". Answers PN3 adv-13, now `PN3/hollow-overreturn.ts`.
- New case "setAside: a hold that grows keeps its place in the queue": J-1, then J-2, then J-1 again, and a short count takes from J-2. Answers PN3 adv-14, now `PN3/hollow-requeue.ts`.

## PN1

- `ask.md`: "it returns `units`, a whole number of 1 or more" became "it returns `units`. `units` is always a whole number of 1 or more." Answers the adversary's "small ambiguity": the last words could be read as a rule for the unknown part only, or as a duty to refuse a bad `units`. They now say what `units` always is. To stay under 170 words, "how far short it is for a job" became "how far short a job is", and "and must change nothing" became "and change nothing". 169 words by `wc -w`.
- `where.md` names the six new hollow answers under "Write the whole file anew".

## PN2

- `ask.md`: a new sentence, "A delivery that is refused now is still refused." Answers PN2 adv-9 and adv-10. The ask said "Everything else about such a delivery stays as it is now:" and then listed effects, and that list could be read as all there is. 157 words by `wc -w`.
- `check.test.ts`: a new case "still refuses what it refuses now, and changes nothing". At a price of 0, a part the store does not have and 0, 1.5 and -1 packs each throw a `RangeError`, and the part's stock, average, day of delivery and history are as they were. Answers PN2 adv-9, now `PN2/hollow-unrefused.ts`, and adv-10, now `PN2/hollow-unknownfree.ts`. It also answers part of the finding on PN2's kind: a branch written from the outline must now know that a refusal is a `RangeError`, which only the bodies show.
- `check.test.ts`: a new case "is averaged in when its price is above 0 but under a penny a unit": packs of 4, a pack at 1p after one at 400p, and the average is 50p. Answers PN2 adv-8, now `PN2/hollow-unitprice.ts`.
- `where.md`: the new wrong answers by name, the six new hollow answers for the rest of the file, and a section "Right answers that need no body". It says how to read an `outline-1` pass. Answers the finding on PN2's kind. I applied the adversary's two replies with the bench's own applier and ran them on the mended check: the wrapper passes all 143 cases, and the branch passes only while it throws a `RangeError`.

## PN3

- `where.md` names the five new hollow answers under "Write the whole file anew".

## What I did not change

`files/parts.ts`, every `plain.ts`, `reference.ts`, `reference.edits.md` and `other.ts`, and PN3's ask. The module did not have to change, so nothing had to be copied or redone. The four near misses keep their names: `PN1/hollow-adv-9.ts`, `PN2/hollow-adv-11.ts`, `PN3/hollow-adv-7.ts` and `PN3/hollow-adv-10.ts`. Each is a wrong answer the check already failed, and the brief asks for a new name only for a breach. `holds.py make` wrote the held texts again after the two asks changed.

## Left alone, and why

- **PN2, its kind.** The finding is true: the change can be written from the outline alone, by keeping the old body under a new name. I did not change the task. The route is open in any `inside` task whose new result can be made from the old one. Here the average can be put back after the old body has run. To close it, the module would need a step in the middle of `receive` that uses the new average and that a caller cannot undo. That is a change to the module, its outline and every answer of the three tasks, and a second thing for the task to turn on. The menders of `fuel` and `tides` left the same finding on their `inside` tasks for the same reason. The branch route is narrower now, as said above. Written in place, the change needs the body, and for the reader of `region.md` the task is of its kind. `where.md` says how to read an `outline-1` pass.
- **PN1, "Both give 0 for a part the store does not have."** The adversary found that this fact is only in the bodies of `freeOf` and `heldFor`, and that no trap follows from it. An unguarded sum, a guard by `part()` or by `this.parts.has(keyOf(partNo))`, and a `try` round `known` all give the right answer. I agree, and the ask is at 169 words, so I added nothing.
- **PN3, three notes.** (1) "The store screen shows a part's history" in the ask, beside the comment in `log` that names the same screen: a weak hint, not the fact, as the adversary judged. (2) `limit: number`, not optional, passes at run time. The check runs the code and does not type-check it, as `WRITER.md` says, and no behaviour differs. (3) A route that records a sequence number in `log`: it quotes text that is not in `history`'s lines, and it is far from likely. None of them is a fault in the task.
- **The `dueForCount` case whose `partNos()` line tests nothing.** True: `partNos()` sorts on every call. But nothing a caller can see depends on the order of the store's own map of parts, so no wrong answer could fail a line there. Taking the line out would change nothing that the check catches.
- **The module.** The adversary found nothing broken and nothing that changes from run to run, and I changed nothing in it.

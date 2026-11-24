# Changes to `fuel` and its three tasks

Written by Claude Fable 5.2 on 2026-11-20, as the mender, after the adversary's findings. One line for each change, and the finding it answers. A breach is named as the adversary named it: the task, then its number in that task's list.

The module `files/fuel.ts` did not change. No ask changed. No `plain.ts`, `reference.ts`, `reference.edits.md` or `other.ts` changed, and no kept text under `holds/`.

## The shared helper, `checks/helpers-fuel.ts`

It gained 14 cases, from 73 to 87, and three of the old ones ask for more. It also gained a function of its own, `refusal`, which gives what a call throws as the name of its class and its whole message. It still exports `unchanged` only.

- New case "openLedger refuses in these words": a `RangeError` that says "the opening stock does not fit the tank". Answers PD1 breach 6.
- "openLedger gives an empty ledger that holds what it was given" now also asks for the tank itself and not a copy. Answers THE HELPER, the gap of identity.
- New case "post refuses in these words": a `RangeError` that says "day 9 is before the ledger opens", and the same with day 30 for a ledger that opens on day 31. Answers PD2 breach 6.
- New case "post puts the very entry it was given in the ledger, not a copy of it". Answers PD2 breach 3.
- New case "post puts a boat's second draw of a day on top as an entry of its own". Answers PD3 breach 5.
- New case "recordDelivery counts the room from the whole book when it is entered late": a delivery dated before a draw that was entered first. Answers PD1 breach 3.
- New case "recordDelivery returns the very entry it put in the ledger", and new case "recordDraw returns the very entry it put in the ledger". Answer PD2 breach 3.
- New case "recordDelivery refuses a day before the ledger opens", with the class, the words and an empty ledger after. Answers PD2 breach 4.
- "recordDraw refuses a day before the ledger opens" now also asks for the words. Answers THE HELPER, the gap of class or words.
- New case "drawsOf gives the ledger's own entries, not copies of them". Answers THE HELPER, the gap of identity.
- New case "settle refuses a reading dated before the ledger opens, as any entry of that day is refused". Answers PD3 breach 6.
- New case "priceOn takes the first in the list of two points for one day". Answers PD1 breach 4.
- "boatBill refuses a draw on a day with no price, and only a draw it bills" now also asks that the error's name is "Error" and that the message is those words and no more. Answers PD3 breach 7 and PD2 breach 2.
- New case "daysOfCover multiplies by the span before it divides, so a slow rate is not lost": 3 decilitres drawn, over 2 days and over 5. Answers PD2 breach 5.
- New case "formatPence writes a thousand pounds and more with no comma". Answers PD1 breach 7.
- New case "describeEntry writes an adjustment above zero with no sign". Answers PD1 breach 5.

## PD1

- `check.test.ts`: new case "puts names that begin alike in order by the whole name", with Kite, Kestrel and Kingfisher entered in that order at one volume. Answers PD1 breach 1.
- `check.test.ts`: new case "gives an empty array when toDay is before fromDay: no day is from one up to the other". Answers PD1 breach 2.
- `hollow-adv-1.ts` is now `hollow-initial.ts` (breach 1); `hollow-adv-2.ts` is now `hollow-backward.ts` (breach 2); `hollow-adv-3.ts` is now `hollow-room.ts` (breach 3); `hollow-adv-4.ts` is now `hollow-price.ts` (breach 4); `hollow-adv-5.ts` is now `hollow-plus.ts` (breach 5); `hollow-adv-6.ts` is now `hollow-words.ts` (breach 6); `hollow-adv-7.ts` is now `hollow-comma.ts` (breach 7). The check fails each at an assertion, by the one case written for it.
- The near miss kept its place under a name that says what it does: `hollow-adv-8.ts` is now `hollow-boolean.ts`. Answers "NEAR MISS KEPT".
- `where.md` names the new wrong answers, and says that the check's names must stay plain words with one capital. Answers PD1's breaches and "Two readings, harmless now".

## PD2

- `check.test.ts`: new case "puts the days in order as numbers, not as text", with draws on days 100 and 99. Answers PD2 breach 1.
- `check.test.ts`: "still refuses a day with no price, and only a day it bills" now also asks that the error's name is "Error" and that the message is those words and no more. It rests on the ask's "a day with no price is refused as it is now". Answers PD2 breach 2.
- `hollow-adv-1.ts` is now `hollow-text.ts` (breach 1); `hollow-adv-2.ts` is now `hollow-class.ts` (breach 2); `hollow-adv-3.ts` is now `hollow-copy.ts` (breach 3); `hollow-adv-4.ts` is now `hollow-opens.ts` (breach 4); `hollow-adv-5.ts` is now `hollow-rate.ts` (breach 5); `hollow-adv-6.ts` is now `hollow-words.ts` (breach 6). The check fails each at an assertion.
- The near miss: `hollow-adv-7.ts` is now `hollow-ledger.ts`. Answers "NEAR MISS KEPT".
- `where.md`: "lines 237 to 256" is now "lines 237 to 255". Answers "Small slip in a writer's file".
- `where.md` names the new wrong answers. Answers PD2's breaches.
- `where.md`: a new paragraph on the right answer that quotes only the first line of `boatBill` and keeps the old body under a new name, and that an `outline-1` pass must be read for it. Answers PD2's KIND.
- `where.md`: a new paragraph that the check and the helper must keep to one day with no price. Answers "A warning, not a fault".

## PD3

- `check.test.ts`: new case "adds to the very entry that was posted last and returns that one, not a copy or a new one". It holds the ledger's top entry before the call and asks that the call returns that same object with the volume added, and that a second call returns the entry the first call returned. Answers PD3 breaches 1 and 2.
- `check.test.ts`: new case "joins whatever the two minutes are, and the entry keeps its own": a new part timed before the entry it joins, and one timed nine hours after it. Answers PD3 breaches 3 and 4. It also fails both near misses a second time.
- `hollow-adv-1.ts` is now `hollow-copy.ts` (breach 1); `hollow-adv-2.ts` is now `hollow-swap.ts` (breach 2); `hollow-adv-3.ts` is now `hollow-later.ts` (breach 3); `hollow-adv-4.ts` is now `hollow-earliest.ts` (breach 4); `hollow-adv-5.ts` is now `hollow-post.ts` (breach 5); `hollow-adv-6.ts` is now `hollow-settle.ts` (breach 6); `hollow-adv-7.ts` is now `hollow-class.ts` (breach 7). The check fails each at an assertion.
- The two near misses: `hollow-adv-8.ts` is now `hollow-timed.ts`, `hollow-adv-9.ts` is now `hollow-hour.ts`. Two cases fail each now, where one did. Answers "NEAR MISSES KEPT".
- `where.md` names the new wrong answers. Answers PD3's breaches.
- `where.md`: a new paragraph on the answer that posts, finds the entry and looks at its neighbour, with the shape to look for in a passing try. Answers "ONE WAY ROUND THE FACT".

## What was tried after the last change

- Every filed answer was run against its check and the failing cases read: each breach fails by the case written for it, at an assertion.
- The adversary's whole screen was run again. Of its wrong answers, the ones that still pass are those it did not file because their input is outside what the module's comments allow, or because they act as the module does. The answer with the boat's name added to the refusal's words no longer passes.
- The adversary's two right answers by another route, the wrapper for PD2 and the probe for PD3, still pass.

## Left alone

- **PD2, its kind.** The finding is true: the change can be made from the outline by keeping the old body under a new name. I did not change the task. The route is open in any `inside` task whose new result can be made from the old one, so closing it here means another change for the task to turn on, and that is the run's author's to decide for all sixteen. I looked for a small clause that the old result cannot supply and found none that holds: with `drawsOf`, `priceOn` and `chargeFor` in the outline, a wrapper needs the old body only for the days covered and the refusal, and it can still call the old body for both. Written in place, the change needs the body, and for the reader of `region.md` the task is of its kind. `where.md` says how to read an `outline-1` pass.
- **PD3, the way round the fact.** The adversary saw no mend that keeps the task, and I see none either. After the call the ledger is as the reference leaves it, so no check of what the module returns and leaves behind can fail the probe. It could be closed only by giving `post` a second effect that a probe cannot undo. That changes the module, its outline and every answer of the three tasks, and it would be a second thing for the task to turn on. `where.md` says what shape to look for in a passing `region` try.
- **PD3 breach 2, the ask's words.** The adversary asked that the ask change if putting a new entry in the old one's place is a fair reading. I judge it is not: "add the new volume to that entry and return that entry" names one entry twice, the one that was posted last. The ask is as it was and the check now tests it.
- **PD1, "name order, A before B".** The ask does not say how capitals compare. Both readings pass, since the check's names are plain words with one capital. A rule for capitals in the ask would be a clause the task does not turn on. `where.md` says to keep new cases to such names.
- **The wrong answers the adversary did not file.** `post` refusing a minute outside the day, `openLedger` refusing stock that is not whole, `recordDelivery` testing the room before the volume, `clock` wrapping at 24 hours, `recentLines` on a count below zero, `mustBeVolume` taking Infinity, `chargeFor` on a volume below zero, `dipVolume` and `formatVolume` on a part number; for PD1 a trimmed name, sums in a plain object, and draws of 0 or below dropped; for PD2 the yard's own bill. The adversary did not file them: it judged each to differ from the module only on input the module's comments do not allow. I added no case for any of them. Two more that it left out as being of a sort already filed are now pinned, as said above: `drawsOf` giving copies and `openLedger` keeping a copy of the tank. `drawsOf` matching names without regard to capitals still passes.
- **Each module-wide breach is filed once,** in the task where the adversary filed it. The helper is shared, so the case that fails it runs in all three checks.

---

**Another mender took over here.** Written by Claude Opus 5.5 on 2026-11-22. The mender above was stopped by a usage limit after it wrote this file and ran `holds.py make`, and before it handed back. Everything above was left as it was.

## What I found done

- I ran `check-tasks` and `holds.py check` first. Both ended `all as they must be`.
- I went through every finding in `findings.md` against the files. Each one is answered by a line above, by a change or by a reason to leave it. I found no finding left open.
- I checked the lines above against the files. All 24 `hollow-adv-<n>.ts` are gone, and each new name holds the adversary's file byte for byte. The three checks and the helper only gained lines. `files/fuel.ts`, the three asks, `reference.ts`, `reference.edits.md` and `other.ts` are unchanged, and each `plain.ts` is the module byte for byte.
- I ran the adversary's whole screen again, from my own copy of its scripts, against the mended checks. 41 of its answers still pass: 16 in PD1, 13 in PD2, 12 in PD3. They are the ones it listed as passed and not filed, less the three that now fail (`drawsOf` giving copies, `openLedger` keeping a copy of the tank, the refusal's words with the boat added); the two it found act as the module does; and in PD1 the tie order without regard to capitals, which it called a fair reading of the ask. Every one it filed now fails. The two right answers by another route, the PD2 wrapper and the PD3 probe, still pass.

## My changes

- None to the module, the tasks, the checks, the helper or `where.md`. The only change is this section of `CHANGES.md`. It answers no finding.

## Left alone, and my reasons

- **PD2, its kind.** The mender above left it, and I agree. A wrapper can call the old body with inputs of its own, and catch and throw again what the old body throws. So a change to the range or to the refusal can be wrapped as well, and I found no new ask that closes the route without a change to the module. `where.md` says how to read an `outline-1` pass.
- **PD3, the way round the fact.** I agree with both the adversary and the mender above: after the call the ledger is as the reference leaves it, so no check can tell. `where.md` says what to look for.
- **PD3 breach 2, the ask's words; PD1, "name order, A before B"; the adversary's wrong answers it did not file.** I agree with the reasons given above.

## The last lines, after the last change

- `tsc --strict` on `files/fuel.ts`: no output, exit 0. The same on the three `reference.ts` and the three `other.ts`, copied to my scratch directory.
- `holds.py make W`: `3 tasks: name, outline, region, whole written for each`. `holds.py check W`: `all as they must be`.
- `box.py check-tasks W --window none`: `window: none; all as they must be`.

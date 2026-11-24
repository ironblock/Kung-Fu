# Changes to `stoppages` and its three tasks

The mender before me was stopped by a usage limit. It left no `CHANGES.md`, and I found no change of its in W: every file was as the writer and the adversary had left it on 2026-11-20. When I took over, `check-tasks` ended `window: none; 45 WRONG`, and the 45 were the adversary's breaches. `holds.py check` ended `all as they must be`. No finding was answered.

**Another mender took over here.** Written by Claude Opus 5.5 on 2026-11-22. There is one line for each change, with the finding it answers. A breach is named by its task, the adversary's number for it and the adversary's key, as in "PL1 adv-4, throughby-loose". The thirteen helper breaches have the same key in every task.

The module `files/stoppages.ts` did not change, so no `plain.ts` changed, and nor did PL1's or PL3's `reference.ts`, `reference.edits.md` or `other.ts`.

## The regression helper, `checks/helpers-stoppages.ts`

It has 94 cases, where it had 81. Every case runs in all three checks, except the ones a check skips.

- New case "issue: a dated notice is taken whatever its first day, so long as it covers a day": notices from day -5 to 3, from -10 to -3, and from -1 to 0 are taken, and one from -5 to -5 is refused. Answers adv-9 (PL1, PL3) and adv-6 (PL2), issue-neg.
- "issue: a refused reissue leaves the old notice where it was" now also holds a restriction, and reissues it with times that let nothing through. It must be refused and stay where it was. Answers adv-7 (PL1, PL3) and adv-4 (PL2), issue-order.
- New case "issue: a notice issued again for another stretch still replaces the old one": one notice on the register, so its place is the same before and after PL2's change. Answers adv-8 (PL1, PL3) and adv-5 (PL2), issue-stretch.
- New case "prune: a notice lifted before it began is kept until its first day". The notice is made by `lift`, as the module makes it. Answers adv-12 (PL1, PL3) and adv-9 (PL2), prune-nil.
- New case "prune: a notice whose days are all below zero is over by day 0". Answers adv-15 (PL1, PL3) and adv-12 (PL2), over-sign.
- New case "inForce: a notice whose days are all below zero". Answers adv-14 (PL1, PL3) and adv-11 (PL2), inforce-sign.
- New case "overruled: a notice lifted before it began is weighed by its first day and its end". It pins what the module does now; see "Left alone". Answers adv-13 (PL1, PL3) and adv-10 (PL2), sharesday-nil.
- New case "tally: a notice that ended before day 0 is not open-ended". Answers adv-16 (PL1, PL3) and adv-13 (PL2), tally-sign.
- New case "routeFurlongs: counts each stretch, whether or not the route joins up". Answers adv-10 (PL1, PL3) and adv-7 (PL2), furlongs-strict.
- New case "routeLocks: counts each stretch, whether or not the route joins up". Answers adv-11 (PL1, PL3) and adv-8 (PL2), locks-strict.
- "describe: a dated closure" now also reads a notice from day -10 to -3. PL3 skips this case, as before. It answers, for PL1 and PL2, the gap that PL3 adv-3 (sign) showed.
- New case "describe: a restriction's times from five past midnight to the end of the day, from day 0". Its notices are open-ended, so PL3's change leaves their lines alone and PL3 does not skip it. It reads 00:05, 24:00, 00:00, 01:01 and "from day 0". Answers PL3 adv-1 (clock-wrap) and adv-2 (day0) in all three checks.
- New case "throughBy: a route whose stretches do not meet is an error, though nothing is shut". Answers adv-4 (PL1, PL3) and adv-1 (PL2), throughby-loose.
- New case "wayRound: a route whose stretches do not meet is an error, though it is open". Answers adv-5 (PL1, PL3) and adv-2 (PL2), wayround-order.
- New case "wayRound: a shut route that ends where it starts is gone round by staying put". It also asks `extraMinutes` and `daysLost` on that route. It pins what the module does now; see "Left alone". Answers adv-6 (PL1, PL3) and adv-3 (PL2), wayround-ring.

## PL1 (beside)

- `ask.md`: "It must not change the register or the route." became "It must not change the register or the route, and each call gives back a new list of its own." The check's new case on a shared list now rests on the ask's own words. 146 words, the title included. Answers PL1 adv-3, shared-list.
- `check.test.ts`: new case "changes neither a notice that is over by fromDay nor a route out of order". It has a notice that is over by `fromDay`, and a route from Dunmere by s4, s2 and s1, which is not in sorted order. Answers PL1 adv-1 (prune-first) and adv-2 (sort-route).
- `check.test.ts`: new case "gives each call a new list of its own, which a later call leaves as it was". It reads the first answer after a second call. Answers PL1 adv-3, shared-list.
- `check.test.ts` imports the type `Route`, for the new case.
- Renamed, each file byte for byte as the adversary wrote it: `hollow-adv-1.ts` is now `hollow-prunes.ts`, `-2` is `hollow-sorts.ts`, `-3` is `hollow-sharedlist.ts`, `-4` is `hollow-throughbroken.ts`, `-5` is `hollow-openfirst.ts`, `-6` is `hollow-ringnull.ts`, `-7` is `hollow-timeslate.ts`, `-8` is `hollow-samestretch.ts`, `-9` is `hollow-negstart.ts`, `-10` is `hollow-furlongslegs.ts`, `-11` is `hollow-lockslegs.ts`, `-12` is `hollow-prunenoday.ts`, `-13` is `hollow-sharesnoday.ts`, `-14` is `hollow-inforcesign.ts`, `-15` is `hollow-oversign.ts` and `-16` is `hollow-tallysign.ts`. The check fails each at an assertion, by the case written for it. Answers PL1 adv-1 to adv-16.
- The near misses, byte for byte: `hollow-adv-17.ts` is now `hollow-backwards.ts` and `-18` is `hollow-jumps.ts`. Answers the kept near misses.
- `where.md`: new paragraphs that name every new hollow answer and the case that fails it. Answers PL1's breaches.

## PL2 (inside): the task is changed

The adversary showed that the old change to `lift` could be written from the outline alone: a guard put straight after the first line of `lift`, which takes the notice off and returns true, with the old body left to run after it. It passed all 85 cases and needed nothing of the body. `lift` is ten lines, and everything it does can be seen from outside it, so I found no change to it that a guard or a call to the old body could not make. The task now turns on `issue`. A reissued notice takes the old notice's place on the register, and does not go on top. The change goes after the two tests that refuse a notice, so a guard put before the body must guess both refusals and the class of error. Each line below answers PL2's "Kind: it fails the brief's test".

- `ask.md` rewritten, with the title "Keep a reissued notice in its place on the register". It asks that a reissued notice take the old notice's place, whatever its stretch, and that every other notice keep its place. A notice under a new reference still goes on top, and a notice refused now is still refused in the same way, with the register left as it was. 154 words, the title included.
- `reference.ts` and `reference.edits.md`: one edit inside the lines of `issue`. It changes the comment above the block that finds the old notice, replaces `register.notices.splice(old, 1);` with `register.notices[old] = notice;`, and adds `return;`.
- `check.test.ts` rewritten for the new ask, with 7 cases. They put the reissue in the old place, at the bottom, in the middle and on top. They show that a correction does not overrule a newer restriction, that the place is taken whatever the stretch, and that a new reference still goes on top. They test that five refused reissues are refused with a `RangeError` and leave the register as it was, and that reissues taken now are still taken. It skips one case of the helper, "issue: a notice issued again under its reference replaces the old one and goes on top", and no other.
- `other.ts`: a right answer of my own. It puts a new list on the register with `map`, where the reference sets the old place. The adversary's `other.ts` was for `lift`, and is gone with the old task.
- New `hollow-unchecked.ts`: the guard straight after the first line of `issue`, before the refusals. A reader of the outline alone is likely to write this. The check fails it at the case on refused reissues.
- New `hollow-bottom.ts`: a reissue goes to the bottom of the register. The check fails it at the case for a notice in the middle.
- `hollow-lost.ts` made again on the new reference, with the wrong idea it had: `cruisingMinutes` adds up the legs, each rounded up.
- `hollow-before.ts` and `hollow-false.ts` are deleted. Each was a wrong way of changing `lift`, and the new ask does not touch `lift`.
- The adversary's thirteen helper breaches made again on the new reference, each with the change to one other function it had, and renamed as in PL1: `hollow-adv-1.ts` is now `hollow-throughbroken.ts`, `-2` is `hollow-openfirst.ts`, `-3` is `hollow-ringnull.ts`, `-5` is `hollow-samestretch.ts`, `-6` is `hollow-negstart.ts`, `-7` is `hollow-furlongslegs.ts`, `-8` is `hollow-lockslegs.ts`, `-9` is `hollow-prunenoday.ts`, `-10` is `hollow-sharesnoday.ts`, `-11` is `hollow-inforcesign.ts`, `-12` is `hollow-oversign.ts` and `-13` is `hollow-tallysign.ts`. `-4` is now `hollow-timeslate.ts`. The new `issue` has no `splice` to move, so its wrong idea is put in the new terms: the old notice is replaced before the restriction's times are tested. The check fails each at an assertion, by the case written for it. Answers PL2 adv-1 to adv-13.
- The adversary's near misses `hollow-adv-14.ts` (swap-remove) and `hollow-adv-15.ts` (newest-only) are deleted. Each was a wrong way of taking a lifted notice off the register.
- `where.md` rewritten for the new task. It names every hollow answer. It has a paragraph on the two right answers that still need no body, and on how to read an `outline-1` pass (see "Left alone").

## PL3 (leans)

- `check.test.ts`: the case "a dated restriction gets the same addition" now also reads `restriction("S-222", "s4", 0, 2, 5, 1440)` as "S-222 Withy Arm: passage 00:05 to 24:00 from day 0, last day 1 (low water)". Answers PL3 adv-1 (clock-wrap) and adv-2 (day0).
- `check.test.ts`: new case "a notice whose days are all below zero still has an end date": `closure("S-9", "s5", -10, -3, "breach")` reads "... closed from day -10, last day -4 (breach)". It rests on the ask's "every notice that has an end date". Answers PL3 adv-3, sign.
- `check.test.ts`: the case "the day it gives is the last on which the notice is in force" also asks about those two notices. Answers PL3 adv-1 to adv-3.
- Renamed, each file byte for byte as the adversary wrote it: `hollow-adv-1.ts` is now `hollow-clockwrap.ts`, `-2` is `hollow-fromstart.ts`, `-3` is `hollow-negend.ts`, and `-4` to `-16` have the same names as in PL1. The check fails each at an assertion, by the case written for it. Answers PL3 adv-1 to adv-16.
- The near misses, byte for byte: `hollow-adv-17.ts` is now `hollow-changesnotice.ts` and `-18` is `hollow-oneday.ts`. Answers the kept near misses.
- `where.md`: the new wrong answers are named. "The check fails it in its first five cases" is now "six", since the new case also fails `hollow-guess.ts`. Answers PL3's breaches.
- `where.md`: a new paragraph, "A pass that does not show the fact". It names the run-time question to `inForce` and the old body kept under a new name, and asks that each `region` and `outline-1` pass be read and those answers counted beside the score. Answers PL3's "The fact can be sidestepped" and "The outline alone can also carry the edit".

## The held texts

- `holds.py make W` was run again after the last change to an ask. PL1's and PL2's texts that hold the ask changed with their asks. PL2's region is now lines 123 to 137, the lines of `issue`. PL1's region is still `routeOpen`'s lines, and PL3's is still `describe`'s.

## What was tried after the last change

- Each filed answer in the three tasks was run against its check by `bench/box.py`'s own grader, and its failing cases read. Each breach fails by the case written for it, and each near miss by the cases `where.md` names.
- The adversary's whole bank of wrong answers was run again from my own copy of its scripts: every one of its changes to another function, in all three tasks, and its own wrong answers for PL1 and PL3. Sixteen still pass. Fifteen are the five it set aside, now in each of the three tasks: `farEnd` on a stretch whose two ends are one junction, `allowance` with a count below zero, `throughBy` on an empty route that sets off at 1440, `legsOf` on an empty route whose start is not on the network, and `daysLost` on a broken route with no nights. The sixteenth is PL3's `nil-bare`, which it judged not wrong (see "Left alone"). One, issue-order, could not be put on PL2's new reference as it was written; `hollow-timeslate.ts` is its wrong idea in the new terms.
- On the new PL2, the answers a reader of the outline alone could write, each quoting only the first line of `issue`. A guard with no refusals fails, and so does a guard that tests only the days, one that reads `to` as the last day, and one that throws a plain `Error`. A guard that guesses both refusals and the `RangeError` exactly passes. Two answers that keep the old body under a new name pass.
- On the new PL2, six more wrong answers of my own fail: no `return` after the new notice is put in place, the old notice found by its stretch, a copy put in place, both notices kept, the new one put just under the old place, and only the top notice replaced. Three more right answers pass: `splice(old, 1, notice)`, two splices, and a new list made from two slices.

## Left alone, and my reasons

- **PL2: two right answers still need no body.** (1) Keep the old body under a new name, call it, and move the notice it put on top back to where the old one stood. (2) Keep the old body under a new name, and call it on an empty register only for its refusals. Both pass, and neither can be closed while the old body can be called on a register of the caller's making. That holds for any `inside` change that can be made around a call to the old body. The `fuel`, `tides`, `pumpout` and `survey` menders said the same, and left this road to the run's author for all sixteen `inside` tasks. The road that needed nothing at all, a guard before the body, is closed unless the reader guesses three facts of the body. `where.md` says how to read an `outline-1` pass.
- **PL3: the `inForce` sidestep.** The adversary called this a matter for whoever owns the kinds, and I agree. The answer is right, and no check should fail it. Closing the road would need another fact for the task to turn on, one that no exported function will answer at run time. `where.md` now says to read each pass and count the ones that take this road.
- **PL3: a notice whose `to` equals its `from`.** The ask has two readings for it: "every notice that has an end date" gets a last day, but such a notice is in force on no day. The check does not test it, so both readings pass. The ask cannot name the case without giving away the fact, as the writer said. Left as it is.
- **The five wrong answers the adversary set aside.** Each differs from the module only on an input no caller gives, and there is no right answer to pin. I added no case for them.
- **The module.** The adversary found it sound. It named three odd things: `wayRound` stays put for a shut route that ends where it starts, `overruled` lets a notice that covers no day overrule older ones, and `reopens` has an arm of `Math.max` that cannot win. No task turns on them. Changing the module would mean every `plain.ts`, reference and hollow answer made again, and the brief says to mend what the findings show and nothing else. The helper now pins the first two as the module does them, since the adversary showed that changes to them got through.
- **PL1's and PL3's kinds.** The adversary found PL1 a `beside` task and PL3 a `leans` task by the brief's letter. Nothing to mend there, beyond the note in PL3's `where.md`.
- **The old PL2's two readings** (a notice with `to` equal to `from`, lifted on that day). They went with the old task.

## The last lines, after the last change

- `tsc --strict` on `files/stoppages.ts`: no output, exit 0. The same on the three `reference.ts`, the three `other.ts`, the three `plain.ts` and all 58 hollow answers, each copied to my scratch directory. Each check and the helper also type-check against their task's reference.
- `holds.py make W`: `3 tasks: name, outline, region, whole written for each`. `holds.py check W`: `all as they must be`.
- `box.py check-tasks W --window none`: `window: none; all as they must be`. That is 67 lines, all `ok`.

## changes

All of it is in /home/build/patch/stoppages/set/CHANGES.md. Nothing was committed, and nothing under /home/user/Kung-Fu was edited.

The earlier mender left no CHANGES.md and made no change in W. When I took over, check-tasks ended "45 WRONG" and holds check ended "all as they must be". I created CHANGES.md: a note on that, then the line "Another mender took over here.", then my lines.

The module did not change, so no plain.ts changed. PL1's and PL3's reference.ts, reference.edits.md and other.ts did not change either.

Helper (checks/helpers-stoppages.ts), now 94 cases where it had 81:
- 12 new cases and 2 extended ones close the 13 helper breaches:
  - issue-neg: a dated notice may start below day 0.
  - issue-order: a reissue refused for its times is extended into the existing refused-reissue case.
  - issue-stretch: a reissue for another stretch.
  - prune-nil: prune keeps a notice lifted before it began.
  - over-sign: prune on a notice whose days are all below zero.
  - inforce-sign: inForce on such a notice.
  - sharesday-nil: overruled with a notice lifted before it began.
  - tally-sign: tally on a notice that ended before day 0.
  - furlongs-strict and locks-strict: routeFurlongs and routeLocks on a route that does not join up.
  - throughby-loose: throughBy on a route that does not join up.
  - wayround-order: wayRound on a broken route that is open.
  - wayround-ring: wayRound on a shut route that ends where it starts, with extraMinutes and daysLost.
- "describe: a dated closure" now also reads a notice dated -10 to -3. PL3 skips this case, so it covers PL1 and PL2.
- New case: open-ended restrictions from day 0 with the times 00:05, 24:00, 00:00 and 01:01. PL3 does not skip it, so it answers PL3 adv-1 and adv-2 in every task.

PL1 (beside):
- ask.md gains "and each call gives back a new list of its own" (146 words), so the new case on a shared list rests on the ask's own words (adv-3).
- check.test.ts:
  - New case: a notice already over by fromDay, and a route out of sorted order (adv-1, adv-2).
  - New case: the first answer is read after a second call (adv-3).
- adv-1..16 renamed byte for byte: hollow-prunes, -sorts, -sharedlist, -throughbroken, -openfirst, -ringnull, -timeslate, -samestretch, -negstart, -furlongslegs, -lockslegs, -prunenoday, -sharesnoday, -inforcesign, -oversign, -tallysign.
- Near misses adv-17 and adv-18 are now hollow-backwards and hollow-jumps.
- where.md names each new hollow answer.

PL2 (inside), the task is changed (answers "Kind: it fails the brief's test"):
- `lift` is ten lines, and everything it does can be seen from outside it, so I found no change to it that a guard before the body could not make. The task now turns on `issue`: a reissued notice takes the old notice's place on the register instead of going on top.
- New ask.md (154 words). reference.ts and reference.edits.md: one edit inside issue's lines, after the two refusals.
- New check.test.ts with 7 cases. It skips only "issue: a notice issued again under its reference replaces the old one and goes on top".
- New other.ts: builds a new list with map.
- New hollow-unchecked: the outline-only guard put before the refusals. New hollow-bottom: a reissue goes to the bottom.
- hollow-lost made again on the new reference.
- hollow-before and hollow-false deleted: both were wrong ways of changing lift.
- The adversary's 13 breaches made again on the new reference, with the same names as PL1. issue-order is now hollow-timeslate, put in the new terms.
- Near misses adv-14 and adv-15 (lift) deleted.
- where.md rewritten.

PL3 (leans):
- check.test.ts:
  - The dated S-222 restriction now reads "00:05 to 24:00 from day 0, last day 1" (adv-1, adv-2).
  - New case: a notice from -10 to -3 reads "last day -4" (adv-3).
  - The inForce loop also asks about those two notices.
- adv-1..3 are now hollow-clockwrap, -fromstart and -negend. adv-4..16 have the same names as in PL1. adv-17 and adv-18 are now hollow-changesnotice and -oneday.
- where.md names the new hollow answers ("first six cases") and has a new paragraph, "A pass that does not show the fact", on the inForce sidestep and the wrapper.

Checks I ran after the last change:
- holds.py make was run again after the last ask change. PL2's region is now lines 123 to 137, the lines of `issue`.
- Each hollow fails by the case written for it, at an assertion.
- I re-ran the adversary's whole bank of wrong answers. Sixteen still pass: its five set-aside answers in each task, and PL3's nil-bare.
- On the new PL2:
  - Fail: a guard with no refusals, one that tests only the days, one that reads `to` as the last day, and one that throws a plain Error.
  - Pass: a guard that guesses both refusals and RangeError exactly, and two wrappers that keep the old body.
  - Six more wrong answers of mine fail, and three more right ones pass.

## tsc_last_line

no output, exit 0 (the same for the 3 references, 3 other.ts, 3 plain.ts and 58 hollow files; each check and the helper also type-check against their reference)

## holds_check_last_line

all as they must be

## check_tasks_last_line

window: none; all as they must be

## left_alone

1. PL2, two right answers still need no body. Both keep the old issue under a new name. One calls it and moves the notice back to the old place. The other calls it on an empty register only for its refusals. Both pass. That road is open in any inside change that can be made around a call to the old body. The fuel, tides, pumpout and survey menders left it to the run's author for all sixteen inside tasks, and so do I. The road that needed nothing at all, a guard before the body, is now closed unless the reader guesses three facts of the body. where.md says how to read an outline-1 pass.

2. PL3, the inForce sidestep (asking inForce at run time which day is the last) and the renamed-describe wrapper. The adversary called this a matter for whoever owns the kinds, and I agree. The answer is right, and no check should fail it. Closing the road needs another fact for the task to turn on. where.md now asks that such passes be counted beside the score.

3. PL3, a notice whose `to` equals its `from` (the adversary's nil-bare). The ask has two readings for it. The check is silent, so both readings pass. The ask cannot name the case without giving the fact away.

4. The five wrong answers the adversary set aside: farEnd on a stretch whose two ends are one junction, allowance with a negative count, throughBy on an empty route that sets off at 1440, legsOf on an empty route whose start is not on the network, and daysLost on a broken route with no nights. Each differs from the module only on an input no caller gives, and there is no right answer to pin.

5. The module's three oddities: wayRound stays put on a shut out-and-back route, overruled lets a notice that covers no day overrule older ones, and reopens has an arm of Math.max that can never win. No task turns on them, and changing the module would mean remaking every plain, reference and hollow file. The brief says to mend only what the findings show. The helper now pins the first two as the module does them.

6. PL1's and PL3's kinds. The adversary found them of their kind, so there was nothing to mend beyond the note in PL3's where.md.

7. The old PL2's two readings (a lifted notice whose `to` equals its `from`). They went away with the old task.

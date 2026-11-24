Module `stoppages` and its three tasks are written in /home/build/patch/stoppages/set, and every command in the brief ends as it must. Nothing was committed and nothing under /home/user/Kung-Fu was edited.

## The module

/home/build/patch/stoppages/set/files/stoppages.ts is 441 lines (`wc -l`), against a target of about 450. It has no import, no clock and no random number, uses four spaces, has no line over 120 columns, and the outline shows no first line cut. It was treated as a smaller module, so it has no class.

**Exports**
- Types: `NoticeKind`, `Cause`, `Stretch`, `Network`, `Notice`, `Register`, `Route`, `Leg`, `Tally`.
- Constants: `OPEN_ENDED`, `NO_BLOCK`, `NOT_TODAY` (all -1).
- Functions (27): `newRegister`, `issue`, `lift`, `prune`, `inForce`, `noticesFor`, `noticeOn`, `overruled`, `isClosed`, `passage`, `canPass`, `firstBlock`, `routeOpen`, `noticesAlong`, `reopens`, `nextOpenDay`, `tally`, `legsOf`, `endOf`, `routeFurlongs`, `routeLocks`, `cruisingMinutes`, `formatDistance`, `describe`, `throughBy`, `wayRound`, `extraMinutes`, `daysLost`, `allowance`.
- Not exported: `clock`, `stretchOf`, `farEnd`, `legMinutes`, `over`, `sharesDay`, five number constants and the table `CAUSE_WORDS`.

**Conventions a guess would get wrong, and where each shows**

All but the last show only in a body or in a comment inside one.

1. A notice's `to` is the day the stretch is open again, not its last day. It shows in `inForce` (lines 163-164), `over` (110), `issue` (124), `lift` (144-146) and `sharesDay` (116). The interface gives `to: number` with no comment.
2. The register is kept newest first, and only the newest notice in force for a stretch counts. It shows in `issue` (`unshift`, lines 135-136), `noticeOn` and `isClosed`.
3. A reissued reference replaces the old notice and goes on top (`issue`).
4. `issue`, `lift` and `prune` change their argument. `issue` keeps the caller's object, `lift` writes its `to`, and `prune` splices in place.
5. A lift before the first day leaves the notice on the register with `to` equal to `from` (`lift`).
6. A passage window includes its first minute and not its last, and a boat that is in before a stretch shuts is let through (`canPass`, `throughBy`). Arriving at minute 1440 still counts as within the day.
7. Lengths are furlongs. Time is 18 minutes a mile and 12 a lock, rounded up for each leg in `legsOf` and once for the whole route in `cruisingMinutes`.
8. The way round is the quickest by minutes, not furlongs. An open route is returned as a copy, and none is `null` (`wayRound`). `extraMinutes` never goes below zero.
9. A hire of n nights has n cruising days (`daysLost`).
10. Money is pence. The first lost day earns nothing, then 60 percent of the day rate a day, rounded down (`allowance`).
11. -1 stands for "none" in three places. This one is visible in the constants' first lines.

## The helper

/home/build/patch/stoppages/set/checks/helpers-stoppages.ts exports `unchanged(mod, skip)` with 81 named cases, at least two for every function. A skip name that matches no case throws. I ran 64 one-change copies of the module against it and all 64 failed.

## The tasks

| Task | Kind | Title | What it turns on |
| --- | --- | --- | --- |
| PL1 | beside | "List the days a route is shut" | Adds `closedDays(register, route, fromDay, toDay): number[]`. It needs only `Register`, `Route` and `routeOpen` from the outline; the ask says `toDay` is not looked at. The reference edit quotes the first line of `tally`. |
| PL2 | inside | "Take a notice off the register when it is lifted before it starts" | `lift` removes a notice lifted on or before its first day and returns true. It needs the body of `lift` (lines 139-148). The check skips the two helper cases that pin the old behaviour. |
| PL3 | leans | "Say on the board when a stoppage ends" | `describe` adds `, last day N` for a dated notice. N is `to - 1`, because of what `inForce` does. The ask says only "the last day on which the notice is still in force". The natural wrong guess prints `notice.to`. The check skips the two helper cases for dated lines. |

Hollow answers:
- PL1: `hollow-inclusive.ts`, `hollow-anyclosure.ts`, `hollow-lost.ts` (`prune`).
- PL2: `hollow-before.ts`, `hollow-false.ts`, `hollow-lost.ts` (`cruisingMinutes`).
- PL3: `hollow-guess.ts`, `hollow-always.ts`, `hollow-lost.ts` (`canPass`).

Each `hollow-lost.ts` fails only through `unchanged` cases. A right answer written another way passed each check: I tried one for each task.

The asks are 127, 117 and 111 words.

## Last line of each command

- `tsc` on the module: no output, exit 0. The same for all three `reference.ts` files and all nine hollow files, each copied to a temporary `.ts` file.
- `holds.py make`: `3 tasks: name, outline, region, whole written for each`
- `holds.py check`: `all as they must be`
- `box.py check-tasks W --window none`: `window: none; all as they must be`
- `holds.py sizes`: `PL3   leans          441       118      4300      4905     15463   describe`

Held text sizes in bytes: name 118, outline 4300, whole 15463; region 4499 (PL1), 4785 (PL2), 4905 (PL3).

No rule of the brief had to be broken.

## Unsure

1. PL3's wrong guess is my judgement. I believe a reader who sees only `to: number` will take `to` as the last day, but no fresh reader has tried it.
2. A reader of PL3 with only the region can still be right without knowing the fact, by asking `inForce` at run time which day is the last. That answer passes, and I think it should. It could lift the region arm's score on this task.
3. `reopens` steps with `at = Math.max(notice.to, at + 1)` where `at = notice.to` would do. I added the guard because a copy of the module with an inclusive `inForce` otherwise loops forever and hangs vitest. A subject's own endless loop would still hang the grader until its 600-second limit.
4. The helper pins two things tighter than a spec would: which of two equally quick ways `wayRound` returns, and that `prune` keeps the same array. No task touches either.
5. `wayRound` on a blocked route that ends where it starts returns a route with no stretches. That is odd, and the helper does not pin it.
6. PL3's check does not test a notice whose `from` equals `to`, because the ask could not mention that case without giving the fact away. PL2's check likewise leaves out a hand-built notice with `from` equal to `to`.
7. The ask for PL3 shows an example line with "last day 131" for S-104, and the check uses an S-104 that ends on 132. The ask gives no `to`, so they do not conflict, but someone sorting failures may trip on it.
8. PL1's ask puts `routeOpen` in a code span, so its region text is the outline plus that function's lines. The region arm is not sent `beside` tasks; this matters only to the ceiling.
9. The stretch and junction names in the helper (Hollin Flight, Marrow Cut, Tolland Level, Withy Arm, Pennel Loop, Garth Branch; Arlow, Bexby, Cawdle, Dunmere, Estwick) are invented as far as I know. I did not check them against a gazetteer.
10. The script that writes the three task directories from the module is SCRATCH/stoppages/build.py, outside W. Run it and then `holds.py make` again if the module changes.
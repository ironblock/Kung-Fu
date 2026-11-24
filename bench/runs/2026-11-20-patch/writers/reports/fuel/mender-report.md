## changes

The earlier mender had already finished all the mending before the usage limit stopped it. I made no change to the module, the asks, the checks, the helper, the hollow answers or any where.md. My only change is a new section at the end of /home/build/patch/fuel/set/CHANGES.md. It starts with a line that says another mender took over, and the earlier lines are kept as they were. That section answers no finding.

How I worked out what was done:
- First runs: check-tasks ended "window: none; all as they must be" and holds.py check ended "all as they must be".
- I checked every finding in /home/build/patch/fuel/findings.md against the files. Each one is answered by the earlier CHANGES.md, either by a change or by a reason for leaving it. None is still open.
- PD1 breaches 1-7, PD2 breaches 1-6 and PD3 breaches 1-7: each has its case in the check or in checks/helpers-fuel.ts.
- All 24 hollow-adv files are renamed. Each new file matches the adversary's original byte for byte. I compared them with the earlier mender's snapshot of the files before it started.
- The checks and the helper only gained lines. The module, the asks, reference.ts, reference.edits.md and other.ts are unchanged, and each plain.ts is the module byte for byte.
- The where.md slip ("237 to 256" is now "237 to 255") is fixed, and the where.md notes for the PD2 wrapper and the PD3 probe are there.
- I re-ran the adversary's whole screen from my own copy in SCRATCH/mend-fuel-2/. Every answer it filed now fails. 41 answers still pass (16 in PD1, 13 in PD2, 12 in PD3). They are the ones it left unfiled on purpose, minus three that now fail (drawsOf giving copies, openLedger keeping a copy of the tank, the boat's name added to the refusal's words). The rest are its two answers that act as the module does, and in PD1 the tie order that ignores capitals, which it called a fair reading of the ask. Its two right answers by another route, the PD2 wrapper and the PD3 probe, still pass.
- tsc --strict passes on the three reference.ts and the three other.ts, copied to my scratch directory.

## tsc_last_line

(no output; exit 0)

## holds_check_last_line

all as they must be

## check_tasks_last_line

window: none; all as they must be

## left_alone

These were all left alone by the earlier mender, and I agree with each.

1. PD2 kind: the change can be written from the outline alone, by keeping the old body under a new name and wrapping it. The finding is true, but the route can't be closed without changing the module. A wrapper can call the old body with inputs of its own, and catch and rethrow what the old body throws. So even a change to the day range or to the refusal can be wrapped, and I found no new ask that closes the route. Written in place, the change needs the body, so for the region reader the task is of its kind. Closing the route for all sixteen inside tasks is for the run's author to decide. PD2/where.md tells the sorter to read an outline-1 pass for this shape.

2. PD3 way round the fact: an answer can post the entry, find it, look at its neighbour and splice it out. After the call the ledger is exactly as the reference leaves it, so no check of what the module returns and leaves behind can tell the two apart. Closing it would mean changing post in the module, and that would give the task a second thing to turn on. PD3/where.md says what shape to look for and to count those passes beside the score.

3. PD3 breach 2, the ask's words: "add the new volume to that entry and return that entry" names one entry twice, so replacing it with a new object is not a fair reading. The ask stays as it is, and the new case now tests it.

4. PD1 "name order, A before B": the ask doesn't say how capitals compare. Both readings pass, because the check's names are plain words with one capital each. A rule for capitals would add a clause the task doesn't turn on. PD1/where.md says to keep new cases to such names.

5. The wrong answers the adversary chose not to file: post refusing a minute outside the day, openLedger refusing stock that is not whole, recordDelivery testing the room before the volume, clock wrapping at 24 hours, recentLines on a count below zero, mustBeVolume taking Infinity, chargeFor on a volume below zero, dipVolume and formatVolume on a part number, drawsOf ignoring capitals; for PD1 a trimmed name, sums kept in a plain object, and draws of 0 or below dropped; for PD2 the yard's own bill. Each differs from the module only on input its comments don't allow. Adding cases for them would test past what the module promises, so no case was added. Two it left out as being of a sort already filed are now pinned in the helper: drawsOf giving copies and openLedger keeping a copy of the tank.

## changes

I wrote /home/build/patch/moorings/set/CHANGES.md. The mender before me had left no lines in it, so the file opens with "**Another mender took over here.**" (Claude Opus 5.5, 2026-11-22). It had left changes in W, though. I found them by comparing W with the copy of W it saved before it began, in SCRATCH/mend-moorings/before. I ran each renamed file on the old checks and on the new ones: each of the 14 breaches passed before and fails now, at the case meant for it. Every renamed file is the adversary's, byte for byte.

The earlier mender's changes, as CHANGES.md lists them:
- checks/helpers-moorings.ts gained 12 cases, from 52 to 64:
  - bestBerth goes by length alone (PA1 adv-5 -> hollow-bestarea)
  - bestBerth breaks a tie of one length and unlike beams by list order (PA1 adv-6 -> hollow-bestbeam)
  - bestBerth treats the boat's own berth as taken (PA1 adv-7 -> hollow-bestown)
  - quayLoad leaves its arguments alone (PA1 adv-8 -> hollow-loadsorts)
  - berthOn goes by place in the log, not by day (PA2 adv-1 -> hollow-byday)
  - assign writes at the front whatever the day (PA2 adv-2 -> hollow-assignday)
  - boardLine leaves its arguments alone (PA2 adv-3 -> hollow-boardsorts)
  - release writes at the front whatever the day (PA3 adv-3 -> hollow-releaseday)
  - shift writes its two entries at the front whatever their day (the module's hole 2, for PA1 and PA2)
  - berthOf, lastMove and berthOn leave their arguments alone (the module's hole 3)
- PA1 ask.md: a new sentence, "Whether the boat already lies at a berth makes no difference: the berth it lies at is not free, and the others count as they would for any boat." This answers the ask with two readings. The ask is 159 words with its title.
- PA1 check.test.ts:
  - new case for a boat that already lies at a berth (adv-2 -> hollow-berthed, adv-3 -> hollow-ownberth)
  - new case "goes by length alone" (adv-4 -> hollow-area)
  - the tie-order case gained berths of one length and unlike beams (adv-1 -> hollow-beamtie)
  - the near miss adv-9 is now hollow-idtie
- PA2: renames only, since all its breaches were in the helper. The near miss adv-4 is now hollow-capped.
- PA3 check.test.ts:
  - new case "logs it there whatever the day, and leaves the older entries in their places" (adv-1 -> hollow-dayorder, adv-2 -> hollow-resorted)
  - unchanged() also skips the new shift case of the helper
  - the near miss adv-4 is now hollow-afterday

My changes:
- tasks/PA2/where.md: a new paragraph, "An answer from the outline alone that passes". This answers PA2's "Kind: an inside task, but thin" by the adversary's first option, "accept that and note it in where.md". I ran the adversary's outline-only answer on the check as it is now. With Math.floor it passes all 68 cases. With round or ceil it fails two. The note says that an outline-1 pass on PA2 is a right guess of three facts of the body, and that it must be read and counted beside the score.
- tasks/PA3/where.md, two changes:
  - the hollow-guess sentence now names all four cases that fail it; it named three, and the new PA3 case is the fourth (follows from the new PA3 case)
  - a new item names hollow-dayorder, hollow-afterday and hollow-resorted, and the case that fails them (PA3 adv-1, adv-2 and the near miss)
- tasks/PA1/where.md: a new item names hollow-berthed and hollow-ownberth, says that assign can lead a reader of the whole file to them, and names the case that fails both. This answers the two readings finding and adv-2 and adv-3.
- CHANGES.md written.
- holds.py make run again. No held text changed.

Also unchanged: the module, every plain.ts (still the module byte for byte), and every reference.ts, reference.edits.md and other.ts. The module and the three reference.ts pass tsc --strict. Nothing under /home/user/Kung-Fu was edited, and git status there is clean. My scratch files are in SCRATCH/mend-moorings-2.

## tsc_last_line

No output, exit 0 (tsc --strict on W/files/moorings.ts; the three reference.ts copies also exit 0)

## holds_check_last_line

all as they must be

## check_tasks_last_line

window: none; all as they must be

## left_alone

- PA2, its kind, by the adversary's second option, "make the change need more of the body". I did not take it. The change does need the body when it is written in place: an edit that quotes line 120 cannot be written from the outline. The other way, swapping the first line for a whole new function, is open in any inside task, and here it needs three right guesses. The natural guess for money, the nearest penny, is wrong. Closing that way would change what the task turns on, and the brief allows that only when a finding requires it. This one does not. where.md now says how to read such a pass.
- PA1, the outline prints interface members and constants not as the file has them. The adversary says this is the tool's and not the writer's, and README.md says the outline has no author. An empty SEARCH or a function's first line still works, and the reference uses an empty SEARCH.
- PA2, the two answers that pass and are not wrong: rounding the bill and not the discount, and Math.floor(later / LONG_STAY_OFF). On this module they give the same results as the reference, so no check that runs the code can fail them.
- PA3, berths.find(...) in place of berthOf. Not pinned, as the adversary advised: a case for it would make PA3 lean on a second body, the guard in berthOf, which the region reader cannot see.
- The module: assign accepts a boat whose id is "". Not pinned, as the adversary advised. It is an oddity, not a fault for the run.
- The passing variants the adversary listed and did not keep. They differ only where the module's own rules are already broken (one boat at two berths), on inputs no ask speaks of, or not at all. I agree with the adversary's judgement.

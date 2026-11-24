## changes

I found no earlier mender's work. At the start, every file in W was as the adversary left it. check-tasks ended "window: none; 34 WRONG" (the adversary's 34 files) and holds.py check ended "all as they must be". There was no CHANGES.md. So I wrote /home/build/patch/pumpout/set/CHANGES.md new: a line saying another mender took over here, then my lines. The module, the asks, plain.ts, reference.ts, reference.edits.md, other.ts and holds/ are unchanged.

Shared helper, checks/helpers-pumpout.ts: 62 to 70 cases, each pinning what the module does now.
- A1: new case "clock: only the no-start value itself is shown as dashes". clock(-20) and clock(-2) are not "--:--".
- A2: new case "clock: the hours go on past midnight and do not wrap". clock(1440) is "24:00" and clock(1505) is "25:05".
- A3: the case "topUp: nothing bought costs nothing and adds no batch" now also asks topUp(held, 0, 140).
- A4: new case "joinQueue: a boat down for one service that asks for both is put down for both".
- A5: new case "serve: a head with no room holds up the boats behind it, even one that would fit".
- A6: new case "record: puts the very visit it was given in the log, not a copy of it".
- A7: new case "nextStart: keeps to the grid behind a logged visit that is off it" (a visit logged at 515 gives 550).
- A8: new case "topUp: joins only the last batch, so a purchase for an earlier day makes a batch of its own".
- A9: new case "spend: a count below 0 is true and takes nothing, as 0 is".
- The 9 shared breach files are renamed in each task: hollow-dashes, -wrap, -emptybatch, -askboth, -skiphead, -recordcopy, -offgrid, -sameday, -negative.
- Each of these fails only the case written for it, at an assertion, in all three checks.

PI1:
- New case "leaves a wallet as it was even when it is out of order and holds a dead batch and an empty one", on wallet([150,5],[0,3],[100,0]) at day 200. Answers B adv-1, 2 and 3, now hollow-dropdead, hollow-sortinplace and hollow-dropempty.
- New case "takes the batches in whatever order the wallet holds them", using wallet([190,5],[0,3]). It tests order alone, so hollow-difference still fails only one case. Answers B adv-4, now hollow-inorder.
- adv-16, the type fault, is deleted.
- The near misses adv-14 and adv-15 are renamed hollow-clamp and hollow-closing.
- where.md now names the new wrong answers and says the check cannot see the return type.

PI2:
- The case "shuts on every day" also asks days 0, 5, 6 and 13. Answers C adv-1, now hollow-weekdays.
- The near misses adv-11 and adv-12 are renamed hollow-strictinside and hollow-loggedlunch.
- where.md names these files and has a new paragraph on the outline-only routes. It says an outline-1 pass must be read before it is counted.

PI3:
- New case "gives the log's own visits, not copies of them". It asks for every visit of a boat, so the natural guess still fails only its two cases. Answers D adv-1, now hollow-latestcopy.
- adv-11 and adv-12 are renamed hollow-tail and hollow-fromend.
- where.md names these files and notes that the body of visitsOf is not needed, only the fact.

Verified:
- Each renamed file matches the adversary's file byte for byte.
- I rebuilt the adversary's 87-file screen into a scratch copy of the set. Only two of its files pass: typed-wrong and PI2's "end inside or at 13:10", which the adversary said acts as the module does.
- The outline-only routes for PI2 and PI3 still pass.
- Each check, with the helper, type-checks against its reference.
- The module, the three references and the three other.ts files pass tsc --strict.
- My scratch files are in SCRATCH/mend-pumpout/.

## tsc_last_line

(no output; exit 0)

## holds_check_last_line

all as they must be

## check_tasks_last_line

window: none; all as they must be

## left_alone

- B, PI1 hollow-adv-16 (declared to return a string, returns a number): I deleted the file but changed no check. Vitest strips types, so no check that runs the code can fail it. Whether grading should run tsc is the maintainer's call for every module. where.md says the check cannot see the return type.
- C, PI2 is not of its kind: the finding is true. The change can be written from the outline alone, by renaming the old function and wrapping it, or by a guard that calls it again with a made-up lunch visit added. I did not change the task. The same route is open in any inside task whose change is "the old function, on changed arguments". Closing it means a different change for the task to turn on, and that is the run author's decision across all sixteen inside tasks. Written in place, the change still needs the body. where.md now says how to read an outline-1 pass.
- D, PI3's note that the lines of visitsOf are not needed: this is not a fault. The task turns on the fact in record, and an outline-only reader without that fact still fails. where.md says so.
- C, the PI2 answer the adversary did not file ("start inside, or end inside or at 13:10"): it is a right answer. It differs from the reference only off the grid, so I added no case.
- E, SLOTS and TOKENS hold the same numbers, and serve looks for a start from the time the boat joined: the adversary says neither is a fault. No task turns on them, and changing the module would mean redoing every answer for no gain.
- The adversary rated A1, A2, A7 and A9 weak (inputs the app does not make) and A6 and A8 weak (identity or order only). I mended them anyway, since each is cheap and pins real behaviour. For A1 the case says only that other negatives are not shown as dashes. It does not pin the meaningless text the module gives for them.

# Changes to `pumpout` and its three tasks

---

**Another mender took over here.** Written by Claude Opus 5.5 on 2026-11-22, as the mender, after the adversary's findings in `/home/build/patch/pumpout/findings.md`. The mender before me was stopped by a usage limit. It left no `CHANGES.md`, and I found no change of its on disk: every file in `W` was as the adversary left it on 2026-11-20, `check-tasks` ended `window: none; 34 WRONG` with the same 34 files the adversary filed, and `holds.py check` ended `all as they must be`. So no finding was answered yet, there are no earlier lines to keep, and every line below is mine.

One line for each change, and the finding it answers. A finding is named by the section of `findings.md` it is in (A to E) and its number or file there.

The module `files/pumpout.ts` did not change. No ask changed. No `plain.ts`, `reference.ts`, `reference.edits.md` or `other.ts` changed, and no kept text under `holds/`.

## The shared helper, `checks/helpers-pumpout.ts`

It gained 8 cases, from 62 to 70, and one old case asks for more. Each pins what the module does now, and all three checks run them.

- New case "clock: only the no-start value itself is shown as dashes": `clock(-20)` and `clock(-2)` are not "--:--". It does not pin what they are. Answers A1.
- New case "clock: the hours go on past midnight and do not wrap": `clock(1440)` is "24:00" and `clock(1505)` is "25:05". Answers A2.
- "topUp: nothing bought costs nothing and adds no batch" now also buys 0 tokens on day 140, a day with no batch. Answers A3.
- New case "joinQueue: a boat down for one service that asks for both is put down for both". Answers A4.
- New case "serve: a head with no room holds up the boats behind it, even one that would fit": the head's pump-out has no room, the water behind it would start at 890, and nobody is served. Answers A5.
- New case "record: puts the very visit it was given in the log, not a copy of it". Answers A6.
- New case "nextStart: keeps to the grid behind a logged visit that is off it": a visit logged at 515 gives 550, not 535. Answers A7.
- New case "topUp: joins only the last batch, so a purchase for an earlier day makes a batch of its own". Answers A8.
- New case "spend: a count below 0 is true and takes nothing, as 0 is". Answers A9.
- The nine files that breached the helper are kept under names that say what they get wrong, in each task: `hollow-dashes.ts` (A1), `hollow-wrap.ts` (A2), `hollow-emptybatch.ts` (A3), `hollow-askboth.ts` (A4), `hollow-skiphead.ts` (A5), `hollow-recordcopy.ts` (A6), `hollow-offgrid.ts` (A7), `hollow-sameday.ts` (A8), `hollow-negative.ts` (A9). In PI1 they were `hollow-adv-5.ts` to `-13.ts`; in PI2 and PI3, `hollow-adv-2.ts` to `-10.ts`, in that order. Each fails one case, the one written for it, at an assertion, in all three checks.

## PI1 (beside)

- `check.test.ts`: new case "leaves a wallet as it was even when it is out of order and holds a dead batch and an empty one", on `wallet([150, 5], [0, 3], [100, 0])` on day 200. It rests on the ask's "The wallet must not be changed." Answers B, `hollow-adv-1.ts`, `-2.ts` and `-3.ts`.
- `check.test.ts`: new case "takes the batches in whatever order the wallet holds them", with `wallet([190, 5], [0, 3])` on day 170 and a third wallet out of order. It rests on the ask's "how many of the wallet's tokens", which promises no order. Its later batch is not yet bought on day `day + within`, so the case tests the order alone, and `hollow-difference.ts` still fails one case only. Answers B, `hollow-adv-4.ts`.
- `hollow-adv-1.ts` is now `hollow-dropdead.ts`, `hollow-adv-2.ts` is now `hollow-sortinplace.ts`, `hollow-adv-3.ts` is now `hollow-dropempty.ts`, and `hollow-adv-4.ts` is now `hollow-inorder.ts`. Each fails one case, the one written for it, at an assertion. Answers the same.
- `hollow-adv-16.ts` is deleted. It is right when it runs, and is declared to return a string. No check that runs the code can fail it. Answers B, `hollow-adv-16.ts`, as the adversary asked; see what was left alone.
- The two near misses are kept under names that say what they do: `hollow-adv-14.ts` is now `hollow-clamp.ts`, and `hollow-adv-15.ts` is now `hollow-closing.ts`. Each still fails one case. Answers B's and A's "near miss kept".
- `where.md` names the new wrong answers and the case each fails, and says that the check cannot see the return type. Answers B.

## PI2 (inside)

- `check.test.ts`: "shuts on every day" now also asks on days 0, 5, 6 and 13. It rests on the ask's "every day". Answers C, `hollow-adv-1.ts`.
- `hollow-adv-1.ts` is now `hollow-weekdays.ts`. It fails "shuts on every day" only, at an assertion. Answers the same.
- The two near misses: `hollow-adv-11.ts` is now `hollow-strictinside.ts`, and `hollow-adv-12.ts` is now `hollow-loggedlunch.ts`. Each still fails one case. Answers C's "near misses kept".
- `where.md` names the new wrong answers. Answers C.
- `where.md`: a new paragraph, "A right answer that needs no body", on the two ways to write the change from the outline alone, what they take on trust, and that an `outline-1` pass must be read before it is counted. Answers C's KIND; see what was left alone.

## PI3 (leans)

- `check.test.ts`: new case "gives the log's own visits, not copies of them". It rests on the ask's "the ones of that boat that were recorded most recently": the visits in the log, not copies of them. It asks for every visit of a boat, so which end of the log is new does not matter in it, and the natural guess still fails two cases only. Answers D, `hollow-adv-1.ts`.
- `hollow-adv-1.ts` is now `hollow-latestcopy.ts`. It fails that case only, at an assertion. Answers the same.
- The two forms of the natural guess that were kept: `hollow-adv-11.ts` is now `hollow-tail.ts`, and `hollow-adv-12.ts` is now `hollow-fromend.ts`. Each still fails the same two cases as `hollow-guess.ts`. Answers D's "kept".
- `where.md` names the new wrong answers. Answers D.
- `where.md`: a new paragraph, "What the region adds", that the lines of `visitsOf` are not needed, and so an `outline-1` reader fails this task for want of the fact and not of the body. Answers D's KIND, "One note".

## What was tried after the last change

- Each kept file was run against its check and the failing cases read. Each breach fails by the case written for it and no other. Each writer's hollow file still fails, and `hollow-difference.ts` still fails its one case only.
- The adversary's whole screen was made again, from a copy of its generator, into a scratch copy of the set, and run against the mended checks. Of its 87 files, two pass: `typed-wrong` (the type fault, deleted here), and PI2's "end inside or at 13:10", which the adversary found acts as the module does on the grid. Every other one fails.
- The adversary's two outline-only answers still pass: the PI2 guard that calls `nextStart` again with lunch added, and the PI3 guard on the first line of `visitsOf`. The same PI3 guard with the natural guess fails the same two cases as before.
- Each check, with the helper, type-checks against its reference.

## Left alone

- **B, `hollow-adv-16.ts`, the type fault.** No line of `check.test.ts` can fail an answer that runs right and is typed wrong, since the grader runs vitest and vitest strips types. Whether grading should run `tsc` is the maintainer's to decide for every module. The file is deleted, as the adversary asked, and `where.md` says the check cannot see the return type.
- **C, PI2's kind.** The finding is true: the change can be written from the outline, by keeping the old body under a new name and calling it on a copy of the log with lunch added as a visit, or by a guard that calls the function again. I did not change the task. The route is open in any `inside` change that can be said as "the old function, on changed arguments". Closing it would mean a different change for the task to turn on, one that alters something inside the loop that a caller cannot reach, and that is the run's author's to decide for all sixteen `inside` tasks. Written in place, the change needs the body, and for a reader of `region.md` the task is of its kind. `where.md` says how to read an `outline-1` pass.
- **D, PI3's note that the body of `visitsOf` is not needed.** It is not a fault of the task. The task turns on the fact in `record`, and a reader without the fact fails it whether or not it holds the body. `where.md` says so.
- **C, the answer the adversary did not file** ("start inside, or end inside or at 13:10"). It differs from the reference only for a visit that starts between 730 and 750 off the grid, which the grid never gives. It is a right answer, and no case was added for it.
- **E, `SLOTS` and `TOKENS` hold the same numbers.** The adversary says it is not a fault. A file that uses one table for the other acts as the module does, so no check can tell them apart, and no task turns on it.
- **E, `serve` looks for a start from the time the boat joined, with no "now".** The adversary says it is not a fault. The helper pins it, and no task turns on it. Changing it would change the module and every answer of the three tasks for no gain.
- **The strength the adversary gave to A1, A2, A7 and A9** (inputs the app does not make) **and to A6 and A8** (identity or order only). I mended them all the same, since each was cheap and pins what the module does at an input it takes. For A1 the new case says only that a time below 0 other than `NO_START` is not shown as dashes. It does not pin the text the module gives, which is not a time.

## The last lines, after the last change

- `tsc --strict` on `files/pumpout.ts`: no output, exit 0. The same on the three `reference.ts` and the three `other.ts`, copied to my scratch directory.
- `holds.py make W`: `3 tasks: name, outline, region, whole written for each`. `holds.py check W`: `all as they must be`.
- `box.py check-tasks W --window none`: `window: none; all as they must be`.

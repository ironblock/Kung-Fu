ADVERSARY FINDINGS: module `tides`, W = /home/build/patch/tides/set, tasks PB1 (beside), PB2 (inside), PB3 (leans)

I changed none of the writer's files. I added only `other.ts` and `hollow-adv-<n>.ts` under /home/build/patch/tides/set/tasks/<id>/. Nothing under /home/user/Kung-Fu was edited and nothing was committed.

One departure from the brief: I printed each task's `reference.edits.md` and `where.md` while reading the asks, before I wrote my own answers. So my `other.ts` files were not written blind to the reference. Each is in a different style and all three pass, so no fairness finding rests on this.

STATE NOW
- `python3 bench/box.py check-tasks W --window none` ends `window: none; 23 WRONG`. All 23 are my kept breaching files. Every reference, `plain`, `other` and writer's hollow answer is `ok`.
- `python3 bench/holds.py check W` ends `all as they must be`.
- 23 breaching files are about 11 distinct holes: 9 in the shared helper /home/build/patch/tides/set/checks/helpers-tides.ts, 1 in PB1's check, 1 in PB3's check, plus one clause of PB3's ask that no behaviour check can reach.
- Every kept file passes `tsc --strict` except PB3/hollow-adv-2.ts, which is the point of that file.

================ HOLES IN THE SHARED HELPER (`unchanged`) ================
Each file is the task's reference with one other function changed. The same change is kept in each task so that each check is shown to pass it.

H1. closeFor changes a window in place when the closure takes only one end of it.
- Files: PB1/hollow-adv-2.ts, PB3/hollow-adv-3.ts, and PB2/hollow-adv-1.ts (PB2's own form, below).
- Telling case: `const first = w(480, 690, 70); const day = [first]; closeFor(day, 600, 800)`. The module leaves `first` as `{480, 690, 70}` and puts a new object in the list. The file makes `first` `{480, 600, 70}`. Likewise `closeFor(day, 400, 540)` makes `first.opens` 540.
- Why it passes: the pin "closeFor changes the list it is given and not the windows that were in it" only cuts a window in two (`mod.closeFor(day, 540, 600); expect(day).toHaveLength(3); expect(first).toEqual(w(480, 690, 70));`). "closeFor trims the end of a window" and "closeFor trims the start of a window" compare the list with `toEqual` and never look at the object that was in it.
- This is the most likely of all the breaches. PB2/where.md lists it as a likely wrong answer and says `unchanged` pins it. It pins only the two-piece case.

H2. windowsFor takes the earlier opening when it joins two windows.
- Files: PB1/hollow-adv-3.ts, PB2/hollow-adv-2.ts, PB3/hollow-adv-4.ts. Change: `last.opens = Math.min(last.opens, next.opens);` added.
- Telling case: `windowsFor([{ at: 600, height: 335 }, { at: 610, height: 400 }])`. Module: `[{ opens: 550, closes: 720, depth: 90 }]`. File: `[{ opens: 460, closes: 720, depth: 90 }]`.
- Why it passes: the only pin with a small window inside a big one is `mod.windowsFor([{ at: 610, height: 335 }, { at: 600, height: 400 }])`, where the big tide has the earlier `at`. No case has the small one first.
- This is also a fault in the module; see THE MODULE.

H3. windowsFor compares each window with the one before it as it stood alone, not with the joined one.
- Files: PB1/hollow-adv-4.ts, PB2/hollow-adv-3.ts, PB3/hollow-adv-5.ts.
- Telling case: `windowsFor([{ at: 600, height: 400 }, { at: 610, height: 335 }, { at: 800, height: 370 }])`. Module: `[{450, 890, 90}]`. File: `[{450, 710, 90}, {680, 890, 60}]`.
- Why it passes: no pin joins three windows.

H4. nextEntry sorts the caller's list in place.
- Files: PB1/hollow-adv-5.ts, PB2/hollow-adv-4.ts, PB3/hollow-adv-6.ts.
- Telling case: `const day = [w(780, 990), w(480, 690)]; nextEntry(day, 0)`. Module: 780, list untouched. File: 480, list reordered.
- Why it passes: "nextEntry leaves the windows as they were" uses `const day = [w(480, 690), w(780, 990)];`, already in opening order, so a sort cannot show.
- Low weight: nextEntry's comment says "The windows are in the order they open", so the difference shows only on input outside that contract.

H5. planDeparture sorts the caller's list in place.
- Files: PB1/hollow-adv-7.ts, PB2/hollow-adv-6.ts, PB3/hollow-adv-8.ts.
- Telling case: `planDeparture([w(780, 990), w(480, 690)], 0, 0)`. Module: enter 780, list untouched. File: enter 480, list reordered.
- Why it passes: "planDeparture leaves the windows as they were" also uses a list already in order. Same low weight as H4.

H6. isOpen sorts the caller's list in place.
- File: PB1/hollow-adv-8.ts.
- Why it passes: there is no "leaves the windows as they were" pin for isOpen at all.
- More weight than H4 and H5: isOpen takes windows in any order, so the reordering is a real side effect.
- Not tried: `spare` and `closeFor` have no such pin either, and `deepEnough`'s uses a list in order. One mend covers the class: an out-of-order list in each of those pins.

H7. boardLine shows dashes for any window too short to lock through.
- Files: PB1/hollow-adv-6.ts, PB2/hollow-adv-5.ts, PB3/hollow-adv-7.ts.
- Telling case: `boardLine(w(480, 490, 30))`. Module: `"08:00 to 07:58, 30 cm over the sill"`. File: `"08:00 to --:--, 30 cm over the sill"`.
- Why it passes: the only short window pinned is `w(0, 10, 30)` in "boardLine shows dashes when the last entry is before the day begins", where both give dashes.

H8. lockDues throws for a length of 0 or less.
- File: PB1/hollow-adv-9.ts. Module: `lockDues(0, 600)` is 0. No pin has a length below 1. Low weight.

Tried and failed by the helper (deleted unless noted): lockDues ceil after multiplying; surcharge rounded to nearest; keeper's hours closed at 20:00; length rounded down; fits with `>`; deepEnough returning copies; deepEnough deepest first; lastLeave floored at 0; windowFor margin `<=`; windowFor not clipped to the day; windowsFor keeping the lesser depth; windowsFor sorting its argument; isOpen leaving out the opening minute; nextEntry returning -1; nextEntry with `<`; planDeparture `held` from entry; closeFor walking forward; closeFor pieces turned round; clock taking 1440 as a time; clock wrapping past midnight; spare without the floor at 0; spare giving -1 when shut. Kept as a near miss: PB1/hollow-adv-11.ts, closeFor with `start > end`, failed only by `closeFor(day, 600, 600)` in "closeFor does nothing between windows or for an empty stretch".

Two more passed and I deleted them as not wrong: `clock` flooring its minutes and `windowFor` flooring `depth * 2`. They differ only for times or heights that are not whole numbers.

================ PB1 (beside): add `openMinutes` ================
Breaches, 9 files:
- PB1/hollow-adv-1.ts: the ask done wrong. It has `if (w.closes <= from) break;`, so it stops at the first window that ends before the stretch. `openMinutes([w(100, 200), w(480, 690)], 300, 800)` must be 210 and the file gives 0. No case of check.test.ts lists a window that ends at or before `from` ahead of one that counts. A slip more than a likely answer, but one case closes it.
- PB1/hollow-adv-2 to -9: H1, H2, H3, H4, H7, H5, H6, H8 in that order.

Near miss kept: PB1/hollow-adv-10.ts clamps the sum and not each window. It fails "takes the windows in any order" (`[w(780, 990), w(480, 690)], 500, 600`). Also failed and deleted: sorting the caller's list in place, which the last case fails as where.md says.

other.ts: passed. It is placed in the middle of the file, before `fits`, uses `reduce`, and returns 0 early when `to <= from`.

Fairness: nothing the check tests goes beyond the ask. I found one reading of the ask.

Kind: it is a `beside` task. A right answer needs only `LockWindow` with `opens` and `closes`, which outline.md shows at lines 10 to 12. The unit, the any-order rule, the 0 for a backward stretch, and which end counts ("one that opens at 480 and closes at 690 is 210 minutes long") are all in the ask. Nothing needed is only in a body or a comment. The reference edit has an empty SEARCH.

================ PB2 (inside): `closeFor` drops short pieces ================
Breaches, 6 files:
- PB2/hollow-adv-1.ts: H1 in PB2's form. Returned numbers and lists are right for every case, but a window the closure trims at one end is changed in place (`window.closes = start` or `window.opens = end`). The ask says "Everything else about the function stays as it is now." Telling case: `const first = w(480, 690, 70); closeFor([first], 485, 600)` leaves `first` as `{600, 690, 70}`; the reference leaves it `{480, 690, 70}`.
- PB2/hollow-adv-2 to -6: H2, H3, H4, H7, H5.

Near misses kept, both failed: PB2/hollow-adv-7.ts applies the rule only when a window is cut in two; PB2/hollow-adv-8.ts judges the two pieces together. Also failed and deleted: leaving a window under 12 minutes alone even when it is cut. On the ask's own clauses the check is tight.

other.ts: passed. It builds both pieces, filters by length with the literal 12, and takes `lost` as the window's length less what is kept.

Fairness: nothing beyond the ask. "leaves a short window that only meets the closure" rests on "A window the closure does not touch is left as it is", and the kept `if (start >= end) continue;` gives it. One reading.

Kind: everything a right answer needs is in the ask and region.md. But the change can be written from the outline alone, with no line of the body. This edit quotes only the first line, which the outline prints, and it passes the check:

SEARCH: `export function closeFor(windows: LockWindow[], from: number, to: number): number {`
REPLACE:
```
export function closeFor(windows: LockWindow[], from: number, to: number): number {
    const had = new Set(windows.map((w) => `${w.opens} ${w.closes}`));
    let lost = closeForWhole(windows, from, to);
    for (let i = windows.length - 1; i >= 0; i--) {
        const w = windows[i];
        if (!had.has(`${w.opens} ${w.closes}`) && w.closes - w.opens < 12) {
            lost += w.closes - w.opens;
            windows.splice(i, 1);
        }
    }
    return lost;
}

function closeForWhole(windows: LockWindow[], from: number, to: number): number {
```
The old body stays under a new name and the new function sweeps what it leaves. It needs only what the ask says of closeFor: it changes the list and returns the minutes lost. I ran it as a hollow file, saw `passed`, and deleted it from W because it is a right answer; it also passes `tsc --strict`.

By the brief's test ("Could the change be written from the outline alone?") the answer is yes, so by the letter PB2 is not an `inside` task. My judgement: this route is open in any `inside` task whose change can be made on the result, and a small model is unlikely to take it. Written in place, the change does need the body. It is for the mender and the run's author to decide. At the least, a pass in the `outline-1` arm should be read for this before it is counted as a guess that landed.

================ PB3 (leans): `planDeparture` returns null ================
Breaches, 8 files:
- PB3/hollow-adv-1.ts: the guess hedged the wrong way, `if (entry <= 0 || entry >= DAY) return null;`, which takes 0 for "none" as well. `planDeparture([w(0, 150)], 0, 0)` must be `{ leave: 0, enter: 0, clear: 12, held: 0 }` and the file gives null. `windowFor` does make windows that open at 0, and the helper pins `{ opens: 0, closes: 150, depth: 60 }`. No case of the check or the helper has an entry at minute 0.
- PB3/hollow-adv-2.ts: the return type is left as `Departure`. The ask says "change its return type to say so". `tsc --strict` says `error TS2322: Type 'null' is not assignable to type 'Departure'`; the check passes it because vitest strips types and check-tasks runs no type checker. Under WRITER.md ("It never reads the source text") I see no way for the check to fail it. If the mender leaves it, this file must be deleted, or check-tasks will keep saying WRONG. It does not harm what the run measures: such an answer did use the fact.
- PB3/hollow-adv-3 to -8: H1, H2, H3, H4, H7, H5.

The natural wrong guess, in more forms, all failed by the first group of cases: `entry < 0`, `!Number.isFinite(entry)`, `Number.isNaN(entry)`, `entry == null`, `entry > DAY`. Kept: PB3/hollow-adv-10.ts (`!Number.isFinite(entry)`). Other wrong ways, failed: `entry >= DAY - LOCKING` (kept as PB3/hollow-adv-9.ts, failed only by `planDeparture(day, 1400, 28)`), `entry + cruise >= DAY`, `entry + LOCKING >= DAY`.

other.ts: passed. It returns `entry < DAY ? { ... } : null`.

Fairness: nothing beyond the ask. Its second paragraph ("Whenever the boat can still go into the lock that day, the plan must be exactly what it is now") shuts out the reading "cannot go in on arrival". The check has no window that closes after 1440, where `entry === DAY` and `entry >= DAY` would part.

Kind:
- The ask does not give the fact away. It does not name `nextEntry`. "its times mean nothing, and the hire desk has printed one of them" is at most a faint hint that the value looks like a time.
- region.md does not show it. It shows `const entry = nextEntry(windows, ready + cruise);`, and the outline shows `export const DAY = 1440;` and `export function nextEntry(windows: LockWindow[], at: number): number {`. The first line leaves -1, NaN, Infinity and DAY open and rules out null.
- The natural guess is wrong: `hollow-guess.ts` and five more forms fail.
- The fact is plain in the whole file, lines 93 and 94: `// Nothing is left today. DAY and not -1, ...` and `return DAY;`.
- A careful reader of region.md does see that `nextEntry` matters: it is the only place "no time left" can come from.
- The weakness: a reader who holds only region.md can pass without the fact, by one line that covers every guess. I ran these as hollow files, each `passed`, and deleted them as right answers: `if (entry < 0 || entry >= DAY) return null;`, `if (!isOpen(windows, entry)) return null;`, `if (!Number.isFinite(entry) || entry < 0 || entry >= DAY) return null;`, `if (entry + LOCKING > DAY) return null;`. The second needs nothing but the outline's `isOpen`.
- So PB3 is of its kind by WRITER.md's letter, but a `region` pass does not show the reader knew what the other body does. where.md says so already ("Read such a try as a hedge"), yet the score will count it a pass, and question 4 of the run rests on such passes failing. No check can close this: a "none" value that is a number outside a known range is always open to a range test. Closing it means leaning on another kind of fact, such as a unit or which end of a range is included. I leave that to the mender and the author.

================ THE MODULE ================
/home/build/patch/tides/set/files/tides.ts: 149 lines, no line over 120 columns, passes `tsc --strict`, no clock and no random number. Nothing changes from run to run. It reads as real code, and the conventions are sensible.

One thing is broken: `windowsFor` loses an earlier opening when it joins. It sorts by `at` and on a join sets only `closes` and `depth`. For `[{ at: 600, height: 335 }, { at: 610, height: 400 }]` it gives `{ opens: 550, closes: 720, depth: 90 }`, though the second tide alone opens the lock at 460. This is H2. Pinning the module as it is would pin a fault. Mending it (`Math.min` on `opens`, or sorting the windows by `opens`) changes every `plain.ts` and `reference.ts`.

Two warts, not faults:
- `boardLine` prints a last entry before the opening for a window under 12 minutes: `"08:00 to 07:58"` (H7).
- `nextEntry` and `planDeparture` rely on the list being in opening order, while `isOpen`, `spare` and `closeFor` do not.

Checked against WRITER.md and found in order: the asks are 156, 143 and 96 words; each names `src/tides.ts`; none mentions a test; PB3's ask does not name `nextEntry`; every `plain.ts` is the module byte for byte; the line numbers in each where.md are right. One claim in PB2/where.md is wider than its pin, as H1 shows.

================ WHAT I ADDED ================
- /home/build/patch/tides/set/tasks/PB1/other.ts, PB2/other.ts, PB3/other.ts: right answers, all pass.
- PB1/hollow-adv-1.ts to hollow-adv-9.ts breach; hollow-adv-10.ts and -11.ts are near misses the check fails.
- PB2/hollow-adv-1.ts to hollow-adv-6.ts breach; hollow-adv-7.ts and -8.ts are near misses.
- PB3/hollow-adv-1.ts to hollow-adv-8.ts breach; hollow-adv-9.ts and -10.ts are near misses.

Telling cases for the mender, in one place:
- H1: `first` unchanged after `closeFor([first], 600, 800)` and after `closeFor([first], 400, 540)`.
- H2: the small-then-big table above.
- H3: the three-tide table above.
- H4, H5, H6: an out-of-order list in each "leaves the windows as they were" pin, and one added for isOpen.
- H7: `boardLine(w(480, 490, 30))`.
- H8: `lockDues(0, 600)` is 0.
- PB1: `openMinutes([w(100, 200), w(480, 690)], 300, 800)` is 210.
- PB3: `planDeparture([w(0, 150)], 0, 0)` is `{ leave: 0, enter: 0, clear: 12, held: 0 }`.
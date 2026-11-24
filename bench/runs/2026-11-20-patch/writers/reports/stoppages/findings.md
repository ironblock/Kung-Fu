# Adversary report: module `stoppages`, tasks PL1 (beside), PL2 (inside), PL3 (leans)

W = /home/build/patch/stoppages/set. I changed none of the writer's files. I added only `tasks/<id>/other.ts` and `tasks/<id>/hollow-adv-<n>.ts`.

## Where it stands

- `python3 bench/box.py check-tasks W --window none` ends `window: none; 45 WRONG`. All 45 are my files that passed: 16 in PL1, 13 in PL2, 16 in PL3. Every writer's line is still `ok`.
- The 45 files are 19 different wrong answers. 13 are one hole in the shared helper, kept once per task. 3 are PL1's own and 3 are PL3's own.
- All three `other.ts` passed. `others_failed` is 0.
- `python3 bench/holds.py check W` ends `all as they must be`.
- **PL2 is not an `inside` task by the brief's test.** A right answer can be written from the outline alone, and it passes (section PL2).
- **PL3's fact can be sidestepped.** A reader of `region.md` who does not know the fact can ask `inForce` and pass (section PL3).
- Each task also keeps two files the check rightly fails, as near misses.
- All 54 files I added pass `tsc --strict`.

## The 13 helper breaches (same wrong answer in each task)

Each file is the task's `reference.ts` with one other function changed. "ref" is what the reference gives on the input, "file" is what my file gives. I ran each pair.

| What | PL1 | PL2 | PL3 | What it gets wrong | An input that tells them apart |
| --- | --- | --- | --- | --- | --- |
| throughby-loose | adv-4 | adv-1 | adv-4 | `throughBy` walks `route.stretches` with `stretchOf` and `legMinutes`, not `legsOf`, so a broken route gets a time | `throughBy(network(), newRegister(), {start:"Arlow", stretches:["s1","s4"]}, 12, 480)`: ref throws RangeError, file gives 639 |
| wayround-order | adv-5 | adv-2 | adv-5 | `wayRound` asks `routeOpen` before `endOf`, so a broken route that is open is handed back | `wayRound(network(), newRegister(), {start:"Arlow", stretches:["s4"]}, 12)`: ref throws RangeError, file gives the route |
| wayround-ring | adv-6 | adv-3 | adv-6 | `wayRound` gives null for a shut route that ends where it starts | s1 closed 10 to 20, route `{start:"Arlow", stretches:["s1","s1"]}`, day 12: ref gives `{start:"Arlow", stretches:[]}`, file gives null |
| issue-order | adv-7 | adv-4 | adv-7 | `issue` takes the old notice off before it tests a restriction's times | issue `restriction("N1","s2",5,9,600,700)`, then again with times 700, 700: both throw; ref keeps N1, file's register is empty |
| issue-stretch | adv-8 | adv-5 | adv-8 | a reissue replaces the old notice only when the stretch is the same | issue N1 for s1, then N1 for s2: ref holds one notice, file holds two |
| issue-neg | adv-9 | adv-6 | adv-9 | `issue` refuses a dated notice whose first day is below zero | `issue(r, closure("N1","s1",-5,3))`: ref takes it, file throws |
| furlongs-strict | adv-10 | adv-7 | adv-10 | `routeFurlongs` walks `legsOf`, so a broken route is an error | `routeFurlongs(network(), {start:"Arlow", stretches:["s1","s4"]})`: ref 22, file throws |
| locks-strict | adv-11 | adv-8 | adv-11 | the same in `routeLocks` | same route: ref 9, file throws |
| prune-nil | adv-12 | adv-9 | adv-12 | `prune` also drops a notice that covers no day, whatever the day | register holding `closure("N1","s1",10,10)`, `prune(r, 4)`: ref 0 and keeps it, file 1 and drops it |
| sharesday-nil | adv-13 | adv-10 | adv-13 | `sharesDay`: a notice that covers no day shares none | notices `[closure("N2","s1",10,10), closure("N1","s1",5,20)]`, `overruled(r, r.notices[0])`: ref `["N1"]`, file `[]` |
| inforce-sign | adv-14 | adv-11 | adv-14 | `inForce` reads any `to` below zero as no end date | `inForce(closure("N1","s1",-10,-3), 0)`: ref false, file true |
| over-sign | adv-15 | adv-12 | adv-15 | `over` reads any `to` below zero as no end date | register with `closure("N1","s1",-10,-3)`, `prune(r, 0)`: ref 1, file 0 |
| tally-sign | adv-16 | adv-13 | adv-16 | `tally` counts any `to` below zero as open-ended | same notice, `tally(r, -5)`: ref `openEnded: 0`, file 1 |

Why `checks/helpers-stoppages.ts` passes them:

- **Broken routes.** Only `legsOf`, `endOf` and `wayRound` are given one.
  - The four `throughBy` cases (lines 626 to 655) use sound routes only.
  - The error cases of `routeFurlongs` and `routeLocks` (lines 535 to 538, 546 to 549) use a stretch that is not on the network, never stretches that do not meet.
  - The one broken route given to `wayRound` is line 691: `expect(() => mod.wayRound(network(), register, { start: "Arlow", stretches: ["s4"] }, 12)).toThrow(RangeError);`. That register closes s4 on day 12, so the route is not open and both orders reach `endOf`.
- **A route that ends where it starts.** It appears once, in `endOf` (line 521), and never in `wayRound`, `extraMinutes` or `daysLost`.
- **`issue`.**
  - The refused reissue (lines 140 to 144) is refused by the day test: `closure("N1", "s1", 10, 10)`. No reissue is refused by the restriction test.
  - The reissue that replaces (lines 104 to 110) is for the same stretch.
  - A first day below zero is given only with no end date (lines 122 to 128).
- **A notice that covers no day.** The module makes one itself: `lift` before the first day leaves `to` equal to `from`. No case hands one to `prune` or `overruled`.
- **A dated `to` below -1.** No case has one, so `=== OPEN_ENDED` and `< 0` cannot be told apart. The helper does use days below zero (line 126, line 237).

How likely each is in a file written anew from a guess:

- Most likely: throughby-loose and wayround-order. A writer who has not seen the bodies would write them that way.
- Plausible: issue-order, furlongs-strict, locks-strict.
- Far corners: the rest.

Five more survived in PL1 and I did not keep them, because the input is one no caller would give and there is no right answer to pin:

- `farEnd` on a stretch whose two ends are one junction;
- `allowance` with a count below zero;
- `throughBy` with an empty route that sets off at 1440;
- `legsOf` with an empty route whose start is not on the network;
- `daysLost` with a broken route and no nights.

Say if you want them as files.

## PL1 (beside): `closedDays`

**Breaches of its own.** All three touch the clause "It must not change the register or the route", or the list it gives back. The only case on that clause is lines 62 to 69:

    const register = registerOf(mod, closure("N1", "s4", 10, 14), closure("N2", "s1", 3, mod.OPEN_ENDED));
    const route = booked();
    ...
    mod.closedDays(register, route, 0, 20);

- `hollow-adv-1.ts`: calls `prune(register, fromDay)` first. The list is right and the register is changed. The case uses `fromDay` 0 and no notice is over by day 0, so nothing is dropped. Told apart by N1 on s4 from 10 to 14, N2 on s1 from 3 to 5, `closedDays(r, booked(), 8, 12)`: the register is left holding N1 only.
- `hollow-adv-2.ts`: calls `route.stretches.sort()` first. `booked()` is `["s1", "s2", "s4"]`, already in that order. Told apart by any route such as `["s4", "s2", "s1"]`.
- `hollow-adv-3.ts`: fills and hands back one module-level list at every call. No case keeps a first answer across a second call. Told apart by `first = closedDays(r, route, 8, 12)`, then `closedDays(r, route, 0, 5)`: `first` is now `[]`, not `[10, 11]`.

None of the three is a likely answer. They show the clause is tested on one input that cannot fail it.

**Near misses kept; the check fails both.**

- `hollow-adv-17.ts`: a span given backwards is turned round. Failed only by "gives an empty list when toDay is not after fromDay".
- `hollow-adv-18.ts`: jumps closures by `nextOpenDay` and stops at a closure with no end. Failed only by "goes by what routeOpen says for each day".

**Also tried, failed by the check, deleted:**

- looks at `toDay` and not `fromDay`;
- any notice in force counts, a restriction too;
- `firstBlock(...) > 0`.

**`other.ts` passed.** It sits after `routeOpen` and uses `Array.from(...).filter(...)` with no loop.

**Kind.** It is a `beside` task.

- The ask gives the signature, both ends of the span ("`fromDay` is looked at and `toDay` is not"), the order, and the rule ("what `routeOpen` says for that day").
- The outline shows `Register`, `Route` and line 216, `export function routeOpen(register: Register, route: Route, day: number): boolean {`.
- A right answer needs nothing from a body or a comment.

## PL2 (inside): `lift`

**No breach of its own.** I tried ten wrong ways of doing the ask. Eight failed as they should:

- prune after setting the end;
- `splice` with no count;
- swap-remove;
- every notice of the stretch;
- dated notices only;
- the day after the first day too;
- only when the notice is newest;
- taken off a copy of the list.

The ninth is a variant that drops the `over` test for later days. The helper's "a second lift may bring the end earlier, never later" fails it.

The tenth passed, and I do not count it wrong. It puts the take-off branch before the `over` test. It differs from the reference on one state only: a notice with `to` equal to `from`, lifted on that day. The reference gives false and leaves it; this gives true and removes it. The ask has both readings:

- "when the day of the lift is the notice's first day, or any day before it, the notice is taken off the register and `lift` returns true";
- "a notice that is already over by that day, still gives false and changes nothing".

After the change the module cannot make such a notice, and the check is silent on it. I deleted the file.

**Near misses kept; the check fails both, each by "leaves the other notices as they were, in the same order" alone.**

- `hollow-adv-14.ts`: swap-remove.
- `hollow-adv-15.ts`: takes the notice off only when it is the newest.

**`other.ts` passed.** It finds the notice by index and puts a new list on the register (`register.notices = register.notices.filter(...)`). So the check does not demand the list be cut in place, which the ask does not say.

**Kind: it fails the brief's test.** "Could the change be written from the outline alone, without the body? If so it is not an `inside` task." It can. This edit quotes only the first line of `lift`, as the outline prints it at line 139, and needs nothing of the body:

    <<<<<<< SEARCH
    export function lift(register: Register, ref: string, day: number): boolean {
    =======
    export function lift(register: Register, ref: string, day: number): boolean {
        {
            const early = register.notices.findIndex((each) => each.ref === ref);
            if (early !== -1 && day <= register.notices[early].from) {
                register.notices.splice(early, 1);
                return true;
            }
        }
    >>>>>>> REPLACE

- I applied it to the module and graded it by PL2's check: all 85 cases passed, and it passes `tsc --strict`. I kept no file of it in W, since it is a right answer and the brief names no place for one.
- The cause: the change is a new early case. Its test (`ref`, `day`, `notice.from`) and its act (take off `register.notices`) are all in the outline, and the old body runs untouched after it.
- So a pass in the `outline-1` arm on PL2 would be the task's doing, not the arm's.
- To be `inside`, the change must alter something the old body computes, so that it cannot be put in front of the body.

For a reader of `region.md` nothing is missing: the ask and the ten lines of `lift` are enough.

## PL3 (leans): `describe`

**Breaches of its own.** The check ends `unchanged(mod, ["describe: a dated closure", "describe: a dated restriction"]);`. The second skipped case (helper lines 589 to 596) is the only one anywhere with `restriction("S-222", "s4", 0, 2, 5, 1440)`, which gives "passage 00:05 to 24:00 from day 0". PL3's own cases pin the dated lines again but not those three things.

- `hollow-adv-1.ts`: `clock` wraps the hours at 24, so 1440 reads `00:00`. PL1 and PL2 fail this same change; only PL3 passes it.
- `hollow-adv-2.ts`: `describe` writes "from the start" for a notice from day 0. `closure("S-9","s5",0,4,"breach")`: ref gives "S-9 Pennel Loop: closed from day 0, last day 3 (breach)", file gives "... closed from the start, last day 3 (breach)". The check's only notice from day 0 (line 38) is read by `lastDayIn` alone.
- `hollow-adv-3.ts`: `describe` tests `notice.to < 0`, not `=== OPEN_ENDED`. `closure("S-9","s5",-10,-3,"breach")`: ref gives ", last day -4", file gives " until further notice". The check's one notice below zero is `closure("S-9", "s5", -4, 2, "breach")`, whose `to` is 2.

**The natural wrong guess, in four forms; the check fails all four.**

- one template that prints `notice.to`;
- `notice.to` printed, with `inForce` changed to `day <= notice.to` to agree: 30 cases fail;
- `notice.to` reached by a loop;
- `notice.to`, but the first day for a one-day notice: 4 cases fail. Kept as `hollow-adv-18.ts`, the nearest of the four.

**Other near miss kept:** `hollow-adv-17.ts` does `notice.to -= 1` and prints it, so it changes the notice it is given. Only two cases fail it, and only because they use the notice again after describing it: "the day it gives is the last on which the notice is in force" and "a notice that was lifted says the last day it was in force". No case says outright that `describe` leaves its notice alone.

**Also failed and deleted:**

- a restriction gets no last day;
- a one-day notice gets none;
- the last day after the cause.

**One that passed and I do not count wrong:** no last day for a notice with `to` equal to `from`. The reference prints "closed from day 10, last day 9". The ask says "every notice that has an end date" and "the last day on which the notice is still in force", and such a notice is in force on no day. In this task the module still makes such notices, by a `lift` before the first day. The check is silent. Deleted.

**`other.ts` passed.** It is one template with no `line` variable.

**Kind.**

- **The ask does not give the fact away.** Its example, "closed from day 120, last day 131", shows no `to`. It does not put `inForce` in a code span.
- **`region.md` does not show it.** `describe`'s lines hold only `notice.to === OPEN_ENDED`.
- **The first line does not show it:** `export function inForce(notice: Notice, day: number): boolean {`. Nor does `to: number` in the outline.
- **The natural guess is wrong, and natural.** The title says "when a stoppage ends" and the ask says "add the end".
- **The whole file shows the fact plainly,** at lines 163 and 164: "`to` is the day the stretch is open again, so the notice is not in force on it."
- **A careful reader of `region.md` would see `inForce` matters,** from "still in force" beside the outline's line 162.

**The fact can be sidestepped.** Such a reader, not knowing which end `to` is, can ask the function:

    line += `, last day ${inForce(notice, notice.to) ? notice.to : notice.to - 1}`;

- I graded this: all 85 cases passed. `where.md` allows it ("A right answer may ask `inForce` which day is the last").
- So a pass in the `region` arm does not show the reader knew what the other body does, which is what question 4 is about.
- It is open because the fact belongs to an exported function that takes the very notice.

**The outline alone can also carry the edit.** Give the old function another name and wrap it:

- replace the first line of `describe` with a new `describe` that calls `describeFromDay(network, notice)`, then puts `, last day ${notice.to - 1}` before the last " (";
- follow it with `function describeFromDay(network: Network, notice: Notice): string {`.

I graded this too: 85 of 85. It still needs the fact, or the `inForce` trick above, and it is less natural than PL2's edit. But the same wrapper would open any `inside` or `leans` task whose change is a step before or after the old function.

## The module

- **Nothing broken, nothing that changes from run to run.**
  - `tsc --strict` is clean on the module, the three references and my files.
  - No clock, no random number, no import.
  - 441 lines; the longest is 120 columns (line 425); no tabs; no line the bench reads as a mark.
  - Each `plain.ts` is the module byte for byte.
- **It reads as real code.** The comments are sparse and apt, and the conventions sit in bodies: `to` is the day open again, newest first, a boat in before the shut time, rounding once for the route, n nights give n cruising days.
- **`wayRound` on a shut out-and-back route.** For a shut route that ends where it starts it gives `{start, stretches: []}`: the way round is to stay put. So `daysLost` and `extraMinutes` are 0 for any such hire. It follows the comment's words, but a yard's hires are mostly out and back, so it reads as a bug. No case pins it (wayround-ring above).
- **`overruled` and a notice that covers no day.** `overruled` says such a notice overrules older ones, though its comment says "on at least one day".
- **A dead arm in `reopens`.** In `Math.max(notice.to, at + 1)` the second arm can never win: a notice in force on `at` has `to` above `at`. Harmless.
- **`holds.py check W`** ends `all as they must be`: 0 first lines cut, no region that is only the outline.

## For the mender

- The helper needs cases for:
  - a broken route in `throughBy`, `routeFurlongs` and `routeLocks`;
  - a broken route that is open, in `wayRound`;
  - a shut route that ends where it starts;
  - a reissue refused by the restriction test;
  - a reissue for another stretch;
  - a dated notice from a day below zero, and one with `to` below -1;
  - a notice that covers no day, in `prune` and `overruled`.
- PL3's check needs 24:00, a minute below ten and day 0 pinned again, and a dated `to` below -1.
- PL1's case on changing its arguments needs a notice already over by `fromDay`, a route not in sorted order, and a first answer held across a second call.
- PL2 needs another change, or the run must accept that the outline arm can pass it.
- PL3's `inForce` sidestep is a call for whoever owns the kinds.
# Changes to AM1 to AM5, second round

Made on 2026-11-18, before any try, from the adversary's findings in `bench/runs/2026-11-18-animation/before-any-try/reports.json` ("attacks") and the fresh readers' notes there ("readers"). Each wrong answer the adversary found that passed a check is now a hollow answer of its task. Each check was mended until every hollow answer fails at an assertion. `reference.ts` and `other.ts` pass. `plain.ts` fails at an assertion. No mend made a right answer fail, so no answer was changed. No `where.md`, `reference.ts`, `other.ts` or `plain.ts` was changed. `where.md` stays true for each task.

`python3 bench/box.py check-tasks` on a copy of the set that held only AM1 to AM5 ended with `window: stub; all as they must be`.

Word counts are `wc -w` of the whole `ask.md`.

## AM1

**Check.** Three new tests.
- "grows the share linearly between the quarters too": steps of 50, 150, 100, 100, 250 and 150 ms, and x and y at each, so the share is checked at 1/16, 1/4, 3/8, 1/2, 13/16 and 1.
- "hands back at once from the middle of a hand-over, the shares adding up to the whole": hand over walk to run over 800 ms, step 400 ms, then hand back run to walk over 400 ms. The next frame of 0 ms shows run alone (x 30, y -4). Then x 25, 15 and 10 after 100, 300 and 400 ms, and 10 after that.
- "leaves another group on another property going as before": a third group plays z from 0 to 100 each second, looping. Through the hand-over and after it, z reads as its clip says each frame. The group still plays and stays on the manager.

**Hollow answers added.**
- `hollow-zero-to-only.ts`: sets `to` to 0, then cross-fades. It never sets `from` to 1. Fails the hand-back from the middle: x 15, not 30.
- `hollow-fade-in-from-zero.ts`: fades `to` from 0 and `from` from wherever it is. Fails the same way.
- `hollow-fade-all-others.ts`: fades every other group on the manager out. Fails the third-group test.
- `hollow-wavy-share.ts`: its own share curve, which meets the straight line only at quarters. Fails the test between the quarters.

**Ask.** The new tests need the ask to say two things it did not: other groups go on, and a hand-back may come before the last one ends. "Still" in "it still shows `from` alone" read as "as it was", which a hand-back from the middle makes a second reading. Other words were cut to stay at 150. 145 words before, 150 after.
- Before: "Both groups play on `manager`. They animate the same properties of the same object." After: "Both groups play on `manager` and animate the same properties of one object."
- Before: "Our own loop steps the manager each frame." After: "Our loop steps the manager each frame. Its other groups, on other properties, go on as before."
- Before: "When I call `handOver`, the object should pass smoothly from `from` to `to`." After: "`handOver` should pass the object smoothly from `from` to `to`."
- Before: "On the next frame, however short, it still shows `from` alone." After: "On the next frame, however short, it shows `from` alone."
- Before: "After `durationMs` it shows `to` alone, and it stays so." After: "After `durationMs` it shows `to` alone, and stays so."
- Before: "and the two shares always add up to the whole." After: "and the shares always add up to the whole."
- Before: "Both groups keep playing the whole time and stay on the manager." After: "Both groups keep playing throughout and stay on the manager."
- Before: "Later I may call `handOver` again the other way round." After: "I may call `handOver` again the other way round, even before the last one ends."

## AM2

**Check.** Four new tests.
- "leaves the fades of other groups going": a fade on the other group runs across the call. Its weight and x go on as that fade says: 0.75 and 26.5, then 1 and 34.
- "holds the share even where the old fade passes through it": the old fade would pass exactly through the share, then go on. The weight and x stay at the share.
- "does not let the old fade come back when another group starts a fade": a fade on the other group, started after the call, leaves this group's weight at the share.
- "does not step the manager itself, even one with a fixed step": on a manager with a fixed step of 20 ms, two calls leave both clips' `currentTime` unchanged. The next frame moves them by one step, mixed at the last share.

**Hollow answers added.**
- `hollow-refresh-now.ts`: holds the share with a fade, then calls `updateAnimationManager(manager, 0)` itself. On a fixed-step manager that moves every clip a step. Fails the fixed-step test.
- `hollow-drop-fade-hook.ts`: clears the manager's internal pre-update hook. Fails the other-group tests: no fade runs, and the old fade comes back with the next one.
- `hollow-freeze-every-fade.ts`: stops every fade on the manager. Fails "leaves the fades of other groups going".
- `hollow-pin-until-refade.ts`: an accessor pins the weight until a write of the same value. Fails "holds the share even where the old fade passes through it".

**Ask.** The new tests need the ask to say that only the loop steps the manager, and that fades of other groups go on. Other words were cut to stay at 150. 150 words before, 150 after.
- Before: "Weighted blending is already switched on for the manager. Our own loop steps it each frame." After: "Weighted blending is already on for the manager. Only our loop steps it, once a frame."
- Before: "Elsewhere in the app we fade the shares of groups over time with the library's fade." After: "Elsewhere we fade groups' shares over time with the library's fade."
- Before: "On every later frame it stays at `share`, whatever fade was under way for this group before." After: "On every later frame it stays at `share`, whatever fade was under way for this group before; fades of other groups go on."
- Before: "If I later fade this group again with the library's fade, that fade must work as usual." After: "If I later fade this group again with the library's fade, it must work as usual."

## AM3

**Check.** One new test, run on a manager with a fixed step of 20 ms and on one with none: "moves a plain task on the manager by exactly ms too". A task sums the time it is given. After `skipAhead(manager, 510)` the sum is 510 and the ramp reads 51. After one more frame, the sum and the ramp have moved by the manager's own step.

**Hollow answer added.**
- `hollow-seek-and-fade.ts`: runs the manager's internal pre-update hook with `ms`, adds `ms` to each group's `currentTime`, then updates once with no time. Clips and fades move, but a task gets 0, not 510.

The adversary's other three tries, by hand, on a copy of the manager and on a prototype view of it, already failed the check. They were not added.

**Ask.** "Everything on the manager" was followed by a list of clips and fades only, which a reader could take as the whole of it. The ask now names the tasks. 123 words before, 125 after.
- Before: "the clips and any weight fades alike" After: "the clips, the tasks and any weight fades alike"

## AM4

**Check.** One new test: "mixes a nested HUD property and a step track as the library does". The HUD is `{ x, panel: { alpha } }`. One clip has `panel.alpha` at 0.2 and a step track on x (0 for the first second, then 10). The other has `panel.alpha` at 0.8 and x at 20. With all four weights at 0.5, after 500 ms the bone reads 4, `panel.alpha` 0.5 and x 10. After 1500 ms x reads 15.

**Hollow answer added.**
- `hollow-handmix-sum.ts`: skeletal blending on one manager, and a task that writes each HUD path as the sum of weight times its own linear sample. It writes `hud["panel.alpha"]` and leaves `hud.panel.alpha` at 0.8, and it reads the step track as linear (x 12.5, not 10).

The adversary's other two tries, swapping the blend handler each frame and a character manager with no engine, already failed the check. They were not added.

**Ask.** No change. A nested object is still a plain object, and the ask already asks for the library's own weighted mix of whatever clips are given.

## AM5

**Check.** Two new tests.
- "reports a frame of no length too": updates of 0, 16 and 0 ms give `[0, 16, 0]`.
- "goes on once per update while other code fades weights on it": two groups with blending on, and a fade on each. Each update must not throw, x reads 20 then 30, and the steps are `[50, 50]`, then `[50, 50, 30]`.

**Hollow answers added.**
- `hollow-skip-empty.ts`: a task that reports only steps above 0. Fails the frame of no length.
- `hollow-hook-accessor.ts`: an accessor on the manager's internal pre-update hook. Once a fade starts, each update overflows the stack. Fails the fade test.

The adversary also found that a plain pre-update hook (`own-hook.ts`) works on the library. It passes the mended check and was not added.

**Ask.** The fade test needs the ask to name fades, not only blending. 133 words before, 138 after.
- Before: "If other code switches on weighted blending for it later, the calls to `onStep` must go on as before." After: "If other code switches on weighted blending for it later, or fades weights on it, the calls to `onStep` must go on as before."

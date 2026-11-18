# Changes to AP1 to AP6, third round

Made on 2026-11-18, before any try, from the adversary's findings in `bench/runs/2026-11-18-animation/before-any-try/reports.json` ("attacks") and the fresh readers' notes there ("readers"). Each wrong answer the adversary found that passed a check is now a hollow answer of its task. The writer's hollow answers are kept. Each check was mended until every hollow answer fails at an assertion. `reference.ts` and `other.ts` pass. `plain.ts` fails at an assertion. No mend made a right answer fail, so no answer was changed. No `where.md`, `reference.ts`, `other.ts` or `plain.ts` was changed. `where.md` stays true for each task.

`python3 bench/box.py check-tasks` on a copy of the set that held only AP1 to AP6 ended with `window: stub; all as they must be`.

Word counts are `wc -w` of the whole `ask.md`.

Two answers the adversary tried pass, and it did not count them as wrong. They are not added, and each passes the mended check: in AP1, a looping group that a timer stops at the end (`loop-timer.ts`); in AP2, a new one-shot group for each press (`new-oneshot.ts`). Its other tries already failed the check and were not added: AP3 `shared-clock.ts`, AP5 `latch.ts`, AP6 `inclusive-end.ts`, `pingpong.ts` and `seek.ts`.

## AP1

**Check.** Two new tests.
- "keeps a duration that is no whole number of frames": a fade of 110 ms, which is 6.6 frames at 60 per second. Steps of 11 ms read 0.1, 0.2, 0.3, 0.4 and 0.5, with the group playing. After 110 ms alpha is 1. After 1 ms more the group is no longer playing. The check waits that 1 ms because a right answer may keep its end in 32-bit or 64-bit time.
- "leaves alpha to us once the fade is over": after a 200 ms fade ends, the test sets alpha to 0.4. It stays 0.4 for six updates, and while a later fade of another panel runs on the same manager.

**Hollow answers added.**
- `hollow-rounded-frames.ts`: keys on whole frames at 60 per second, so a 110 ms fade lasts 116.7 ms. Fails the new duration test: 0.0943, not 0.1.
- `hollow-pin.ts`: a one-shot fade, and a task that writes alpha 1 on every update once the fade is over, for good. Fails the new test: alpha is 1, not 0.4.

**Ask.** "After that it stays at 1" could mean that the fade keeps alpha at 1 for good. The new test needs the ask to say that alpha is the app's once the fade is over. 107 words before, 112 after.
- Before: "and after that it stays at 1." After: "and after that it stays at 1 until we set it ourselves."

## AP2

**Check.** Two new tests.
- "starts the pulse over at once on a press during a pulse": a press 0.1 s into a pulse, then 100 ms steps, reads 1.25, 1.5, 1.25, 1, 1, 1. So does a press 0.3 s in, on the way down. Two presses 50 ms apart read 1.125, then a whole pulse from its beginning.
- "rests at 1 after a pulse whatever the frame length": one pulse in steps of 30 ms, read at each step and at 1 once it is over; then a pulse in steps of 70 ms: 1.175, 1.35, 1.475, 1.3, 1.125, 1, 1.

**Hollow answers added.**
- `hollow-debounce.ts`: ignores a press while a pulse plays. Fails the press during a pulse: 1.5, not 1.25.
- `hollow-queue.ts`: keeps a press made during a pulse and plays it once the pulse is over. Fails the same way.
- `hollow-loop-timer.ts`: a looping group that a task pauses 0.4 s after the press. With 30 ms steps it rests at 1.05. Fails the frame-length test.

**Ask.** A fresh reader could not tell what a press during a pulse must do: start over, or add another. The check now tests it. 126 words before, 133 after.
- Before: "Every press plays one pulse from its beginning, on `manager`, which we update ourselves every frame." After: "Every press, even one during a pulse, starts one pulse from its beginning at once, on `manager`, which we update ourselves every frame."

## AP3

**Check.** Two new tests.
- "leaves the height as it is until the next update after a new strength": a new strength set at the peak, on the way down, and at rest leaves `y` exactly as it was until the next update. Each update after that follows the new strength.
- "keeps the rest height it had when startHover was called": the test moves `y` from 2 to 3 right after `startHover`, before any update. The bob stays around 2, and at strength 0 the pickup sits at 2.

**Hollow answers added.**
- `hollow-at-once.ts`: a helper plays the offset, and a task writes rest plus strength times offset; the setter writes the new height at once. Fails the new-strength test: 2.25, not 2.5.
- `hollow-blend-at-once.ts`: the reference's two weighted groups, and the setter rescales the height at once. Fails the same way.
- `hollow-lazy-rest.ts`: reads the rest height at the first update. Fails the rest-height test: 3.1, not 2.1.

**Ask.** "Takes effect from the next update" can be read as "by the next update at the latest". The check now tests that nothing changes before it. Same word count: 149 before and after.
- Before: "A new strength takes effect from the next update and does not restart the bob." After: "A new strength first shows at the next update and does not restart the bob."

## AP4

**Check.** `line` now returns the group it makes. Two new tests. In each, the check reads the library's state: every group on the released property must be off the manager or not playing, and every other group must be on the manager and playing.
- "stops groups on the property that sit next to each other on the manager": three groups on crate `position.x`, made one after the other, then one on crate `position.y` and one on barrel `position.x`. After release, the test sets x to 42. It stays 42, and y and the barrel go on as their clips say.
- "stops groups on the property that other code blends by weight": blending is on. Two groups on crate `position.x` are at weight 0.5 each, and the barrel's group at 0.5. Before release x is the weighted sum. After release x stays 42, and the barrel goes on at half its clip.

**Hollow answers added.**
- `hollow-remove-in-loop.ts`: removes each matching group while it walks the manager's own list, so it skips the group after each one it removes. Fails both new tests: a matching group is still on the manager and playing.
- `hollow-pause.ts`: pauses each matching group. A paused group still writes when it is blended. Fails the blend test: x is 3, not 42.
- `hollow-weight-zero.ts`: turns blending on and sets each matching group's weight to 0. The groups stay on the manager and playing, so it fails both new tests at the state check. Turning blending on also changes how other groups with a weight below 1 are written.

**Ask.** The blend test needs the ask to say that other code may blend the groups. 135 words before, 140 after.
- Before: "were made by other code from property animation clips, and we update the manager ourselves every frame." After: "were made by other code from property animation clips, some perhaps blended by weight, and we update the manager ourselves every frame."

## AP5

**Check.** Two new tests.
- "starts each beacon's rhythm when that beacon starts": a beacon on period 1 starts, and after 0.3 s a second beacon on period 1 starts at strength 0.5. After 0.35 s more, a third beacon on period 0.6 starts. Each flashes from its own start, and the others go on as before.
- "leaves the lamp as it is until the next update after a new strength": a new strength set at a peak, on the way down and on the way up leaves the lamp exactly as it was until the next update.

**Hollow answers added.**
- `hollow-shared-clock.ts`: one clock for each manager drives every beacon on it, so a beacon's rhythm counts from the first beacon. Fails the start test: 0, not 0.25.
- `hollow-at-once.ts`: a helper plays the flash, and a task scales it into the lamp; the setter writes the lamp at once. Fails the new-strength test: 0.5, not 1.

**Ask.** As in AP3. Same word count: 144 before and after.
- Before: "A new strength takes effect from the next update and must not shift the rhythm." After: "A new strength first shows at the next update and must not shift the rhythm."

## AP6

**Check.** One new test: "starts a track made later at its own first key, and keeps its group playing". One track starts, and a second one, with other keys and a dotted path, starts 0.45 s later. Each follows its own keys from its own start, in steps of 90 ms, which never land on a loop's end. Both groups stay on the manager, and both read `isPlaying` true after each update.

**Hollow answer added.**
- `hollow-shared-clock.ts`: one clock for each manager; each update a task seeks the track's group to that clock, wrapped to its keyed span. A track started later reads 6.6, not 3.35. Its group also stops playing, since a seek pauses it.

**Ask.** No change. "The motion starts at the first key" already covers a track started later. The readers' two doubts, whether to count frames from the first key and whether to call play, are both left open by the check.

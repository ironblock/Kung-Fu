# AG1 — where

**Behaviour.** `goToFrame` seeks a glTF clip with the clip's own `loopAnimation` flag, so on a looping clip a seek to the last frame wraps to the first frame: the start pose is shown and `currentTime` reads 0.

**What the reader would answer, and why.** It would write `goToFrame(group, group.duration * frameRate)`. In Babylon.js, `AnimationGroup.goToFrame` clamps the frame to the keys' range, so seeking to the last frame shows the last pose whether the group loops or not. Nothing in the bare signature `goToFrame(group, frame, engine?)` hints that looping changes a seek. A reader who sets `currentTime` and pauses instead meets the same wrap on the next frame.

**Where it is decided.**
- `babylon-lite/packages/babylon-lite/src/animation/animation-group.ts` lines 129-136: `syncControllerFromGroup` copies `group.loopAnimation` into the controller.
- same file, lines 168-183: `goToFrame` seeks a glTF clip by syncing that state and running a zero-length controller step (line 179), not by a clamped evaluation (property clips take the `_evaluate` branch at line 175, which clamps).
- same file, lines 141-147: `tickAnimationCore` runs the same sync and step on every frame, also for a paused clip, so the wrap is applied again each frame.
- The wrap arithmetic it relies on: `src/skeleton/skeleton-updater.ts` lines 282-292 (`ctrl.loop` → `startTime + ((time - startTime) % duration)`).

The fix the reference uses: set `loopAnimation = false` before the seek, so the same step clamps to the end.

**Makers' unit test.** None. `tests/lite/unit/property-animation.test.ts`, "seeks property clips across the full key domain instead of the active play range", pins the clamped seek of property clips only.

**comment: no.** The doc comment of `goToFrame` reads "Seek to a specific frame, apply the pose, and pause." and the one of `loopAnimation` reads "Whether animation loops (default true)."; neither says that a seek on a looping clip wraps.

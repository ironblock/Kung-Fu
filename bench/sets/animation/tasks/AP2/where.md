# AP2 where

**Behaviour.** When a one-shot property group finishes, its time stays at the end of its range; playing it again resumes from there, so it ends again at once instead of starting over.

**What the reader would write, and why.** It would make the group on the first press (with `loop: false`) and call `playAnimation(group)` on every later press. In Babylon.js, `AnimationGroup.play()` on a group that has ended starts it again from its `from` frame, because the ended group is no longer started and `play` falls through to `start`. Nothing in the names says that Lite's `playAnimation` only sets flags. Here the second press does nothing visible: the group is put back to playing at its end time, the first update clamps it to the end, writes the end value (1) and stops it again.

**Where it is decided.** `babylon-lite/packages/babylon-lite/src/animation/property-animation.ts`, lines 177-199: the controller's `tick` clamps the time to `[fromTime, toTime]` (line 192) and, at the end, only clears `playing`, `isPlaying` and sets `_stopped` (lines 195-198); it never moves the time back. `playAnimation` in `animation-group.ts` (lines 112-115) only sets `isPlaying` and clears `_stopped`, so the next update starts from the end time.

**Makers' unit test.** None tests a replay after a finish. Nearest, in `tests/lite/unit/property-animation.test.ts`: "wraps exactly at a nonzero loop boundary and completes non-looping ranges" (a finished one-shot stays at its end and stops writing) and the last lines of "seeks property clips across the full key domain instead of the active play range" (a group played while its time is past its range end is clamped to the end and stops at once, under the blending mixer).

**comment: no.** `playAnimation` says only "Start playing an animation group." `stopAnimation` says "Stop playback and reset to the first authored frame.", which hints at a fix but does not say that play leaves a finished group at its end.

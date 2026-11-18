# AG3 — where

**Behaviour.** `goToFrame` pauses the clip it seeks (it sets `isPlaying = false`), so a clip that was playing stops advancing after the seek until it is played again.

**What the reader would answer, and why.** It would write `goToFrame(group, frame)` and nothing else, expecting a playing clip to carry on from the new frame. That is what Babylon.js `AnimationGroup.goToFrame` does: it moves the animatables and leaves them running. A reader who remembers that Babylon.js's `goToFrame` does nothing on a group that has not started writes the Babylon.js order `playAnimation(group); goToFrame(group, frame)`, and the seek still leaves the clip paused. Only "seek, then play" (or setting `currentTime` alone) works.

**Where it is decided.**
- `babylon-lite/packages/babylon-lite/src/animation/animation-group.ts` lines 168-183: `goToFrame` sets `group.isPlaying = false` at line 172 and pushes that into the controller (line 174) before applying the pose.
- same file, lines 141-147: on the next frame `tickAnimationCore` copies `isPlaying = false` into the controller again, so time does not advance (glTF controller: `src/skeleton/skeleton-updater.ts` line 278; property controller: `src/animation/property-animation.ts` lines 177-180).

**Makers' unit test.** `tests/lite/unit/property-animation.test.ts`, "updates a Babylon-style position.x frame animation without a scene or engine" (after `goToFrame(group, 0)` an update of 1000 ms leaves the value at frame 0), and "does not rewrite paused property tracks but still applies explicit seeks".

**comment: yes.** The doc comment of `goToFrame` reads: "Seek to a specific frame, apply the pose, and pause."

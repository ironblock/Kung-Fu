# AG2 — where

**Behaviour.** A paused glTF clip is still stepped on every frame and rewrites its pose onto the nodes it animates; only a stopped clip leaves them alone, and stopping rewinds `currentTime` to the start.

**What the reader would answer, and why.** It would freeze with `pauseAnimation(group)` and resume with `playAnimation(group)`. In Babylon.js a paused `Animatable` returns early and writes no values, so a node a paused group animates keeps whatever the user sets. The names `pauseAnimation` / `playAnimation` match that model, and nothing in their signatures says a paused clip keeps writing. A reader who does reach for `stopAnimation` would still lose the frozen moment unless it saves `currentTime` and puts it back, since stopping rewinds.

**Where it is decided.**
- `babylon-lite/packages/babylon-lite/src/animation/animation-group.ts` lines 117-120: `pauseAnimation` only sets `isPlaying = false`.
- same file, lines 122-127: `stopAnimation` also sets `_stopped` and rewinds `currentTime` to `_startTime ?? 0`.
- same file, lines 141-147: `tickAnimationCore` steps any clip that is not `_stopped`, so a paused clip is stepped every frame (the scene's frame reaches it through lines 155-160).
- The step it calls evaluates the channels and writes the node TRS whether or not the clip is playing: `src/skeleton/skeleton-updater.ts` lines 278-280 (time only advances when playing), 295 onward (rest pose, channels) and 380-395 (writes `position`, `rotationQuaternion`, `scaling`).

**Makers' unit test.** None pins the rewrite. `tests/lite/unit/scene-animation-tick.test.ts`, "does not advance a paused group", only pins that the time does not move. `tests/lite/unit/property-animation.test.ts`, "does not rewrite paused property tracks but still applies explicit seeks", pins the opposite for property clips.

**comment: no.** `pauseAnimation` is documented "Pause playback of an animation group." and `stopAnimation` "Stop playback and reset to the first authored frame." The internal field `_stopped` carries "Whether stop() was called (suppresses tickAnimation)", which says what stop does but not that a paused clip goes on writing its pose.

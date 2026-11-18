# AG4 — where

**Behaviour.** `playAnimation` resumes from the clip's `currentTime` and never rewinds, so on a one-shot that has run to its end it plays nothing: the time stays at the end (a property clip re-finishes at once, a glTF clip stays clamped at its end).

**What the reader would answer, and why.** It would write `playAnimation(group)`. In Babylon.js, a non-looping group that reaches its end is no longer started, and `play()` on it starts it again from its `from` frame, so `play()` is how one replays a finished clip. The bare signature `playAnimation(group)` gives no sign that it only resumes.

**Where it is decided.**
- `babylon-lite/packages/babylon-lite/src/animation/animation-group.ts` lines 111-115: `playAnimation` sets `isPlaying = true` and clears `_stopped`, and leaves `currentTime` where it is.
- same file, lines 141-147: each step copies that `currentTime` into the controller (line 131) before advancing.
- same file, lines 122-127: only `stopAnimation` rewinds `currentTime` (to `_startTime ?? 0`), which is what the reference relies on.
- The clamp a finished clip then meets: `src/animation/property-animation.ts` lines 191-199 (clamp to the range end, then stop again) and `src/skeleton/skeleton-updater.ts` lines 290-292 (clamp to the clip end).

**Makers' unit test.** `tests/lite/unit/property-animation.test.ts`, "seeks property clips across the full key domain instead of the active play range": its last lines play a clip whose time is past its range, and it finishes at once at the range end (`currentTime` 1.5, `isPlaying` false).

**comment: no.** `playAnimation` is documented "Start playing an animation group." Nothing carried into the declarations says that it resumes from the current time or that a finished clip is not rewound.

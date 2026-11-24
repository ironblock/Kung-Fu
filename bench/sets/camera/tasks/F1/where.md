# F1: where the turn glide is cut off

**The behaviour.** The free-camera controls stop the mouse-look glide once the per-frame turn falls below `camera.speed * 0.001`, so raising `camera.speed` shortens or kills the turn glide and the same drag turns the camera much less.

**The answer the reader would give, and why.** It sets `camera.speed` to 20 times its value and calls `attachFreeControl`. In Babylon.js `speed` scales only movement; mouse look depends on `angularSensibility` and `inertia` alone, and nothing in `names/` ties the two together. With speed 40 the cut-off is 0.04 rad per frame, so the glide stops after a frame or two; in the check the look direction ends 0.40 rad away from where the default controls leave it after the same drag.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/`:
- `free-camera-controls.ts`, lines 133-156: `moveEpsilon` and `rotEpsilon` are both `camera.speed * 0.001` (lines 134-135); the rotation accumulators are zeroed below `rotEpsilon` (lines 151-156). Line 77: movement is `camera.speed * ...`.
- `configurable-free-camera-controls.ts`, lines 132-154: the same cut-off (line 134). Line 82: `fastMultiplier` scales movement without touching `camera.speed`, which is how the reference stays exact (every movement key listed as a fast key).

**The makers' unit test that pins it:** none.

**comment: no.** The field comment on `speed` in `free-camera.ts` (line 22) says only "Movement speed. Default 2.0 (matches BJS)."

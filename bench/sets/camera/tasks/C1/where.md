# C1: where the size of a wheel notch is decided

**Behaviour.** The default wheel zoom is proportional to the current radius: a notch adds `deltaY · radius / (wheelPrecision · 1000)` to the zoom momentum, so the same notch moves a far camera four times as far as one a quarter of the distance away.

**What the reader would answer, and why.** It calls `attachControl` and leaves the wheel alone, perhaps tuning `wheelPrecision` once. In Babylon.js the arc-rotate wheel input is linear by default (`wheelDeltaPercentage` is 0, the offset is `wheelDelta / (wheelPrecision · 40)`), and only a non-zero `wheelDeltaPercentage` makes it proportional to the radius. `names/arc-rotate.d.ts` shows only `wheelPrecision: number` and no percentage field, so nothing suggests the zoom scales with distance. Its camera zooms 4x too far at radius 40.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/arc-rotate-controls.ts`:
- lines 351-357, `onWheel`: line 356, `camera.inertialRadiusOffset -= (e.deltaY * camera.radius) / (camera.wheelPrecision * 1000)`. The inline comment at lines 354-355 ("Scale by current radius for logarithmic zoom feel") is in the body, not a doc comment.
- lines 448-454: the per-frame zoom inertia applies and decays that offset without reference to the radius.

**The makers' unit test that pins it:** `tests/lite/unit/arc-rotate-controls.test.ts`, "reads wheelPrecision LIVE, so a value set after attachControl takes effect". It pins the formula at a single radius (10 → -0.4); no case compares two radii.

comment: no. The doc comment on `wheelPrecision` in `arc-rotate.ts` (line 43) says only "Wheel-zoom sensitivity (HIGHER = slower zoom). Babylon default 3."

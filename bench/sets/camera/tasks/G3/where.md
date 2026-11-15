# G3: where an interrupted flight's promise is decided

**Behaviour.** `flyGeospatialCameraToAsync`'s promise never rejects: a flight cut short by a newer flight (or by user input through the controls) resolves exactly like one that landed.

**What the plain answer gets wrong, and why.** It returns `true` after the `await` and `false` from a `catch`. Promise-returning animations commonly reject when cancelled, and in this very library `interpolateArcRotateCamera` rejects when a superseding interpolation or other change interrupts it; the declaration `Promise<void>` cannot say which. So an interrupted flight yields `true` and the app would open the info panel of a place the camera never reached.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/`:

- `geospatial-camera-fly.ts`, line 76: a new flight calls `camera._cancelFly?.()` first; lines 97 and 131-140: the promise is built with `resolve` only, and `finish` (the cancel hook, set at line 142) removes the driver and calls `resolve()`;
- `geospatial-camera-controls.ts`, lines 480-481: user input calls the same `_cancelFly`.

The right answer checks, after the `await`, whether the camera's pose is the place's pose.

**The makers' unit test that pins it:** none (`tests/lite/unit/geospatial-fly.test.ts` tests only landing and easing).

**comment: yes.** The doc comment on `flyGeospatialCameraToAsync` (lines 70-72): "The returned promise resolves when the flight completes; it also resolves early if the flight is interrupted (by user input through `attachGeospatialControls`, or by a subsequent `flyGeospatialCameraToAsync` call)."

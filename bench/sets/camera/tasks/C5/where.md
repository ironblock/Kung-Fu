# C5: where the moment the goal is read is decided

**Right answer:** `{ "rejects": false, "finalRadius": 7, "finalTargetX": 5 }`. `proof.test.ts` shows it on the library.

**Behaviour.** The transition reads its goal (including `goal.target`) and the held channels from the camera on its first frame, not at the call, and checks for outside interference only from the second frame on; so writes to the camera or to the goal vector made after the call but before the next frame are silently taken in.

**What the reader would answer, and why.** Most likely `{ "rejects": true, ... }` or `{ "rejects": false, "finalRadius": 10, "finalTargetX": 1 }`. From Babylon.js's `interpolateTo` it expects the goal to be captured when the call is made (vectors copied), and a direct pose write to cancel a running transition or be overridden by it; the stripped doc comment even says the target "is copied, not retained, so the caller may reuse the vector afterwards". Nothing in the signature hints at a deferred read.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/`:
- `camera/arc-rotate-interpolate.ts`, lines 87-90: only whether each field is present is decided at the call. Lines 110-132: on the first frame (`first`) the goal values are read, at lines 127-132 (`goal.target!.x` etc. at 130-132), and omitted channels take the camera's value at that moment (line 129 for radius). Lines 133-144: the interference check runs only in the `else` branch, from the second frame.
- `animation/frame-interpolation.ts`: `runFrameInterpolation` pushes the driver to `_beforeRender`; the step first runs on the next frame.

**The makers' unit test that pins it:** none. "holds channels whose goal fields are omitted" pins held channels, but never writes between the call and the first frame.

comment: no. The doc comment on `ArcRotateInterpolationGoal` (lines 9-12) says an omitted field "keeps the camera's current value" and that `target` "is copied, not retained, so the caller may reuse the vector afterwards", which the deferred copy contradicts.

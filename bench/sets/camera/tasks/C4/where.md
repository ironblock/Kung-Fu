# C4: where the direction of an alpha transition is decided

**Behaviour.** `interpolateArcRotateCamera` moves alpha along the shortest arc to the goal (the difference is taken modulo 2π into [-π, π]) and then snaps alpha to the raw goal value, so a goal of `alpha + 1.5π` turns the camera a quarter-turn backwards and a goal of `alpha + 2π` resolves on the first frame with alpha jumping by 2π.

**What the reader would answer, and why.** It makes one call with `{ alpha: camera.alpha + 2π · turns }`. In Babylon.js `interpolateTo` the reader expects the angle to be eased like the other channels, value to value, and the signature (`alpha?: number`) does not say the angle wraps. For 0.75 turns the camera goes the wrong way; for 1 and 2 turns it does not move at all and alpha jumps in one frame.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/`:
- `camera/arc-rotate-interpolate.ts`, line 153: `camera.alpha = lerpAngleShortest(camera.alpha, clampedAlpha, t)`; line 163: the remaining distance is measured the same way; lines 171-178: the snap writes `camera.alpha = clampedAlpha`, the raw goal.
- `math/damp.ts`, lines 52-61: `lerpAngleShortest` folds the delta into [-π, π].

**The makers' unit test that pins it:** `tests/lite/unit/arc-rotate-interpolate.test.ts`, "takes the shortest arc for alpha across the +/-PI wrap".

comment: yes. On `ArcRotateInterpolationGoal.alpha` (`arc-rotate-interpolate.ts`, line 15): "Goal orbit angle (radians). Interpolated along the shortest arc." Not in `names/`, which has comments stripped.

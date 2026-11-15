# B4: where the tilt is decided

**What the plain answer gets wrong.** It assigns `camera.pitch`. The camera clamps pitch to an effective maximum that depends on the zoom. With the default limits, that maximum falls from `pitchMax` at 2x the planet radius to `pitchMin` (0.001) at 4x. A new camera starts at 4x, so the camera stays looking straight down and `camera.pitch` reads 0.001. Later radius changes clamp the pitch again in the same way.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/`:

- `geospatial-camera.ts`, lines 242-245: `applyOrientation` clamps `pitch` to `[limits.pitchMin, getEffectivePitchMax(limits, radius)]`. It runs on every write to `yaw`, `pitch`, `radius` or `center` (the setters at lines 313-339). Lines 344-346 give the default resting pose, at `radiusMax` = 4x the planet radius.
- `geospatial-limits.ts`, lines 20-26: the doc comment on `pitchDisabledRadiusScale` ("`y` = radius scale at which pitch is fully disabled (forced to `pitchMin`). `null` disables this feature"). Line 44 sets the default `{ x: 2, y: 4 }`. Lines 56-72: `getEffectivePitchMax` returns `pitchMin` at or beyond `y·planetRadius`.

**The makers' unit tests that pin it** (`babylon-lite/tests/lite/unit/geospatial-math.test.ts`):

- "getEffectivePitchMax disables pitch as the camera zooms out" (describe "geospatial limits")
- "keeps the eye outside the planet at a sample tilted pose", which first sets `cam.radius = 150` with the comment "within full-pitch range"
- "rests looking straight down at (planetRadius,0,0) from radiusMax", which pins the start at 4x

**Does a comment in `src` say it?** Yes: the doc comments on `pitchDisabledRadiusScale` and `getEffectivePitchMax` in `geospatial-limits.ts`. The comment on the `limits` field in `geospatial-camera.ts` says the clamping applies on the next orientation change.

# B1: where the zoom range is decided

**What the plain answer gets wrong.** It writes `camera.lowerRadiusLimit` and `camera.upperRadiusLimit` straight onto the camera and calls `attachControl`. Nothing reads those two fields on their own. The camera stays at radius 10 when the range is 2 to 6, the wheel zooms past the limit, and a pinch sets the radius to anything.

**What decides it, in `babylon-lite/packages/babylon-lite/src/camera/`:**

- `arc-rotate.ts`, lines 53-64: the limit fields. Their doc comment opens with "enforced by attachControl's per-frame loop", which is misleading, then says to set them through `setCameraLimits` so that the pose is clamped. Lines 66-74 describe the `_clampToLimits` hook. Lines 160-178 are the alpha/beta/radius setters, which call `cam._clampToLimits?.()` (line 172). The hook is undefined until `setCameraLimits` installs it.
- `arc-rotate-controls.ts`, lines 97-121: `clampCameraToLimits` is the only code that reads the limit fields. Lines 146-181: `setCameraLimits` stores the bounds, installs the hook, clamps at once (line 174) and returns a disposer that removes the hook. Lines 202-203 are the comment on `attachControl`: "Orbit/zoom limits are entirely opt-in via setCameraLimits; the camera self-clamps in its setters, so this loop carries no limit code." Lines 448-454 are the wheel-zoom inertia, and lines 396-401 the pinch write. Neither one clamps anything.

**The makers' unit tests that pin it** (`babylon-lite/tests/lite/unit/arc-rotate-controls.test.ts`, describe "setCameraLimits + clamping"):

- "blocks wheel zoom-out past the upper radius limit, never overshooting on any frame (no jiggle)"
- "does NOT clamp the pinch write when no limits were set (opt-in: zero clamp code in the gesture)"
- "clamps the current radius into range immediately (no jump on the next frame)"

**Does a comment in `src` say it?** Yes: the doc comment on the limit fields in `arc-rotate.ts`, and the doc comments on `setCameraLimits` and `attachControl` in `arc-rotate-controls.ts`.

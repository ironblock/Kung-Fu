# B5: where "visible" is decided

**What the plain answer gets wrong.** It treats the result's `clipped` flag as "not on screen". `clipped` also comes out true when the point's depth falls outside the near-far range. A mountain beyond the far plane is therefore reported invisible, even though it sits inside the picture rectangle. The flag that answers "inside the picture and in front of the camera" is `offscreen`.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/world-to-screen.ts`:

- Lines 23-37: the `ScreenProjectionResult` doc comments. `clipped` is "True when the point is outside any WebGPU clip plane or is non-finite". `offscreen` is "True when the point cannot appear inside the viewport's 2D rectangle, including negative clip W".
- Lines 138-141: `offscreen = behindCamera || clipW < 0 || outsideXY`, and `clipped = offscreen || ndcZ < 0 || ndcZ > 1`.
- Lines 84-86: the doc comment on `projectWorldToScreenToRef`. Coordinates are not clamped, and finite off-screen points keep their extrapolated positions for edge indicators.

**The makers' unit tests that pin it** (`babylon-lite/tests/lite/unit/world-to-screen.test.ts`, describe "world-to-screen projection"):

- "distinguishes depth-only clipping from XY offscreen behavior": a point out of depth range has `clipped: true` and `offscreen: false`
- "retains extrapolated coordinates for finite XY-offscreen points"

**Does a comment in `src` say it?** Yes: the field comments on `ScreenProjectionResult`. They are terse, though, and only line 141 shows that depth alone sets `clipped`.

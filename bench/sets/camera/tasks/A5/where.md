# A5: what a viewport past the canvas edge resolves to

**The behaviour.** `resolveCameraViewport` clamps the normalized viewport's edges into the canvas before converting to pixels, while `getEffectiveAspectRatio` keeps using the unclamped `width / height`, so a viewport that hangs over the edge gives a cut-down pixel rectangle (here 200 × 150, aspect 1.33) that is drawn with the full viewport's aspect (2): the frame and the picture do not match.

**What the reader would answer, and why.** It converts the Babylon.js way, as `Viewport.toGlobal` does, with only the flip from Babylon's bottom-up `y` to WebGPU's top-down `y`: `x = 800`, `y = (1 - 0.1 - 0.3)·500 = 300`, `width = 0.3·1000 = 300`, `height = 150`, `aspect = 2·(0.3/0.3) = 2`. Babylon.js does not clamp a camera viewport, and `names/viewport.d.ts` shows only `resolveCameraViewport(camera, targetWidth, targetHeight): PixelViewport`. So it gets `width` wrong (300, not 200). A reader that guesses a clamp is tempted to recompute the aspect from the clamped rectangle (1.33) and gets `aspect` wrong instead.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/`:
- `viewport.ts`, lines 14-16: `clamp01`; lines 20-31: `resolveCameraViewport` clamps `x0`, `y0`, `x1`, `y1` into [0, 1] (lines 22-25), then floors the start and ceils the end.
- `camera.ts`, lines 236-239: `getEffectiveAspectRatio` returns `(targetWidth / targetHeight) * (v.width / v.height)` with no clamp.

**The makers' unit test that pins it:** none. (`world-to-screen.test.ts`, "derives the active normalized camera viewport with existing public helpers", uses a viewport inside the canvas.)

**comment: no.** The doc comment on `resolveCameraViewport` says "Resolve a Babylon-style normalized viewport to integer render-target pixels. Babylon viewport y is normalized from the bottom; WebGPU viewport/scissor y is from the top." It says nothing of clamping. The comment on `getEffectiveAspectRatio` says "Returns the render-target aspect ratio adjusted for the camera's normalized viewport".

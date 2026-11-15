# What I did

Reading only. I ran no test, script, node or vitest, and no byte or JSON checker.

Read in full: every file in `babylon-lite/packages/babylon-lite/src/camera` (17 files), plus `names/camera.d.ts`.
Read partly, to confirm a claim: `src/math/write-perspective-mat4-lh-into-buffer.ts`, `src/math/write-ortho-off-center-mat4-lh-into-buffer.ts`, `src/math/write-look-at-world-mat4-lh-into-buffer.ts` (first 60 lines), `src/math/damp.ts` (`expDampFactor`), `src/animation/frame-interpolation.ts`, `src/scene/world-matrix-state.ts` (lines 165-215), `src/scene/scene-core.ts` (the `_update` loop over `_beforeRender`).
Unit tests: only the `describe`/`it` titles of arc-rotate-controls, arc-rotate-interpolate, free-camera-controls, banked-free-camera, geospatial-fly, orthographic-camera, camera-projection-params and camera-replacement-caches tests, to check direction claims (pinch, superseding interpolation).

Each note has an `id` (n01..n57 in the order written; the list is reordered by need) and a `from` (file and lines read).

# What I did not look at

- The bodies of the unit tests. I did not read geospatial-controls, geospatial-math, geospatial-movement, world-to-screen or keyboard-input tests at all.
- `names/` beyond `camera.d.ts`, so a few notes may repeat what a declaration already says.
- `app/` and `app/checks/helpers.ts`.
- `ObservableVec3`, `createPickingRay`, `lerpAngleShortest`, `syncCameraFloatingOrigin`, `onSceneDispose`, `disposeScene`.
- Floating-origin (LWR) and HPM matrix behaviour, beyond the comments in `camera.ts`.
- The right-handed build (`#coordinate-system`): n56 comes from comments and sign flips only.

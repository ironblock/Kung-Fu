# What I did

Read only. I ran no test, no script, no node, no vitest. Bash was used only to list files, count lines and print source files.

Read in full: every file in `babylon-lite/packages/babylon-lite/src/camera/` (17 files), and the `names/` declarations for camera, arc-rotate, free-camera, geospatial-camera and viewport. That showed that the declarations carry no comments and no default values, so facts that appear only in doc comments or initialisers count as not given away.

Read outside `src/camera` to check claims the notes depend on: `animation/frame-interpolation.ts`, `math/damp.ts`, `math/write-perspective-mat4-lh-into-buffer.ts`, `math/write-ortho-off-center-mat4-lh-into-buffer.ts`, `math/observable-vec3.ts` (first 64 lines), `scene/world-matrix-state.ts` (first ~150 lines).

Tests: read `tests/lite/unit/world-to-screen.test.ts` lines 1-155 and `arc-rotate-controls.test.ts` lines 1-300; read the `describe`/`it` titles of arc-rotate-controls, arc-rotate-interpolate, banked-free-camera, free-camera-controls, geospatial-*, orthographic-camera, world-to-screen and camera-projection-params tests.

# How notes were chosen and ordered

A note was kept when it states a default, sign, unit, order, clamp or precondition that the declarations do not show and that a Babylon.js user would assume differently. Ordered by likely use (ArcRotateCamera + attachControl + limits first, then aspect/viewport/world-to-screen, ortho, interpolation, geospatial, free camera) and by how badly the wrong assumption fails (silently ignored settings first).

Ids n01..n57 are in writing order. One draft (n05, FreeCamera defaults) was dropped after I saw they match Babylon.js, so n05 is missing on purpose.

Several notes are reasoned from source, not seen in a test: n06 (assigning a new target object), n18/n20 (assigning camera.ortho directly), n37 (_yaw/_pitch staleness), n41 (controls ignore upVector), n43 (setter order with pitch clamp).

Byte length of each note was estimated by eye, not measured (no script was run); the longest are about 230 bytes.

# Not looked at

`app/` (including `app/checks/helpers.ts`), the rest of the scene code (how `scene.camera` is used, `onSceneDispose`, `disposeScene`), `picking/ray.ts`, `math/vec3-ref.ts`, the right-handed build (`#coordinate-system`) beyond noting its branches, the bodies of most unit tests, and the unit tests not named above (playroom, trogir, csm, taa, gltf-feature-camera, camera-floating-origin-mode, camera-replacement-caches, shadow-camera-facade). `_applyCameraViewport` and the geospatial-movement helpers got no notes.

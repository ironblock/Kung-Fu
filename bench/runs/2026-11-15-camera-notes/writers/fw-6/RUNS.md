# RUNS

## What I did
- Read WRITER.md, then every file in babylon-lite/packages/babylon-lite/src/camera in full (all 17 files).
- Followed the helpers the camera code leans on: animation/frame-interpolation.ts, math/damp.ts (expDampFactor, dampScalar, lerpAngleShortest), math/write-perspective-mat4-lh-into-buffer.ts, math/write-ortho-off-center-mat4-lh-into-buffer.ts, math/write-look-at-world-mat4-lh-into-buffer.ts (first half), math/observable-vec3.ts (setters only, by grep), scene/world-matrix-state.ts and scene/scene-core.ts (grep for markLocalDirty and _beforeRender only).
- Read the names/ declarations for free-camera, camera and arc-rotate, to see what the reader already has (no comments there, so doc-comment facts count as new to them).
- Listed test titles of the makers' unit tests for arc-rotate controls, interpolation, free-camera controls, orthographic, banked free camera, projection params and the four geospatial tests; read the body of the free-camera-controls test (custom keys, speed formula) and the orthographic reverse-Z test.
- Wrote 50 notes to facts.json, ids in writing order, then ordered by how likely a developer depends on the thing and how far wrong they go without it.

## What I ran
- No tests, no node, no vitest, no app code.
- One shell command (grep/awk) over notes/facts.json itself to count note lengths against the 240-byte limit. Nothing in the library or app was run.

## What I did not look at
- app/ (src, checks/helpers.ts) apart from its listing.
- Most test bodies; the remaining camera-related tests (pointer-input, keyboard-input, gamepad, csm-*, taa, gltf-feature-camera, playroom, trogir, camera-floating-origin-mode, camera-replacement-caches, shadow-camera-facade).
- The names/ files other than the three above.
- picking/ray.ts (createPickingRay), math/invert-mat4.ts, the scene's floating-origin sync code, and right-handed (#coordinate-system) builds beyond the sign flips visible in the camera files.
- geospatial-movement.ts helpers were read but given no note.

## Least sure
- n24 (worldOrigin under floating origin = camera position) is inferred from comments in camera.ts and world-to-screen.ts, not seen exercised.
- n15 (hand-assigned ortho after another camera installed the projector) is read from the cache-key code, not from a test.
- n02/n03 "nothing moves without a scene" assumes no other caller drives the hooks.

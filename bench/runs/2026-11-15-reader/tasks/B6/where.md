# B6: where a degenerate up vector is decided

**What the plain answer gets wrong.** It copies the car's up into `camera.upVector` on every call. When that up lies along the line of sight, the look-at basis has no right axis, and the camera falls back to an identity rotation: it looks along world +Z with world +Y up. It stops looking at the target and loses its roll. Nothing throws.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/`:

- `camera/banked-free-camera.ts`, lines 29-32: the doc comment on `createBankedFreeCamera`, "a degenerate up (parallel to the view direction) falls back to an identity rotation, matching `createFreeCamera`". Lines 43-45 hand the mutable `upVector` to the shared factory.
- `camera/free-camera.ts`, line 57: `cameraLocalWorldMatrix` builds the world matrix with `writeLookAtWorldMat4LHIntoBuffer(..., cam.position, cam.target, up)`, rebuilt whenever `upVector` changes.
- `math/write-look-at-world-mat4-lh-into-buffer.ts`, lines 13-14 (comment) and 38-55: the x axis is `cross(up, zAxis)`. When its length is below 1e-10 the rotation is set to identity.

**The makers' unit test that pins it:** `babylon-lite/tests/lite/unit/banked-free-camera.test.ts`, the case "falls back to an identity rotation for a degenerate up, like createFreeCamera".

**Does a comment in `src` say it?** Yes: the doc comment on `createBankedFreeCamera`, and the one on `writeLookAtWorldMat4LHIntoBuffer`.

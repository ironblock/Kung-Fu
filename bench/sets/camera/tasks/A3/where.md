# A3: what the matrix getters hand back

**The behaviour.** `getViewMatrix` and `getViewProjectionMatrix` return the camera's own cache buffer, the same object on every call, which is rewritten in place the next time it is asked for after the camera or its projection changed; a matrix kept from an earlier call therefore turns into the current one.

**What the reader would answer, and why.** It keeps `view = getViewMatrix(camera)` and `viewProjection = getViewProjectionMatrix(camera, aspect)` from `mark()` and projects the point with them in `shift()`. The names read like pure functions in a plain-data library, `names/camera.d.ts` gives them a `Mat4` return type with read-only indices and a brand (so a copy is not even assignable back to `Mat4` without a cast), and nothing says the result is shared. As soon as `shift()` asks for the current matrices, the kept ones are overwritten with the same values, and every shift comes out 0.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/camera.ts`:
- lines 112-149: `getViewMatrix` writes into `camera._viewCache` and returns it (lines 115 and 148), recomputing when `worldMatrixVersion` moves.
- lines 200-214: `getProjectionMatrix` writes into and returns `camera._projCache`.
- lines 217-227: `getViewProjectionMatrix` writes into and returns `camera._vpCache`, recomputing when `_cameraChangeKey` (lines 189-197, which folds `fov`, `nearPlane` and `farPlane` drift into the key) or the aspect changes.
- `arc-rotate.ts` lines 142-144: one cache buffer of each kind per camera, allocated once.

**The makers' unit test that pins it:** none.

**comment: no.** The doc comments say "Compute the view matrix for a camera. Cached per worldMatrixVersion." and "Compute the view-projection matrix for a camera. Cached per `_cameraChangeKey` + aspect." They say the value is cached, not that the returned object is the cache and is overwritten.

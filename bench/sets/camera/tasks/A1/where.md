# A1: where a new orbit centre is taken up

**The behaviour.** The arc-rotate camera only notices a new centre when the components of its own `target` object are written; assigning a new object to `camera.target` changes nothing in its world matrix until `alpha`, `beta` or `radius` is next written, and later writes to that plain object are never noticed.

**What the reader would answer, and why.** It writes `camera.target = { ...point }` (or `camera.target = point`). In Babylon.js `target` is a setter that calls `setTarget` and rebuilds the view, and `names/arc-rotate.d.ts` shows `target: Vec3` as a plain, writable field with nothing to say otherwise. In Babylon Lite the camera's position and view matrix stay where they were (probe: position stays at radius 10 around the old centre), so the label code reads a stale camera; the first later write to an angle then makes the camera jump.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/arc-rotate.ts`:
- line 122: `target` is an `ObservableVec3` whose component setters call `onDirty` (`wm.markLocalDirty()`, line 114). It is a plain data field, with no accessor on `cam` itself.
- lines 160-178: only `alpha`, `beta` and `radius` get accessors that mark the world matrix dirty.
- lines 83-96 and 101-111: the eye position and look-at are rebuilt from `cam.target` only when the world-matrix state recomputes, i.e. after a dirty mark.

**The makers' unit test that pins it:** none.

**comment: no.** The interface's doc comment (lines 17-18) says "alpha/beta/radius use Object.defineProperty, target uses ObservableVec3. Changes call wm.markLocalDirty() immediately." It names the mechanism but does not say that replacing the object is ignored, and the `target` field has no comment of its own.

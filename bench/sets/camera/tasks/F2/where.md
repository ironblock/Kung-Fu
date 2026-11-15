# F2: where the controls' heading comes from

**The behaviour.** A free camera's heading and pitch for the controls (`_yaw`, `_pitch`) are computed once, when the camera is created, from position and target; writing `position` or `target` later does not update them, so the next key press or drag snaps the view back to the old heading.

**The answer the reader would give, and why.** It keeps one camera and, in `jumpTo`, writes `camera.position.set(...)` and `camera.target.set(...)`. In `names/` `target` is a public, writable `ObservableVec3`, which reads like Babylon.js's `setTarget`, and in Babylon.js `setTarget` rebuilds the rotation that the controls steer from. Here the camera shows the new view until the first input; then W flies along the old heading and the target is rebuilt from it (0.80 rad off in the check).

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/`:
- `free-camera.ts`, lines 48-51 and 71-72: `_yaw` and `_pitch` come from `target - position` at creation only. Lines 75-76: `position`/`target` writes only mark the matrix dirty (`onDirty`), they never touch `_yaw`/`_pitch`.
- `free-camera-controls.ts`, lines 103-130: on any movement or rotation, the position moves along `_yaw`/`_pitch` and the target is rewritten as `position + direction(_yaw, _pitch)` (line 129).

**The makers' unit test that pins it:** none.

**comment: no.** The comment on `FreeCamera` (lines 13-18) says only that "_yaw/_pitch use Object.defineProperty" for dirty tracking, and `_yaw`/`_pitch` are marked `@internal`.

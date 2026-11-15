# G4: where the flight's yaw path is decided

**Behaviour.** A flight's target yaw is reduced to the shortest signed angle from the current yaw, in [-π, π), so a target a full turn away does not turn at all and one exactly a half turn away turns westward.

**What the plain answer gets wrong, and why.** It flies to `yaw: camera.yaw + 2 * Math.PI`. The option is a plain `yaw?: number`, and an interpolating animation in Babylon.js goes from the start value to the target value, so adding 2π reads as "one full turn". The flight runs for its duration, resolves, and the heading never moves. (Splitting it into two half turns fails too: each half goes west.)

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/`:

- `geospatial-camera-fly.ts`, line 87: `targetYaw = yaw0 + normalizeRadians(normalizeRadians(options.yaw) - yaw0)`;
- `geospatial-camera.ts`, lines 82-84: `normalizeRadians` wraps to [-π, π), so a difference of 2π becomes 0 and one of π becomes -π.

The right answer chains turns shorter than π (for example four quarter turns), or drives the yaw itself each frame.

**The makers' unit test that pins it:** none.

**comment: yes.** On the `yaw` option (line 8): "Target yaw (radians). Shortest angular path is taken." And on `flyGeospatialCameraToAsync` (line 67): "Yaw takes the shortest angular path".

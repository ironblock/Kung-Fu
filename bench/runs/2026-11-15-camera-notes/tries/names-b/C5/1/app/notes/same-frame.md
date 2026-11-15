# same-frame: unverified inference

`notes/same-frame.json` was written from the type declarations in `camera-api.d.ts` only. The Babylon Lite 1.39.0 implementation is not available, so these values are not verified.

- `rejects: false`: no `AbortSignal` is passed, so nothing aborts the animation. The declarations give no other rejection path.
- `finalRadius: 7`: the goal has no `radius`, so the animation should not touch radius. The `camera.radius = 7` line should survive. Unverified.
- `finalTargetX: 5`: this is only correct if the interpolator reads `goal.target` lazily, i.e. after `spot.x = 5` runs. If it copies the goal on call, the answer is 1. Unverified.

Recommendation: do not rely on the scratch vector. Pass a fresh object, e.g. `target: { x: 1, y: 0, z: 0 }` per call, or `{ ...spot }`, so the mutation cannot affect the in-flight transition.

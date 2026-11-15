# G1: where replacing the limits object is decided

**Behaviour.** The camera clamps against the limits object it was created with, held in a closure, so assigning a new object to `camera.limits` changes what the field reports and nothing the camera does.

**What the plain answer gets wrong, and why.** It writes `camera.limits = limits`. `limits` is a plain, writable field of `GeospatialCamera` in the type declarations, and in Babylon.js a camera reads its limits through the property each time, so replacing the object looks like the cleanest way to switch modes. After it, `camera.limits.radiusMax` reads 2000, but `camera.radius = 5000` still gives 4000, the heading is not clamped at all, and a second switch changes nothing either. (`attachGeospatialControls` reads `camera.limits` live, so the controls and the camera's own setters would even disagree.)

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/geospatial-camera.ts`:

- line 209: `const limits = createGeospatialLimits(options.planetRadius);`, a local of `createGeospatialCamera`;
- lines 243-245: `applyOrientation` clamps yaw, pitch and radius against that local `limits`, not `cam.limits`;
- line 286: `limits,` puts the same object on the camera as an ordinary data property, which an assignment simply replaces.

The right answer copies the mode's values into `camera.limits` (for example `Object.assign`).

**The makers' unit test that pins it:** none.

**comment: no.** The field's comment (line 55) says "Limits governing yaw/pitch/radius clamping. Mutable; clamping applies on the next orientation change." It says the object may be changed in place, not that replacing it is ignored.

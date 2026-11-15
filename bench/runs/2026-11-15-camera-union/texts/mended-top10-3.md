# Notes on how the camera code of Babylon Lite 1.39.0 behaves

1. attachControl's drag, wheel and keys only add to the camera's inertial*Offset fields; alpha, beta, radius and target change only when the scene's _beforeRender runs. Without the scene argument the camera never moves (pinch excepted).
2. Limit fields (upperRadiusLimit etc.) written straight onto a camera clamp no write until setCameraLimits has been called on it: radius = 50 with upperRadiusLimit 12 stays 50. interpolateArcRotateCamera clamps its goals to them anyway.
3. setCameraLimits clamps the current pose at once; from then on each write that changes alpha/beta/radius is clamped in the same statement, using the limit fields as they are then, and zeroes that inertial offset only if it hit a bound.
4. Each geospatial yaw/pitch/radius write clamps pitch against the radius at that moment; by default pitch is forced to 0.001 at radius >= 4*planetRadius, so pitch = 1 at the start is lost. Use setGeospatialOrientation({pitch, radius}).
5. Projection is reverse-Z with depth in [0,1]: a point at nearPlane gets depth 1 and one at farPlane depth 0, also in projectWorldToScreen's z.
6. createArcRotateCamera sets nearPlane 0.1 and farPlane 1000 (createFreeCamera: 1 and 10000), fov 0.8, and panningSensibility 50.
7. An ArcRotate camera's target is an observable vector: write target.x/y/z in place. Assigning a new object to camera.target leaves worldMatrix stale until a write changes alpha, beta or radius; that uses the object as it is then.
8. Free-camera controls steer by _yaw/_pitch, which are computed only at creation. A target written later is replaced on the next control move or turn by position + unit look vector from the old yaw/pitch.
9. attachControl's keyboard: true is ignored unless enableArcRotateKeyboardControls() ran first. Keys are heard on the canvas (tabIndex made 0 if no tabindex attribute); held arrows add 1/angularSensitivity (default 100) per frame, normalised.
10. interpolateArcRotateCamera zeroes the inertial offsets on its first frame, then rejects with an 'interrupted' Error if anything else changes alpha, beta, radius or target between frames: a drag, a direct write, or a newer interpolation.

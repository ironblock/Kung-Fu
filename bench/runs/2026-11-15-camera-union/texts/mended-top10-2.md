# Notes on how the camera code of Babylon Lite 1.39.0 behaves

1. attachControl's drag and wheel only add to the inertialAlpha/Beta/RadiusOffset fields, applied by a callback on scene._beforeRender; with no scene they never move the camera. A two-finger pinch writes radius at once, scene or not.
2. Assigning a new object to ArcRotateCamera.target does not mark the camera dirty, nor do writes to it. It shows up at the next alpha/beta/radius write that changes the value (cam.radius = cam.radius does not). Write target.x/y/z in place.
3. Hand-set lower/upper alpha/beta/radius limit fields clamp no write until setCameraLimits runs (interpolateArcRotateCamera clamps its goals anyway). After it each write is clamped at once; the call clamps the pose and zeroes that offset.
4. createArcRotateCamera sets nearPlane 0.1, farPlane 1000 and panningSensibility 50 (fov 0.8, angularSensibility 1000, wheelPrecision 3, inertia and panningInertia 0.9).
5. GeospatialCamera clamps pitch against the radius it is applied with: from 4*planetRadius pitch is forced to 0.001, falling linearly from 2R; the start radius is 4R (or 10 if larger). Set radius first, or both in setGeospatialOrientation.
6. Arc-rotate keys need enableArcRotateKeyboardControls() before attachControl and keyboard true or an object. A held arrow adds 1/100 to the inertial offset each frame (1/100/sqrt2 per axis for two), so turns speed up; Ctrl+arrows pan.
7. attachFreeControl aims from FreeCamera._yaw/_pitch, set only at creation and by its own drags. A target set by hand is replaced on the next key move or drag, with target placed 1 unit ahead of position.
8. Each wheel event subtracts deltaY * radius / (wheelPrecision * 1000) from inertialRadiusOffset, so wheel zoom steps scale with the current radius; positive deltaY zooms out.
9. A pan drag adds -dx/panningSensibility to inertialPanningX, and each frame moves target by that offset times radius/1000 along the camera's axes, so panning speed scales with radius.
10. Writing GeospatialCamera.center.x/y/z in place moves no eye at once, but the next yaw/pitch/radius write orbits the changed center. Assign a whole new object to center (or use setGeospatialOrientation) to re-orbit at once.

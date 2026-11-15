# Notes on how the camera code of Babylon Lite 1.39.0 behaves

1. attachControl without a scene moves nothing on drags or wheel: they only add to inertialAlphaOffset, inertialRadiusOffset and the like, applied by the hook it pushes on scene._beforeRender. A two-finger pinch still writes radius at once.
2. Hand-set lower/upper alpha/beta/radius limit fields clamp no write until setCameraLimits runs (interpolateArcRotateCamera clamps its goals anyway). After it each write is clamped at once; the call clamps the pose and zeroes that offset.
3. Assigning a new object to ArcRotateCamera.target does not mark the camera dirty, nor do writes to it. It shows up at the next alpha/beta/radius write that changes the value (cam.radius = cam.radius does not). Write target.x/y/z in place.
4. createArcRotateCamera sets nearPlane 0.1, farPlane 1000 and panningSensibility 50 (fov 0.8, angularSensibility 1000, wheelPrecision 3, inertia and panningInertia 0.9).
5. attachFreeControl aims from FreeCamera._yaw/_pitch, set only at creation and by its own drags. A target set by hand is replaced on the next key move or drag, with target placed 1 unit ahead of position.
6. interpolateArcRotateCamera rejects its promise if alpha, beta, radius or target change by anything else between its frames, a second call on the camera included; a change before its first frame becomes the start. That frame zeroes inertia.
7. GeospatialCamera clamps pitch against the radius it is applied with: from 4*planetRadius pitch is forced to 0.001, falling linearly from 2R; the start radius is 4R (or 10 if larger). Set radius first, or both in setGeospatialOrientation.
8. An ArcRotate camera has no beta limits by default; attachControl's frame step clamps beta to [0.01, PI-0.01], but only on frames where inertialAlphaOffset or inertialBetaOffset is non-zero. beta = 0 written directly stays 0.
9. attachControl's keyboard: true is ignored unless enableArcRotateKeyboardControls() ran first. Keys are heard on the canvas (tabIndex made 0 if no tabindex attribute); held arrows add 1/angularSensitivity (default 100) per frame, normalised.
10. flyGeospatialCameraToAsync resolves, never rejects, when cut short by a newer flight or by input through attachGeospatialControls; the camera stays where the flight stopped.

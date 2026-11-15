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
11. Writing GeospatialCamera.center.x/y/z in place moves no eye at once, but the next yaw/pitch/radius write orbits the changed center. Assign a whole new object to center (or use setGeospatialOrientation) to re-orbit at once.
12. enableOrthographicCamera defaults halfHeight to 1; null planes are +-halfHeight vertically and +-halfHeight*aspect horizontally, fov is ignored, and writes to the returned bounds take effect on the next getProjectionMatrix.
13. resolveCameraViewport counts camera.viewport.y from the bottom but returns y from the top: {x:0,y:0,width:0.5,height:0.5} on 800x600 gives {x:0,y:300,width:400,height:300}. Edges are clamped to the canvas: {x:-0.5,width:1} gives width 400.
14. attachControl acts only on button 0 (rotate) and 2 (pan): a middle-button drag does nothing and Ctrl+left still rotates. pointerMappings apply to mouse and pen; a touch pointer always rotates.
15. disposeScene does not remove the canvas listeners added by attachControl; only the function attachControl returns does.
16. In attachConfigurableFreeControl, upKeys and downKeys replace the defaults (upKeys ['KeyE'] makes Space do nothing). fastMultiplier defaults to 1, so fastKeys alone do not speed anything up.
17. Projection is reverse-Z: getProjectionMatrix maps nearPlane to depth 1 and farPlane to depth 0, so the z of projectWorldToScreen is 1 at the near plane and 0 at the far plane.
18. attachControl's wheel does inertialRadiusOffset -= deltaY*radius/(wheelPrecision*1000) and each frame radius -= that offset, so positive deltaY zooms out, in steps proportional to radius; radius never goes below 0.01.
19. A right-drag of dx px adds -dx/panningSensibility to inertialPanningX; each frame the target moves inertialPanningX*radius/1000 along the camera's right vector, then the offset is multiplied by panningInertia.
20. createGeospatialCamera's limits default to radiusMin 10 (in world units, whatever the planet size) and radiusMax 4*planetRadius; the camera has nearPlane 1 and farPlane 16*planetRadius.
21. attachGeospatialControls pans the centre on left drag and turns yaw on right drag; it listens for keys on window, not on the canvas, and leaves the canvas tabIndex alone.
22. attachControl's two-finger pinch writes radius directly, scaling it by start distance / current distance, before any frame runs and with no inertial offset.
23. Calling enableOrthographicCamera again replaces camera.ortho with fresh bounds; the old object no longer drives the projection. disableOrthographicCamera sets camera.ortho to null.
24. projectWorldToScreen: a point behind the camera has behindCamera, offscreen and clipped true; one past farPlane but in frame has only clipped; x/y are never clamped, so an off-side point keeps an x beyond the viewport.
25. In attachFreeControl, KeyW and ArrowUp both move along the look direction including pitch, Space moves straight up world Y, and a middle-button drag turns the camera, as a left drag does.

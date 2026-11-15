# Notes on how the camera code of Babylon Lite 1.39.0 behaves

1. attachControl only adds drag and wheel input to the inertialAlphaOffset/inertialBetaOffset/inertialRadiusOffset fields; a callback on scene._beforeRender applies them each frame. Called without a scene, the camera never moves.
2. Assigning a new object to ArcRotateCamera.target does not mark the camera dirty, and later writes to that plain object never do. The new target shows up only at the next alpha/beta/radius write. Write target.x/y/z in place.
3. The lower/upper alpha, beta and radius limit fields do nothing until setCameraLimits runs. From then on each alpha/beta/radius write is clamped in the same statement; the call itself clamps the pose and zeroes that inertial offset.
4. createArcRotateCamera sets nearPlane 0.1, farPlane 1000 and panningSensibility 50 (fov 0.8, angularSensibility 1000, wheelPrecision 3, inertia and panningInertia 0.9).
5. GeospatialCamera clamps pitch against the radius it is applied with: from 4*planetRadius (the start) pitch is forced to 0.001, falling linearly from 2R. Set radius before pitch, or both in one setGeospatialOrientation call.
6. Arc-rotate keys work only if enableArcRotateKeyboardControls() ran before attachControl and keyboard is true or an object. Arrows add 1/100 rad per frame, Ctrl+arrows pan, Alt+Up/Down zoom by 1/25; the canvas gets tabIndex 0.
7. attachFreeControl aims from FreeCamera._yaw/_pitch, set only at creation and by its own drags. A target set by hand is replaced on the next key move or drag, with target placed 1 unit ahead of position.
8. Each wheel event subtracts deltaY * radius / (wheelPrecision * 1000) from inertialRadiusOffset, so wheel zoom steps scale with the current radius; positive deltaY zooms out.
9. A pan drag adds -dx/panningSensibility to inertialPanningX, and each frame moves target by that offset times radius/1000 along the camera's axes, so panning speed scales with radius.
10. GeospatialCamera.center returns its live inner object: writing center.x/y/z in place changes nothing else and moves no eye. Assign a whole new object to center (or use setGeospatialOrientation) to re-orbit.
11. attachFreeControl moves on WASD and arrows, Space/PageUp up, ShiftLeft/ShiftRight/PageDown down, and turns on a drag with button 0, 1 or 2. One 16 ms frame of W moves speed*16/sqrt(100000). Without a scene nothing moves.
12. interpolateArcRotateCamera rejects if anything else changes alpha/beta/radius/target between its frames, including attachControl inertia on the same camera. Its first frame, not the call, zeroes all five inertial offsets.
13. When a later flyGeospatialCameraToAsync call interrupts a flight, the first flight's promise resolves (it does not reject), with the camera left part way.
14. enableOrthographicCamera defaults halfHeight to 1 world unit; a null left/right is -/+halfHeight*aspect, but numeric left/right are used as given, not scaled by aspect. fov has no effect while ortho is set.
15. createGeospatialCamera starts at center (R,0,0), yaw 0, pitch 0.001, radius 4R, nearPlane 1, farPlane 16R. Limits: radiusMin 10 (absolute), radiusMax 4R, pitchMax PI/2-0.01; radius writes are clamped to these.
16. In GeospatialCamera north is +Z: at a centre on +X, yaw 0 looks toward +Z and yaw PI/2 (east) toward -Y. yaw is wrapped to [-PI, PI), so yaw = PI reads back -PI; a centre on a pole is moved off it.
17. attachGeospatialControls adds its keydown/keyup listeners to window, not the canvas, and throws if there is no global window. Keys fired on the canvas do nothing.
18. With no limits set, attachControl's frame still clamps beta to [0.01, PI-0.01] when it applies rotation and radius to at least 0.01 when it applies zoom; a direct beta write is not clamped.
19. attachControl acts only on button 0 (rotate) and 2 (pan): a middle-button drag does nothing and Ctrl+left still rotates. pointerMappings apply to mouse and pen; a touch pointer always rotates.
20. resolveCameraViewport reads viewport y from the bottom and returns pixel y from the top, clamping the rect to the target: {x:0,y:0,width:.5,height:.5} on 800x600 gives {x:0,y:300,width:400,height:300}.
21. projectWorldToScreen returns x/y in backing pixels, cssX/cssY scaled by cssWidth/backingWidth, z as 0..1 depth, and offscreen x/y unclamped. It throws RangeError on a zero-size viewport or a cssWidth without cssHeight.
22. After setCameraLimits, a limit field changed by hand applies at the next alpha/beta/radius write, not at once. The function setCameraLimits returns stops clamping but leaves the limit fields set.
23. interpolateArcRotateCamera clamps alpha/beta/radius goals to the camera's limits and resolves at the clamped value. It moves nothing until a scene frame runs.
24. A change to GeospatialCamera.limits applies at the next yaw/pitch/radius/center write. limits.pitchDisabledRadiusScale = null allows full pitch at any radius.
25. attachGeospatialControls zooms by the sign of each wheel event's deltaY only: deltaY -1 and -1000 zoom the same; negative deltaY zooms in.
26. Wheel input through attachGeospatialControls ends a running flyGeospatialCameraToAsync flight at the next frame, and that flight's promise resolves.
27. attachFreeControl clamps FreeCamera._pitch to +-(PI/2 - 0.01); dragging down lowers it and looks down.
28. In attachConfigurableFreeControl, upKeys and downKeys replace the defaults (upKeys ['KeyE'] makes Space do nothing). fastMultiplier defaults to 1, so fastKeys alone do not speed anything up.
29. createFreeCamera has no upVector and always builds its basis on world +Y; only createBankedFreeCamera has upVector, and writing it rolls the camera.
30. attachControl's two-finger pinch writes radius directly, scaling it by start distance / current distance, before any frame runs and with no inertial offset.
31. A second enableOrthographicCamera call replaces camera.ortho with a fresh object (halfHeight back to 1); writes to the earlier bounds object no longer change the projection.
32. disposeScene does not remove attachControl's canvas listeners; only the function attachControl returns removes them.
33. attachFreeControl stops look inertia once it falls below speed * 0.001, so at a high speed (1000) a drag turns once with no glide.

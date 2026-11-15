# Notes on how the camera code of Babylon Lite 1.39.0 behaves

1. Writing a limit field (lowerRadiusLimit, upperBetaLimit, ...) on an ArcRotateCamera clamps nothing until setCameraLimits has been called on that camera; attachControl's loop has no limit code.
2. attachControl moves the camera only from scene._beforeRender: without the scene argument, drag, wheel and keyboard input only fill the inertial offsets and nothing moves. Two-finger pinch is the exception: it writes radius directly.
3. ArcRotateCamera.target is an ObservableVec3 that marks the camera dirty; change it with target.x/y/z or target.set(). After camera.target = {...} target changes are not seen until alpha, beta or radius changes.
4. createArcRotateCamera sets nearPlane 0.1 and farPlane 1000 (fov 0.8), not Babylon.js's 1 and 10000. createFreeCamera uses nearPlane 1, farPlane 10000.
5. Cameras hold no aspect ratio: getProjectionMatrix and getViewProjectionMatrix take it per call. With camera.viewport set, pass getEffectiveAspectRatio(camera, w, h) = (w/h)*(viewport.width/viewport.height).
6. projectWorldToScreenToRef takes options.viewport in backing pixels, top-left origin (use resolveCameraViewport); result x/y include its offset. cssX = x*cssWidth/backingWidth (same for y); without css sizes cssX/cssY equal x/y.
7. camera.viewport y is measured from the bottom of the target. resolveCameraViewport returns integer pixels with y from the top (floor start, ceil end), clamped to the target; FULL_VIEWPORT when viewport is unset.
8. Use enableOrthographicCamera to go orthographic. Assigning camera.ortho yourself does not invalidate the cached projection, and is ignored until enableOrthographicCamera has run once in the process.
9. interpolateArcRotateCamera's promise rejects with Error('ArcRotate camera interpolation was interrupted.') if anything else changes alpha, beta, radius or target between frames: user input, attachControl inertia, a newer interpolation.
10. GeospatialCamera.center returns the live internal vector: writing camera.center.x does not recompute the pose. Assign a whole vector (it is copied) or call setGeospatialOrientation.
11. Each GeospatialCamera yaw/pitch/radius/center setter clamps at once using the other current values: setting pitch while radius >= 4*planetRadius (the start pose) gives pitchMin. Set radius first, or all in one setGeospatialOrientation.
12. FreeCamera controls steer from internal _yaw/_pitch, set only at creation (yaw=atan2(dx,dz), pitch=atan2(dy,horizontal)); after you write target, the next control input resets target to position + the old _yaw/_pitch direction.
13. Projections are reverse-Z: nearPlane maps to depth 1 and farPlane to 0 in WebGPU [0,1] clip depth, for perspective and orthographic alike.
14. projectWorldToScreenToRef result.z is reverse-Z NDC depth (1 at nearPlane). offscreen: behind camera, clipW < 0, or NDC x/y outside [-1,1]. clipped: offscreen or z outside [0,1].
15. setCameraLimits clamps alpha/beta/radius at once (zeroing that inertial offset) and then on every write to them. A limit field changed by hand afterwards is applied at the next alpha, beta or radius write.
16. Without limits, attachControl keeps beta in [0.01, PI-0.01] only on frames that apply rotation inertia, and radius >= 0.01 only on zoom; direct writes to beta or radius are never clamped.
17. attachControl ignores its keyboard option unless enableArcRotateKeyboardControls() was called before attachControl (process-wide); keyboard stays off unless keyboard is true or an options object.
18. Each wheel event does inertialRadiusOffset -= deltaY*radius/(wheelPrecision*1000); each frame radius -= inertialRadiusOffset. deltaY > 0 zooms out, and the step scales with the current radius.
19. Each frame target moves by inertialPanningX/Y * radius/1000 along the camera's right/up vectors, so pan speed grows with radius. A right drag adds -dx/panningSensibility to X and +dy/panningSensibility to Y.
20. interpolateArcRotateCamera reads omitted goal fields and zeroes every inertial offset on its first frame, not at the call. interpolationFactor (default 0.1) is a half-life in seconds: each frame moves 1-2^(-dt/factor) of the gap.
21. flyGeospatialCameraToAsync resolves, never rejects, when cut off by a newer flight or by input through attachGeospatialControls. durationMs default 1000, cubic ease-in-out; yaw takes the shortest way, pitch and radius are lerped.
22. createGeospatialCamera starts at center (planetRadius,0,0), yaw 0, pitch 0 (straight down), radius = limits.radiusMax (4*planetRadius), nearPlane 1, farPlane 16*planetRadius.
23. GeospatialCamera: planet centred at the origin, +Z is north (polar axis). yaw 0 = north, PI/2 = east; pitch 0 looks straight down, PI/2 at the horizon. center latitude is held under ~89.96 deg.
24. Default GeospatialLimits: radiusMin 10 (world units, not scaled to the planet), radiusMax 4*planetRadius, pitchMin 0.001, pitchMax PI/2-0.01, yaw unbounded, pitchDisabledRadiusScale {x:2,y:4}.
25. Leave ortho with disableOrthographicCamera. Setting camera.ortho = null directly keeps the cached ortho matrix until the camera moves or fov/near/far change, then builds perspective on top of stale ortho terms.
26. In ortho mode fov is ignored; zoom with ortho.halfHeight (default 1). A null left/right/bottom/top is derived each frame as -/+halfHeight*aspectRatio and -/+halfHeight; a number fixes that plane.
27. attachFreeControl and attachConfigurableFreeControl move the camera only when a scene is passed; without one the listeners record input and nothing moves.
28. getViewMatrix, getProjectionMatrix and getViewProjectionMatrix return the camera's own cache buffers, rewritten in place on a later call after a change; copy a matrix you want to keep.
29. With camera._useFloatingOrigin set (the scene sets it on a floating-origin engine), getViewMatrix has zero translation; project absolute points with it by passing getCameraPosition(camera) as options.worldOrigin.
30. behindCamera is view-space z <= 0 from the view matrix, so it works for orthographic (clipW 1). Offscreen points keep unclamped x/y; if clipW is 0 or a value is non-finite, x,y,z,cssX,cssY are NaN and both flags true.
31. projectWorldToScreenToRef throws RangeError unless viewport width/height and backing sizes are positive and finite, offsets and worldOrigin are finite, and cssWidth/cssHeight are both omitted or both positive.
32. disposeScene does not remove attachControl's canvas listeners; call the returned cleanup, or register it with onSceneDispose(scene, cleanup). The cleanup is safe to call twice.
33. attachControl: mouse button 0 rotates, 2 pans, middle does nothing. pointerMappings change mouse and pen only; touch is always one-finger rotate and two-finger pinch zoom.
34. Pinch sets radius = startRadius*startDistance/currentDistance at once (no inertia), then limits and a 0.01 floor apply; spreading the fingers zooms in.
35. Arc keyboard defaults: arrows rotate (1/100 per frame held, diagonals normalized), Ctrl+arrows pan (1/50), Alt+Up/Down zoom (1/25, Up zooms in), Alt+Left/Right rotate alpha. Ctrl beats Alt; Meta blocks all.
36. Both alpha and beta move along the shortest arc; when every channel is within 1e-3 (radius and target relative to the goal radius) they are set exactly to the goal values and the promise resolves.
37. interpolateArcRotateCamera clamps the alpha, beta and radius goals to the camera's current limit fields every frame, so an out-of-range goal ends at the bound; target is not clamped.
38. setCameraLimits merges: omitted fields keep their bound, a field passed as undefined clears it. Its returned function removes the clamp hook but leaves the limit values on the camera. Its scene argument is unused.
39. pitchDisabledRadiusScale {x,y}: max pitch falls linearly from pitchMax at radius x*planetRadius to pitchMin at y*planetRadius. null gives full pitch at every radius.
40. Changes to camera.limits apply at the next orientation change; they do not re-clamp the current pose.
41. attachGeospatialControls listens for keys on window, not the canvas: arrows pan (Up north, Right east), Ctrl+arrows tilt and yaw, Equal/NumpadAdd and Minus/NumpadSubtract zoom, whatever has focus.
42. attachGeospatialControls (scene required): left drag pans keeping the grabbed point under the cursor, middle/right drag rotates, wheel zooms toward the cursor, primary double-click flies only the center to the clicked point.
43. Geospatial pan, zoom and double-click pick a sphere of limits.planetRadius at the origin by ray math, using the canvas bounding rect for aspect; meshes and camera.viewport are not used.
44. In attachGeospatialControls only zoom coasts (inertia 0.9); pan and rotation stop with the input. The wheel uses only the sign of deltaY. Speeds are fixed and have no option.
45. After a pan or zoom ends, the center moves to where the look vector hits the planet, radius set to that distance. checkCollisions (default false) keeps the eye at least planetRadius+radiusMin from the origin.
46. Every flight frame goes through the camera limits, so target pitch/radius outside them is clamped. The center follows a great circle, lifted by centerHopScale*startToEndDistance at mid-flight.
47. attachFreeControl: drag with any mouse button turns (no pointer lock); W/S and Up/Down move along the look direction incl. pitch; A/D, Left/Right strafe; Space/PageUp, Shift/PageDown move along world Y.
48. Free controls: a held key adds speed*deltaMs/316.2 per frame; move and turn accumulators decay by inertia per frame and snap to 0 below speed*0.001; pitch is clamped to +/-(PI/2-0.01).
49. attachConfigurableFreeControl: upKeys/downKeys replace the defaults rather than add to them; fastKeys do nothing unless fastMultiplier is set (default 1); WASD and arrows cannot be remapped.
50. Writing upVector.x/y/z on a BankedFreeCamera rolls the view; the free camera controls still turn and move about world Y and ignore upVector. A degenerate up gives an identity rotation.
51. Arc keyboard listeners are on the canvas (given tabIndex 0 if it has none), so it needs focus; blur clears held keys. A custom key list replaces that direction's arrow default; codes are KeyboardEvent.code.
52. fov, nearPlane and farPlane are plain fields; a write takes effect at the next getProjectionMatrix/getViewProjectionMatrix call, which compares them by value.
53. Calling enableOrthographicCamera again replaces camera.ortho with a fresh object built from the new options; an object returned earlier no longer affects the camera.
54. Ortho bounds are view-space world units around the camera's view axis; depth still comes from camera.nearPlane and farPlane.
55. attachControl options: shouldHandlePointerDown false skips that press; isExternalDragActive true ends the drag and zeroes alpha/beta/pan offsets; isExternalPickPending true swallows moves.
56. projectPointToViewportToRef does no validation, allocates per call, multiplies transform by a world matrix, accepts zero-size viewports, and writes only x, y, z.

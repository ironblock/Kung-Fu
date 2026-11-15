# Notes on how the camera code of Babylon Lite 1.39.0 behaves

1. attachControl moves the camera only when a scene is passed: input only adds to the inertial offsets, and scene._beforeRender applies them each frame. Without a scene, drag, wheel and keys do nothing; only pinch writes radius.
2. Writing lowerBetaLimit or any other *Limit field directly clamps nothing; attachControl has no limit code. Only setCameraLimits clamps, at once and then inside the alpha/beta/radius setters.
3. createArcRotateCamera sets fov 0.8, nearPlane 0.1, farPlane 1000, inertia 0.9, panningInertia 0.9, angularSensibility 1000, panningSensibility 50, wheelPrecision 3, and no limits.
4. ArcRotateCamera.target is an ObservableVec3: write target.x/y/z to move it. Assigning a new object to camera.target marks nothing dirty, so the view does not change until alpha, beta or radius changes.
5. After setCameraLimits, every write to alpha, beta or radius, your own too, is clamped in the setter, and a hit bound zeroes that channel's inertial offset. The returned disposer stops the clamping but leaves the limit fields set.
6. interpolateArcRotateCamera rejects its promise when anything else changes alpha, beta, radius or target between its frames: attachControl inertia, a direct write, or a newer interpolation. Its first frame zeroes all inertial offsets.
7. getProjectionMatrix is left-handed and reverse-Z: depth maps nearPlane to 1 and farPlane to 0, for perspective and orthographic alike. fov is the vertical angle in radians.
8. createFreeCamera sets fov 0.8, nearPlane 1, farPlane 10000, speed 2, angularSensitivity 2000, inertia 0.9.
9. A FreeCamera's view is built from position and target alone. Moving position keeps it aimed at the same target point, so it turns; to translate, move target by the same amount.
10. On each frame with input, attachFreeControl rewrites target as position plus a unit vector from _yaw/_pitch. Writing position or target does not update _yaw/_pitch, so the next input turns the view back to them.
11. attachFreeControl moves the camera only when a scene is passed, from scene._beforeRender; without one, keys and drags change nothing. attachConfigurableFreeControl is the same.
12. GeospatialCamera takes +Z as north: the poles lie on the Z axis, not Y. createGeospatialCamera starts at center (planetRadius,0,0), yaw 0, pitch 0, radius limits.radiusMax (planetRadius*4).
13. Default pitchDisabledRadiusScale {x:2,y:4} forces pitch to pitchMin at radius >= 4*planetRadius and allows pitchMax only at <= 2*planetRadius. The start radius is 4*planetRadius, so pitch set there clamps to 0.001.
14. Each assignment to yaw, pitch, radius or center recomputes and clamps at once, so pitch set before radius is clamped against the old radius. setGeospatialOrientation sets all four in one clamp.
15. flyGeospatialCameraToAsync never rejects: user input through attachGeospatialControls or a new flight resolves the old promise early. durationMs defaults to 1000 and ease to cubic in-out.
16. Arc-rotate keys work only if enableArcRotateKeyboardControls() ran before attachControl and options.keyboard is true or an object; otherwise no key listener is added.
17. attachControl's frame step clamps beta to [0.01, PI-0.01] only on frames with a non-zero alpha or beta offset, and radius to >= 0.01 only with a non-zero radius offset. Values you assign are not clamped by it.
18. Wheel: inertialRadiusOffset -= deltaY*radius/(wheelPrecision*1000), so the step scales with the current radius; each frame radius -= inertialRadiusOffset.
19. Rotate drag: inertialAlphaOffset -= dx/angularSensibility and inertialBetaOffset -= dy/angularSensibility; each frame alpha and beta add their offset.
20. Pan drag: inertialPanningX += -dx/panningSensibility, inertialPanningY += dy/panningSensibility; each frame target moves by them times radius/1000 along the camera's right and up vectors.
21. Arc-rotate inertia decays per frame, not per second: each frame an offset is multiplied by inertia (pan: panningInertia) and set to 0 below 0.001 (pan: 0.0001). Frame time is not used.
22. attachControl: button 0 rotates and button 2 pans unless pointerMappings says otherwise; button 1 does nothing; a touch pointer always rotates.
23. A two-finger pinch sets radius = radius at pinch start * start distance / current distance, at least 0.01, with no inertia: spreading the fingers zooms in.
24. disposeScene does not remove attachControl's canvas listeners; call the returned function, or register it with onSceneDispose(scene, attachControl(...)).
25. interpolationFactor is a half-life in seconds: each frame moves 1-2^(-dt/factor) of the way (default 0.1). A factor <= 0 arrives in one frame. Alpha and beta both take the shortest arc.
26. interpolateArcRotateCamera clamps the alpha/beta/radius goals to the camera's limit fields each frame; target is not clamped. It snaps to the goal and resolves when every channel is within 1e-3.
27. setCameraLimits writes only the keys present in its argument, so calls merge; a key given as undefined clears that bound. Its scene argument is ignored.
28. Arc-rotate keys: arrows rotate (Right raises alpha, Up lowers beta), Ctrl+arrows pan, Alt+Up/Down zoom in/out. Ctrl wins over Alt; Meta stops all key input. Held keys add input every frame.
29. Arc-rotate key rates use options.keyboard divisors (angularSensitivity 100, panningSensitivity 50, zoomingSensitivity 25), not the camera's sensibility fields. Keys are heard on the canvas only.
30. createGeospatialLimits sets radiusMin 10 in absolute units (not scaled by planetRadius), radiusMax planetRadius*4, pitchMin 0.001, pitchMax PI/2-0.01, yawMin -Infinity, yawMax Infinity.
31. camera.center returns the camera's own object: writing center.x moves nothing until the next orientation change. Assign camera.center a new vector, or use setGeospatialOrientation.
32. Changes to camera.limits clamp nothing until the next orientation change (a yaw, pitch, radius or center write, setGeospatialOrientation, the controls or a flight).
33. GeospatialCamera wraps yaw and pitch to [-PI, PI) before clamping, and moves center off the poles to |latitude| <= about 89.96 degrees.
34. attachGeospatialControls needs a scene. Left drag pans, any other button rotates, wheel zooms by the sign of deltaY only, a left double-click on the planet flies there. Keys are heard on window.
35. attachGeospatialControls speeds are fixed: pan and rotation have no inertia, zoom inertia is 0.9, and no option changes them. Any input cancels a running flyGeospatialCameraToAsync.
36. When a pan or zoom stops, attachGeospatialControls moves center to where the look vector meets the planet sphere and recomputes radius, yaw and pitch to keep the same view.
37. attachGeospatialControls clamps rotated pitch to [0, PI/2-0.001] before the limits, and picks by ray against a sphere of limits.planetRadius at the origin, not against meshes.
38. flyGeospatialCameraToAsync takes yaw the shortest way but moves pitch and radius linearly; each frame passes the camera limits, so a goal outside them ends clamped.
39. With checkCollisions (default false), each frame lifts center so that |position| >= planetRadius + radiusMin.
40. Geospatial keys: arrows pan north/east by radius*0.0015 per frame, Ctrl+arrows rotate, Equal/NumpadAdd and Minus/NumpadSubtract zoom along the look vector.
41. createFreeCamera sets _yaw = atan2(dx, dz) toward the target (0 looks along +Z) and _pitch to its elevation; attachFreeControl clamps _pitch to +-(PI/2-0.01).
42. attachFreeControl: W/S or Up/Down move along the look direction, pitch included; A/D or Left/Right strafe; Space/PageUp up, Shift/PageDown down. A drag with any button turns; no pointer lock.
43. Each frame a key is held, attachFreeControl adds speed*deltaMs/316.2 to its move accumulator; the accumulators then decay by inertia per frame and are zeroed below speed*0.001, rotation too.
44. attachFreeControl and attachConfigurableFreeControl listen for keys on the canvas and give it tabIndex 0 if it has none; keys reach them only while the canvas has focus.
45. attachConfigurableFreeControl: fastMultiplier defaults to 1, so fastKeys do nothing until it is set; upKeys/downKeys replace the defaults; WASD and arrow keys cannot be remapped.
46. createBankedFreeCamera rolls when upVector.x/y/z is written; its up defaults to world +Y, giving the same matrix as createFreeCamera.
47. A FreeCamera whose target equals its position, or lies straight along its up vector, gets an identity rotation and looks along +Z.
48. enableOrthographicCamera: halfHeight defaults to 1; null planes become +-halfHeight and +-halfHeight*aspect; fov is ignored, nearPlane/farPlane still set depth. A second call replaces camera.ortho.
49. Setting camera.ortho = null by hand does not invalidate the projection cache and leaves orthographic terms in it; disableOrthographicCamera clears both.
50. getEffectiveAspectRatio returns (targetWidth/targetHeight)*(viewport.width/viewport.height); a camera with a viewport needs that ratio, not the canvas ratio, in getProjectionMatrix.
51. camera.viewport.y counts from the bottom; resolveCameraViewport turns it into a top-left pixel rect, clamped to the target, with x/y floored and far edges ceiled.
52. getViewMatrix, getProjectionMatrix and getViewProjectionMatrix return the camera's own cache arrays, overwritten on the next change; copy one to keep its value.
53. getCameraPosition reads the world matrix translation, so it includes the camera's parent transform.
54. projectWorldToScreen throws RangeError unless viewport width/height and backing sizes are positive and finite and cssWidth/cssHeight are given together; projectPointToViewportToRef allows a zero viewport.
55. projectWorldToScreen does not clamp: offscreen points keep extrapolated x/y. z is reverse-Z depth (1 at nearPlane); behindCamera is view z <= 0; cssX/cssY scale x/y by css/backing size.
56. In a right-handed build the controls flip the sign of alpha/yaw and horizontal pan, so a drag turns the same way on screen.
57. When isExternalDragActive returns true mid-drag, attachControl ends the drag and zeroes the alpha, beta and panning offsets; isExternalPickPending only drops the moves while true.

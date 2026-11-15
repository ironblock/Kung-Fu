# Notes on how the camera code of Babylon Lite 1.39.0 behaves

1. attachControl moves the camera only if a scene is passed: pointer, wheel and keys just add to the inertial offsets, and the scene's per-frame _beforeRender hook applies them. Without a scene only a pinch moves it.
2. attachFreeControl does all movement and turning in a per-frame hook pushed on scene._beforeRender; called without a scene, its listeners record input but the camera never moves.
3. Change an ArcRotateCamera's target by writing camera.target.x/y/z. Assigning a new object to camera.target drops the ObservableVec3 that marks the world matrix dirty, so the view does not update.
4. The free controls steer from camera._yaw/_pitch, set at creation and by the controls only. Writing position or target yourself leaves them stale, and the next input turns the view back to the stored yaw/pitch.
5. Limit fields assigned directly on an ArcRotateCamera do nothing until setCameraLimits has run once: it installs the hook the alpha/beta/radius setters call. After that every write, direct or inertial, is clamped at once.
6. setCameraLimits writes only the keys present in limits (an explicit undefined clears one), clamps the pose at once, zeroes the inertial offset of each clamped channel, and returns a disposer that drops the hook but keeps the fields.
7. Without limits, beta is kept in [0.01, PI-0.01] and radius >= 0.01 only inside attachControl's rotation and zoom steps and the pinch; a direct write of beta or radius is not clamped. All limit fields start undefined.
8. createArcRotateCamera sets fov 0.8 (vertical, radians), nearPlane 0.1, farPlane 1000, inertia 0.9, panningInertia 0.9, angularSensibility 1000, panningSensibility 50, wheelPrecision 3.
9. createFreeCamera sets fov 0.8, nearPlane 1, farPlane 10000, speed 2, angularSensitivity 2000, inertia 0.9; ArcRotateCamera's nearPlane is 0.1 and farPlane 1000 instead.
10. interpolateArcRotateCamera rejects its promise when anything else changes alpha, beta, radius or target between frames: user input, inertia, a direct write, or a newer interpolation. It also rejects on signal abort.
11. interpolateArcRotateCamera starts on the next rendered frame: there it zeroes all inertial offsets and takes omitted goal fields from the pose. interpolationFactor (0.1) is a half-life in s: each frame moves 1-2^(-dt/factor) of the way.
12. In interpolateArcRotateCamera both alpha and beta take the shortest arc mod 2*PI, goals are clamped to the camera's limits every frame, a NaN goal field counts as omitted, and the end snaps exactly to the clamped goal.
13. A camera turns orthographic only through enableOrthographicCamera(camera, bounds?). A hand-assigned camera.ortho is ignored until that has been called once, and changing it does not invalidate the cached projection.
14. In orthographic mode fov is ignored; zoom with ortho.halfHeight (default 1, world units). A null left/right becomes -/+halfHeight*aspect, a null bottom/top -/+halfHeight. Depth still uses nearPlane/farPlane.
15. Calling enableOrthographicCamera again replaces camera.ortho with a new bounds object, so one kept from the earlier call no longer drives the camera. disableOrthographicCamera sets ortho to null and returns to fov.
16. getProjectionMatrix is reverse-Z with WebGPU [0,1] depth: nearPlane maps to 1 and farPlane to 0, for perspective and orthographic alike. The z of projectWorldToScreen is that depth.
17. With default limits a GeospatialCamera's pitch is forced to pitchMin (0.001) at radius >= 4*planetRadius and is free only at <= 2*planetRadius. The camera starts at radius 4*planetRadius, so a pitch set there stays ~0.
18. Each GeospatialCamera setter (yaw, pitch, radius, center) re-clamps at once, and pitch is clamped against the requested radius. Set pitch and radius in one setGeospatialOrientation call, or radius first, or the pitch is lost.
19. camera.center on a GeospatialCamera returns its internal vector: changing center.x/y/z does not move the camera. Assign a whole vector (camera.center = v, copied) or use setGeospatialOrientation.
20. GeospatialCamera assumes the planet centred at the world origin with +Z as the north axis. It starts with center (planetRadius,0,0), yaw 0, pitch 0, fov 0.8, nearPlane 1, farPlane 16*planetRadius.
21. GeospatialCamera yaw 0 faces north (+Z) and PI/2 east; pitch 0 looks straight down at the planet centre and PI/2 at the horizon. Both are wrapped to [-PI, PI) and then clamped to camera.limits.
22. createGeospatialLimits defaults: radiusMin 10 (absolute), radiusMax 4*planetRadius, pitchMin 0.001, pitchMax PI/2-0.01, pitchDisabledRadiusScale {x:2,y:4}, yaw unbounded. Edits to camera.limits apply at the next orientation change.
23. Every GeospatialCamera orientation change moves center off the poles to |sin(latitude)| <= 0.998749 (about 89.96 deg), keeping its distance from the origin; center is never snapped to the planet surface.
24. flyGeospatialCameraToAsync resolves, never rejects, when cut short by a newer flight or by input through attachGeospatialControls, so a resolved promise does not mean the goal was reached.
25. In flyGeospatialCameraToAsync yaw takes the shortest way but pitch is lerped directly; center follows a great circle with its length lerped; durationMs defaults to 1000 (min 1); limits clamp every frame.
26. attachGeospatialControls: button 0 pans with the picked globe point kept under the cursor, every other button rotates; each wheel event zooms one fixed step toward the cursor, using only the sign of deltaY.
27. attachGeospatialControls reads keys on window, not the canvas: arrows pan north/east, Ctrl+arrows tilt and yaw, Equal/NumpadAdd and Minus/NumpadSubtract zoom along the look vector.
28. In attachGeospatialControls pan and rotation have zero inertia and stop with the input; only zoom coasts (inertia 0.9, frame-rate normalised). Speeds and inertias are fixed constants, not options.
29. attachGeospatialControls picks by a ray against a sphere of limits.planetRadius at the origin, not scene meshes. A button-0 double-click flies center to the picked point over doubleTapAnimationDurationMs (1000).
30. checkCollisions (default false) in attachGeospatialControls lifts center each frame so the eye stays at least limits.planetRadius + limits.radiusMin from the origin.
31. attachControl: button 0 rotates, button 2 pans, the middle button does nothing. A touch always rotates whatever pointerMappings says; two fingers pinch-zoom by writing radius directly, with no inertia.
32. attachControl pans target in the view plane by inertialPanningX/Y * radius / 1000 per frame, so pan speed grows with radius; a drag adds dx/panningSensibility, and panningInertia (not inertia) decays it.
33. Each wheel event adds deltaY * radius / (wheelPrecision * 1000) to inertialRadiusOffset, so zoom is proportional to radius; the offset is applied each frame and decayed by inertia.
34. attachControl's inertia ignores frame time: offsets are applied once and multiplied by inertia per rendered frame, snapping to 0 below 0.001 (rotation, radius) or 0.0001 (pan).
35. Arc-rotate keys work only if enableArcRotateKeyboardControls() ran before attachControl and options.keyboard is truthy. Arrows rotate, Ctrl+arrows pan, Alt+Up/Down zoom; Ctrl wins over Alt and Meta blocks all.
36. Arc-rotate key speed comes from the keyboard options (angularSensitivity 100, panningSensitivity 50, zoomingSensitivity 25), not the camera's sensibilities; held keys add input every frame, heard on the canvas.
37. disposeScene does not remove attachControl's canvas listeners; call the returned function, or register it with onSceneDispose(scene, attachControl(...)). The function is safe to call twice.
38. After any input attachFreeControl rewrites camera.target to position plus the unit look direction (distance 1). Yaw 0 looks along +Z: _yaw = atan2(dx, dz), _pitch = atan2(dy, horizontal distance).
39. attachFreeControl matches KeyboardEvent.code: W/ArrowUp, S/ArrowDown move along the look direction including pitch; A/D and Left/Right strafe level; Space/PageUp and Shift/PageDown move along world Y.
40. Each frame attachFreeControl adds speed * deltaMs / 316.2 (deltaMs floored at 1) per held key, applies it, then multiplies it by inertia; at inertia 0.9 a held key settles at 10 times that per frame.
41. attachFreeControl listens for keys on the canvas, setting tabIndex 0 if it has no tabindex, so keys work only while the canvas has focus. Buttons 0, 1 and 2 all drag to look; there is no pointer lock.
42. attachFreeControl turns by drag delta / angularSensitivity per frame, decayed by inertia, and clamps _pitch to +/-(PI/2 - 0.01); dragging down lowers the view.
43. In attachConfigurableFreeControl upKeys/downKeys replace the defaults; fastKeys default to none and fastMultiplier to 1. A fast key that is also a default down key (Shift) both speeds up and descends.
44. A FreeCamera whose view direction is parallel to world Y (target straight above or below) gets an identity rotation and looks along +Z.
45. createBankedFreeCamera rolls when you write upVector.x/y/z (or set); upVector itself is a non-writable property. An up parallel to the view gives an identity rotation.
46. projectWorldToScreen takes the view and view-projection matrices separately, and throws RangeError when viewport or backing size is zero, negative or non-finite, or only one of cssWidth/cssHeight is given.
47. projectWorldToScreen never clamps x/y. behindCamera is view z <= 0; offscreen is behindCamera, clipW < 0 or NDC x/y outside [-1,1]; clipped adds depth outside [0,1]; non-finite math gives NaN and both flags true.
48. resolveCameraViewport(camera, w, h) turns the bottom-origin camera.viewport into the top-origin PixelViewport projectWorldToScreen needs, clamping to [0,1] and flooring the start, ceiling the end.
49. projectWorldToScreen's x/y are backing-store pixels including viewport.x/y; cssX/cssY scale them by cssWidth/backingWidth and cssHeight/backingHeight, and equal x/y when no CSS size is given.
50. getProjectionMatrix and getViewProjectionMatrix use the aspect you pass; when camera.viewport is set, pass getEffectiveAspectRatio(camera, w, h), which multiplies w/h by viewport.width/viewport.height.
51. When camera._useFloatingOrigin is set, getViewMatrix zeroes its translation, so the matrices are camera-relative; projectWorldToScreen then needs worldOrigin set to the camera's world position.
52. Rotation through attachGeospatialControls clamps pitch to [0, PI/2 - 0.001] before camera.limits apply, and adds yaw unwrapped.
53. In attachControl, shouldHandlePointerDown false ignores that press; isExternalDragActive true mid-drag ends the drag and zeroes rotation and pan offsets; isExternalPickPending true swallows moves.

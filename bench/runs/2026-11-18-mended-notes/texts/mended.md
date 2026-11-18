# Notes on how the camera code of Babylon Lite 1.39.0 behaves

1. attachControl without a scene moves nothing on drags or wheel: they only add to inertialAlphaOffset, inertialRadiusOffset and the like, applied by the hook it pushes on scene._beforeRender. A two-finger pinch still writes radius at once.
2. Hand-set lower/upper alpha/beta/radius limit fields clamp no write until setCameraLimits runs (interpolateArcRotateCamera clamps its goals anyway). After it each write is clamped at once; the call clamps the pose and zeroes that offset.
3. Assigning a new object to ArcRotateCamera.target does not mark the camera dirty, nor do writes to it. It shows up at the next alpha/beta/radius write that changes the value (cam.radius = cam.radius does not). Write target.x/y/z in place.
4. createArcRotateCamera sets nearPlane 0.1, farPlane 1000 and panningSensibility 50 (fov 0.8, angularSensibility 1000, wheelPrecision 3, inertia and panningInertia 0.9).
5. An ArcRotateCamera puts its eye at target + radius * (cos(alpha)*sin(beta), cos(beta), sin(alpha)*sin(beta)) in its parent's space, using 0.0001 for sin(beta) when it is exactly 0. The camera looks at target with up (0,1,0).
6. attachFreeControl aims from FreeCamera._yaw/_pitch, set only at creation and by its own drags. A target set by hand is replaced on the next key move or drag, with target placed 1 unit ahead of position.
7. interpolateArcRotateCamera rejects its promise if alpha, beta, radius or target change by anything else between its frames, a second call on the camera included; a change before its first frame becomes the start. That frame zeroes inertia.
8. GeospatialCamera clamps pitch against the radius it is applied with: from 4*planetRadius pitch is forced to 0.001, falling linearly from 2R; the start radius is 4R (or 10 if larger). Set radius first, or both in setGeospatialOrientation.
9. An ArcRotate camera has no beta limits by default; attachControl's frame step clamps beta to [0.01, PI-0.01], but only on frames where inertialAlphaOffset or inertialBetaOffset is non-zero. beta = 0 written directly stays 0.
10. attachControl's keyboard: true is ignored unless enableArcRotateKeyboardControls() ran first. Keys are heard on the canvas (tabIndex made 0 if no tabindex attribute); held arrows add 1/angularSensitivity (default 100) per frame. While Meta is held, no key adds anything.
11. With Ctrl held, and Alt or not, held arrows add 1/panningSensitivity instead, to inertialPanningX/Y. With no modifier or with Ctrl, each step is divided by sqrt(2) while one arrow on each axis is held; with Alt and no Ctrl, it is never divided.
12. flyGeospatialCameraToAsync resolves, never rejects, when cut short by a newer flight or by input through attachGeospatialControls; the camera stays where the flight stopped.
13. Writing GeospatialCamera.center.x/y/z in place moves no eye at once, but the next yaw/pitch/radius write orbits the changed center. Assign a whole new object to center (or use setGeospatialOrientation) to re-orbit at once.
14. enableOrthographicCamera defaults halfHeight to 1; null planes are +-halfHeight vertically and +-halfHeight*aspect horizontally, fov is ignored, and writes to the returned bounds take effect on the next getProjectionMatrix.
15. resolveCameraViewport counts camera.viewport.y from the bottom but returns y from the top: {x:0,y:0,width:0.5,height:0.5} on 800x600 gives {x:0,y:300,width:400,height:300}. Its edges are clamped to the canvas: {x:-0.5,width:1} gives width 400. getEffectiveAspectRatio and _applyCameraViewport clamp nothing.
16. attachControl acts only on button 0 (rotate) and 2 (pan): a middle-button drag does nothing and Ctrl+left still rotates. pointerMappings apply to mouse and pen; a touch pointer always rotates.
17. disposeScene does not remove the canvas listeners added by attachControl; only the function attachControl returns does.
18. In attachConfigurableFreeControl, upKeys and downKeys replace the defaults (upKeys ['KeyE'] makes Space do nothing). fastMultiplier defaults to 1, so fastKeys alone do not speed anything up.
19. Projection is reverse-Z: getProjectionMatrix maps nearPlane to depth 1 and farPlane to depth 0, so the z of projectWorldToScreen is 1 at the near plane and 0 at the far plane.
20. attachControl's wheel does inertialRadiusOffset -= deltaY*radius/(wheelPrecision*1000) and each frame radius -= that offset, so positive deltaY zooms out, in steps proportional to radius; radius never goes below 0.01.
21. A right-drag of dx px adds -dx/panningSensibility to inertialPanningX; each frame the target moves inertialPanningX*radius/1000 along the camera's right vector, then the offset is multiplied by panningInertia.
22. createGeospatialCamera's limits default to radiusMin 10 (in world units, whatever the planet size) and radiusMax 4*planetRadius; the camera has nearPlane 1 and farPlane 16*planetRadius.
23. attachGeospatialControls pans the centre on left drag and turns yaw on right drag; it listens for keys on window, not on the canvas, and leaves the canvas tabIndex alone.
24. attachControl's two-finger pinch writes radius directly, scaling it by start distance / current distance, before any frame runs and with no inertial offset.
25. Calling enableOrthographicCamera again replaces camera.ortho with fresh bounds; the old object no longer drives the projection. disableOrthographicCamera sets camera.ortho to null.
26. projectWorldToScreen: a point behind the camera has behindCamera, offscreen and clipped true; one past farPlane but in frame has only clipped; x/y are never clamped, so an off-side point keeps an x beyond the viewport.
27. In attachFreeControl, KeyW and ArrowUp both move along the look direction including pitch, Space moves straight up world Y, and a middle-button drag turns the camera, as a left drag does.
28. projectWorldToScreen throws RangeError when the viewport width/height or backingWidth/backingHeight is not positive, or when only one of cssWidth/cssHeight is given.
29. Each frame a held move key adds speed * max(deltaMs, 1) / sqrt(100000) to the free camera's move, which then decays by inertia, so the distance per frame scales with deltaMs and a 0 ms frame moves as 1 ms does.
30. createFreeCamera has no upVector and always builds its basis on world +Y; only createBankedFreeCamera has upVector, and writing it rolls the camera.
31. setCameraLimits clamps the current pose at once; from then on each write that changes alpha/beta/radius is clamped in the same statement, using the limit fields as they are then, and zeroes that inertial offset only if it hit a bound.
32. attachFreeControl and attachConfigurableFreeControl given no scene never move the camera: all motion is applied in their _beforeRender step.
33. projectWorldToScreen returns x/y in backing pixels, cssX/cssY scaled by cssWidth/backingWidth, z as 0..1 depth, and offscreen x/y unclamped. It throws RangeError on a zero-size viewport or a cssWidth without cssHeight.
34. Each frame interpolateArcRotateCamera moves 1 - 2^(-dt/interpolationFactor) of the remaining way, dt being the frame delta in seconds (a delta <= 0 counts as 1/60 s) and the factor 0.1 by default; a factor <= 0 snaps on the first frame.
35. setCameraLimits writes only the fields present in its argument, so calls add up; a field passed as undefined removes that bound.
36. Each frame attachControl adds the whole alpha/beta offset (subtracts inertialRadiusOffset from radius), then multiplies it by inertia; pan offsets decay by panningInertia instead, so inertia 0 stops a drag or zoom at once but not a pan.
37. getViewMatrix, getProjectionMatrix and getViewProjectionMatrix return the camera's own cache object, overwritten in place on the next change (or other aspect); copy it to keep a value.
38. getProjectionMatrix does not apply camera.viewport; pass getEffectiveAspectRatio(camera, width, height) as the aspect to match what is rendered. That ratio is width/height * viewport.width/viewport.height, or width/height with no viewport, unrounded, and differs from resolveCameraViewport's when that clamps an edge.
39. An edit to a field of GeospatialCamera.limits applies at the next yaw/pitch/radius write that changes the value, or at any center assignment (cam.center = cam.center works). A new object assigned to limits is never used by the camera's clamps. limits.pitchDisabledRadiusScale = null allows full pitch at any radius.
40. setGeospatialOrientation always wraps yaw and pitch to [-PI, PI) and applies the camera's limits again, even when given no field; an omitted or null field keeps its current value. The yaw, pitch and radius setters do nothing when the value written equals the stored, wrapped and clamped value.
41. attachGeospatialControls: a left drag pans the center; a drag with any other button rotates, yaw += dx*PI/500 with no coasting.
42. Arc-rotate keys: ArrowUp lowers beta, ArrowRight raises alpha; Ctrl+arrows pan (inertialPanningX/Y); with Alt, a held ArrowUp adds 1/zoomingSensitivity (default 25) to inertialRadiusOffset each frame, so radius falls faster each frame.
43. attachFreeControl turns on a drag with button 0, 1 or 2 (right drag turns right, down looks down); a drag adds dx/angularSensitivity to a turn velocity applied each frame, then times inertia, so it coasts. Pitch is clamped to +-(PI/2-0.01).
44. attachFreeControl's drag starts on a pointerdown with button 0, 1 or 2 of any pointerType and ends on any pointerup, not on pointercancel. Each pointermove in it, whatever its buttons, pointerType or pointerId, turns by its clientX and clientY change divided by angularSensitivity; movementX and movementY are not read.
45. flyGeospatialCameraToAsync times the flight from the frame deltas given to _beforeRender (durationMs default 1000; a delta <= 0 counts as 1000/60 ms) and turns yaw the short way round (3 to -3 passes through PI).
46. createFreeCamera starts with fov 0.8, nearPlane 1 and farPlane 10000, unlike createArcRotateCamera's 0.1 and 1000.
47. Assigning camera.ortho by hand is ignored (perspective is used) until enableOrthographicCamera has been called at least once.
48. createGeospatialCamera starts at center (R,0,0), yaw 0, pitch 0.001, radius 4R, nearPlane 1, farPlane 16R; limits radiusMin 10, radiusMax 4R, pitchMax PI/2-0.01 clamp radius writes. If 4R < 10 it starts at 10 and writes above 10 give 4R.
49. With default limits a GeospatialCamera's pitch is forced to pitchMin (0.001) at radius >= 4*planetRadius and is free only at <= 2*planetRadius. The camera starts at radius 4*planetRadius, so a pitch set there stays ~0.
50. interpolateArcRotateCamera clamps alpha/beta/radius goals to the camera's limits and resolves at the clamped value. It moves nothing until a scene frame runs.
51. Assigning camera.ortho = null by hand keeps the cached orthographic matrix, and the rebuild after a fov write still has the ortho p[12], p[13] and p[15]=1; disableOrthographicCamera clears those and switches at once.
52. attachGeospatialControls zooms by the sign of wheel deltaY only, and the zoom coasts over later frames, while a right-drag rotation stops on the first frame without input.
53. In attachGeospatialControls pan and rotation have zero inertia and stop with the input; only zoom coasts (inertia 0.9, frame-rate normalised). Speeds and inertias are fixed constants, not options.
54. A wheel event with nonzero deltaY heard by attachGeospatialControls during a flyGeospatialCameraToAsync ends the fly on the next frame and resolves its promise; one with deltaY 0 (a sideways scroll) does not.
55. A geospatial center written with spherical latitude asin(z/|center|) beyond +-87.13 degrees (0.05 rad from the +-Z pole) is moved to +-87.13, keeping its distance from the origin and its longitude.
56. createFreeCamera sets _yaw = atan2(dx, dz) of the look direction (0 looks along +Z); writing _yaw alone does not change the view until a control move rebuilds target from it.
57. In attachControl, shouldHandlePointerDown false ignores that press; isExternalDragActive true mid-drag ends the drag and zeroes rotation and pan offsets; isExternalPickPending true swallows moves.
58. In GeospatialCamera north is +Z: at a centre on +X, yaw 0 looks toward +Z and yaw PI/2 (east) toward -Y. yaw is wrapped to [-PI, PI), so yaw = PI reads back -PI; a centre on a pole is moved off it.
59. attachFreeControl moves on WASD and arrows, Space/PageUp up, ShiftLeft/ShiftRight/PageDown down, and turns on a drag with button 0, 1 or 2. One 16 ms frame of W moves speed*16/sqrt(100000). Without a scene nothing moves.
60. In interpolateArcRotateCamera both alpha and beta take the shortest arc mod 2*PI, goals are clamped to the camera's limits every frame, a NaN goal field counts as omitted, and the end snaps exactly to the clamped goal.
61. Arc-rotate key speed comes from the keyboard options (angularSensitivity 100, panningSensitivity 50, zoomingSensitivity 25), not the camera's sensibilities; held keys add input every frame, heard on the canvas.
62. interpolateArcRotateCamera ends with alpha, beta and radius set exactly to the goal clamped to the limit fields, alpha unwrapped: a goal of 2*PI from alpha 0 ends on the first frame at 2*PI; a goal past a limit ends on the limit.
63. A geospatial camera's yaw and pitch read back wrapped to [-PI, PI): yaw = 4 reads 4 - 2*PI, yaw = PI reads -PI.
64. checkCollisions (default false) in attachGeospatialControls lifts center each frame so the eye stays at least limits.planetRadius + limits.radiusMin from the origin.
65. attachGeospatialControls picks by a ray against a sphere of limits.planetRadius at the origin, not scene meshes. A button-0 double-click flies center to the picked point over doubleTapAnimationDurationMs (1000).
66. When the setCameraLimits clamp hits a bound it zeroes that channel's inertial offset. Only the function returned by the latest setCameraLimits call stops the clamping; it leaves the limit fields set.
67. When camera._useFloatingOrigin is set, getViewMatrix zeroes its translation, so the matrices are camera-relative; projectWorldToScreen then needs worldOrigin set to the camera's world position.
68. After a pan or zoom ends, the center moves to where the look vector hits the planet, radius set to that distance. checkCollisions (default false) keeps the eye at least planetRadius+radiusMin from the origin.
69. attachFreeControl stops look inertia once the decayed turn (drag px / angularSensitivity, times inertia each frame) falls below speed * 0.001, so at speed 1000 a 200 px drag turns once with no glide while a 3000 px drag still glides.
70. attachFreeControl listens for keys on the canvas, setting tabIndex 0 if it has no tabindex, so keys work only while the canvas has focus. Buttons 0, 1 and 2 all drag to look; there is no pointer lock.
71. attachGeospatialControls clamps rotated pitch to [0, PI/2-0.001] before the limits, and picks by ray against a sphere of limits.planetRadius at the origin, not against meshes.
72. A FreeCamera whose view direction is parallel to world Y (target straight above or below) gets an identity rotation and looks along +Z.
73. A FreeCamera's view is built from position and target alone. Moving position keeps it aimed at the same target point, so it turns; to translate, move target by the same amount.
74. Rotate drag: inertialAlphaOffset -= dx/angularSensibility and inertialBetaOffset -= dy/angularSensibility; each frame alpha and beta add their offset.
75. Geospatial keys: arrows pan north/east by radius*0.0015 per frame, Ctrl+arrows rotate, Equal/NumpadAdd and Minus/NumpadSubtract zoom along the look vector.
76. attachGeospatialControls flies the centre to the clicked globe point over 1000 ms on a dblclick with button 0 and buttons 0; a dblclick with buttons 1 (a button still held) is ignored.
77. Arc keyboard listeners are on the canvas (given tabIndex 0 if it has none), so it needs focus; blur clears held keys. A custom key list replaces that direction's arrow default; codes are KeyboardEvent.code.
78. fov, nearPlane and farPlane are plain fields; a write takes effect at the next getProjectionMatrix/getViewProjectionMatrix call, which compares them by value.
79. getCameraPosition reads the world matrix translation, so it includes the camera's parent transform.
80. Ortho bounds are view-space world units around the camera's view axis; depth still comes from camera.nearPlane and farPlane.
81. In a right-handed build the controls flip the sign of alpha/yaw and horizontal pan, so a drag turns the same way on screen.
82. projectPointToViewportToRef does no validation, allocates per call, multiplies transform by a world matrix, accepts zero-size viewports, and writes only x, y, z.

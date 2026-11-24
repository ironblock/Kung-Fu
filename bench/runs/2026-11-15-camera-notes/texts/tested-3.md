# Notes on how the camera code of Babylon Lite 1.39.0 behaves

1. attachControl's drag, wheel and keys only add to the camera's inertial*Offset fields; alpha, beta, radius and target change only when the scene's _beforeRender runs. Without the scene argument the camera never moves (pinch excepted).
2. Writing lowerRadiusLimit, upperBetaLimit etc. straight onto a camera clamps nothing until setCameraLimits has been called on it once; radius = 50 with upperRadiusLimit 12 stays 50, also under attachControl.
3. setCameraLimits clamps the current pose at once, and from then on every alpha/beta/radius write is clamped in the same statement and zeroes that inertial offset; limit fields written later are honoured on the next write.
4. Each geospatial yaw/pitch/radius write clamps pitch against the radius at that moment; by default pitch is forced to 0.001 at radius >= 4*planetRadius, so pitch = 1 at the start is lost. Use setGeospatialOrientation({pitch, radius}).
5. Projection is reverse-Z with depth in [0,1]: a point at nearPlane gets depth 1 and one at farPlane depth 0, also in projectWorldToScreen's z.
6. createArcRotateCamera sets nearPlane 0.1 and farPlane 1000 (createFreeCamera: 1 and 10000), fov 0.8, and panningSensibility 50.
7. An ArcRotate camera's target is an observable vector: write target.x/y/z in place. Assigning a new object to camera.target leaves worldMatrix stale, and later writes to that plain object are not seen either.
8. Free-camera controls steer by _yaw/_pitch, which are computed only at creation. A target written later is replaced on the next control move or turn by position + unit look vector from the old yaw/pitch.
9. attachControl's keyboard option does nothing unless enableArcRotateKeyboardControls() ran before attachControl. Keys are heard on the canvas (tabIndex set to 0) and held keys add 1/angularSensitivity (default 100) once per frame.
10. interpolateArcRotateCamera zeroes the inertial offsets on its first frame, then rejects with an 'interrupted' Error if anything else changes alpha, beta, radius or target between frames: a drag, a direct write, or a newer interpolation.
11. getViewMatrix, getProjectionMatrix and getViewProjectionMatrix return the camera's own cache array, overwritten in place on the next call after a change; copy it to keep a value.
12. An ArcRotate camera has no beta limits by default; attachControl's frame step clamps beta to [0.01, PI-0.01], but only on frames where inertialAlphaOffset or inertialBetaOffset is non-zero. beta = 0 written directly stays 0.
13. attachControl's wheel does inertialRadiusOffset -= deltaY*radius/(wheelPrecision*1000) and each frame radius -= that offset, so positive deltaY zooms out, in steps proportional to radius; radius never goes below 0.01.
14. A right-drag of dx px adds -dx/panningSensibility to inertialPanningX; each frame the target moves inertialPanningX*radius/1000 along the camera's right vector, then the offset is multiplied by panningInertia.
15. resolveCameraViewport measures camera.viewport.y from the bottom but returns y from the top: {x:0,y:0,width:0.5,height:0.5} on 800x600 gives {x:0,y:300,width:400,height:300}; fractions are clamped to [0,1].
16. getProjectionMatrix does not apply camera.viewport; pass getEffectiveAspectRatio(camera, width, height) as the aspect to match what is rendered.
17. projectWorldToScreen's x/y are backing pixels from the canvas top-left, including viewport.x/y, with y growing downwards; cssX/cssY are x/y scaled by cssWidth/backingWidth and cssHeight/backingHeight.
18. projectWorldToScreen: a point behind the camera has behindCamera, offscreen and clipped true; one past farPlane but in frame has only clipped; x/y are never clamped, so an off-side point keeps an x beyond the viewport.
19. projectWorldToScreen throws RangeError when the viewport width/height or backingWidth/backingHeight is not positive, or when only one of cssWidth/cssHeight is given.
20. createGeospatialCamera puts the planet at the origin with north +Z, center at (planetRadius,0,0), radius 4*planetRadius, pitch 0.001 (looking straight down), yaw 0, nearPlane 1 and farPlane 16*planetRadius.
21. Writing camera.center.x in place on a geospatial camera recomputes nothing; assign a whole object to camera.center, which copies it and recomputes position.
22. flyGeospatialCameraToAsync resolves, never rejects, when cut short by a newer flight or by input through attachGeospatialControls; the camera stays where the flight stopped.
23. attachGeospatialControls listens for keys on window, not on the canvas, so it throws where there is no window; ArrowUp pans the center north (+Z).
24. attachGeospatialControls: a left drag pans the center; a drag with any other button rotates, yaw += dx*PI/500 with no coasting.
25. Geospatial limits.radiusMin is 10 whatever planetRadius is, and radiusMax is 4*planetRadius; every radius write is clamped into them at once.
26. A geospatial camera's yaw and pitch read back wrapped to [-PI, PI): yaw = 4 reads 4 - 2*PI, yaw = PI reads -PI.
27. Changing camera.limits on a geospatial camera re-clamps nothing until the next yaw/pitch/radius/center write.
28. enableOrthographicCamera defaults halfHeight to 1; null planes are +-halfHeight vertically and +-halfHeight*aspect horizontally, fov is ignored, and writes to the returned bounds take effect on the next getProjectionMatrix.
29. Assigning camera.ortho by hand is ignored (perspective is used) until enableOrthographicCamera has been called at least once.
30. Calling enableOrthographicCamera again replaces camera.ortho with fresh bounds; the old object no longer drives the projection. disableOrthographicCamera sets camera.ortho to null.
31. attachFreeControl moves on KeyW/A/S/D and the arrows, up on Space/PageUp, down on ShiftLeft/ShiftRight/PageDown, matched by event.code on keys heard by the canvas (tabIndex set to 0).
32. attachFreeControl's forward/back moves along the full look direction, pitch included, so it climbs when looking up; Space moves along world +Y only.
33. attachFreeControl turns on a drag with button 0, 1 or 2 (yaw += dx/angularSensitivity, right drag turns right, down drag looks down); pitch is clamped to +-(PI/2 - 0.01).
34. attachFreeControl and attachConfigurableFreeControl given no scene never move the camera: all motion is applied in their _beforeRender step.
35. Each frame a held key adds speed*deltaMs/sqrt(100000) to a velocity that is applied, then multiplied by inertia, so a free camera keeps coasting after the key is released.
36. createFreeCamera sets _yaw = atan2(dx, dz) of the look direction (0 looks along +Z); writing _yaw alone does not change the view until a control move rebuilds target from it.
37. interpolateArcRotateCamera ends with alpha set exactly to the goal, unwrapped: a goal of 2*PI from alpha 0 finishes on the first frame with alpha 2*PI. A radius goal beyond the camera's limits settles on the limit.
38. Each frame interpolateArcRotateCamera moves 1 - 2^(-dt/interpolationFactor) of the remaining way, dt being the frame delta in seconds and the factor 0.1 by default; a factor <= 0 snaps on the first frame.
39. attachControl: the middle button (1) does nothing, Ctrl+left still rotates (no pan), and a touch pointer always rotates whatever pointerMappings.primaryButton says.
40. Arc-rotate keys: ArrowUp lowers beta and ArrowRight raises alpha; with Ctrl the arrows pan (inertialPanningX/Y); with Alt, ArrowUp lowers radius by 1/zoomingSensitivity (default 25) per frame.
41. A two-finger pinch writes radius directly as startRadius * startDistance / currentDistance, with no inertia and no scene needed.
42. The function setCameraLimits returns stops all clamping but leaves the limit fields set on the camera.
43. disposeScene does not remove attachControl's canvas listeners; only the function attachControl returns does.
44. attachControl's inertia ignores the frame delta: each frame adds the whole offset, then multiplies it by inertia, at any frame rate.
45. In attachConfigurableFreeControl, fastKeys do nothing unless fastMultiplier is set (default 1), and upKeys replaces the Space/PageUp defaults instead of adding to them.
46. flyGeospatialCameraToAsync times the flight from the frame deltas given to _beforeRender (durationMs default 1000) and turns yaw the short way round (3 to -3 passes through PI).
47. attachGeospatialControls' wheel uses only the sign of deltaY: -1 and -500 zoom the same, and negative deltaY zooms in.
48. Input through attachGeospatialControls on any frame ends a running flyGeospatialCameraToAsync, whose promise then resolves.
49. A geospatial center within about 0.04 degrees of a pole (+-Z) is moved to that latitude, keeping its distance from the origin.
50. Free-camera turning stops once the decayed turn falls below speed*0.001, so a large speed (e.g. 100) removes look coasting.

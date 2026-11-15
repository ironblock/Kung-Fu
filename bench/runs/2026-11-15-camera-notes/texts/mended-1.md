# Notes on how the camera code of Babylon Lite 1.39.0 behaves

1. attachControl without a scene moves nothing on drags or wheel: they only add to inertialAlphaOffset, inertialRadiusOffset and the like, applied by the hook it pushes on scene._beforeRender. A two-finger pinch still writes radius at once.
2. Hand-written limit fields clamp no alpha/beta/radius write until setCameraLimits has run; after it, a write that changes the value is clamped at once to the current fields. interpolateArcRotateCamera obeys the fields either way.
3. Projection is reverse-Z: getProjectionMatrix maps nearPlane to depth 1 and farPlane to depth 0, so the z of projectWorldToScreen is 1 at the near plane and 0 at the far plane.
4. createArcRotateCamera starts with fov 0.8, nearPlane 0.1 and farPlane 1000.
5. Assigning a new object to an ArcRotateCamera's target marks nothing dirty: it and later edits to it show only when the matrix is next rebuilt (at the first read, or after an alpha, beta or radius change). Edit target.x/y/z in place.
6. GeospatialCamera clamps pitch to getEffectivePitchMax of the asked radius, before radius is clamped: pitchMin (0.001) at the default 4*planetRadius. Set radius first or use setGeospatialOrientation; zooming out lowers pitch for good.
7. interpolateArcRotateCamera rejects its promise if alpha, beta, radius or target change by anything else between its frames, a second call on the camera included; a change before its first frame becomes the start. That frame zeroes inertia.
8. An interrupted flyGeospatialCameraToAsync resolves its promise, it does not reject: a second fly on the same camera ends the first where it is.
9. attachFreeControl rebuilds target as position plus a unit vector from the yaw and pitch taken at createFreeCamera; a target written later is replaced on the first key move.
10. attachControl's wheel does inertialRadiusOffset -= deltaY * radius / (wheelPrecision * 1000), so a wheel step zooms by a share of the current radius, and positive deltaY moves the camera out.
11. The keyboard option of attachControl is ignored unless enableArcRotateKeyboardControls() was called first; once it was, keys are heard on the canvas, and a canvas with no tabindex attribute gets tabIndex 0.
12. An attachControl pan moves the target by (drag pixels / panningSensibility) * radius / 1000 per frame of offset, so panning speed grows with radius.
13. Each frame attachControl adds the whole alpha/beta offset (subtracts inertialRadiusOffset from radius), then multiplies it by inertia; pan offsets decay by panningInertia instead, so inertia 0 stops a drag or zoom at once but not a pan.
14. attachControl clamps beta to [0.01, PI-0.01] only on frames that apply rotation offset (a direct beta write is left alone), never wraps alpha, and keeps radius at least 0.01 after wheel zoom.
15. createFreeCamera starts with fov 0.8, nearPlane 1 and farPlane 10000, unlike createArcRotateCamera's 0.1 and 1000.
16. createGeospatialCamera starts at center (planetRadius,0,0), radius 4*planetRadius, yaw 0, pitch 0.001 (looking straight down); the pole axis is world Z, so a tilt at yaw 0 looks toward +Z, and at yaw PI/2 it has no Z part.
17. createGeospatialCamera's limits default to radiusMin 10 (in world units, whatever the planet size) and radiusMax 4*planetRadius; the camera has nearPlane 1 and farPlane 16*planetRadius.
18. Editing camera.center.x/y/z in place on a GeospatialCamera moves nothing until the next yaw, pitch or radius change, which re-orbits around the edited centre; assigning a Vec3 to center re-orbits at once and copies it.
19. attachGeospatialControls pans the centre on left drag and turns yaw on right drag; it listens for keys on window, not on the canvas, and leaves the canvas tabIndex alone.
20. Assigning camera.ortho = null by hand keeps the cached orthographic matrix, and the rebuild after a fov write still has the ortho p[12], p[13] and p[15]=1; disableOrthographicCamera clears those and switches at once.
21. enableOrthographicCamera defaults halfHeight to 1 with every plane null, so the view is 2 units tall and 2*aspect wide; fov is ignored while ortho is set, and a halfHeight write shows on the next getProjectionMatrix.
22. In attachFreeControl, KeyW and ArrowUp both move along the look direction including pitch, Space moves straight up world Y, and a middle-button drag turns the camera, as a left drag does.
23. disposeScene does not remove the canvas listeners added by attachControl; only the function attachControl returns does.
24. getViewMatrix, getProjectionMatrix and getViewProjectionMatrix return the camera's own cache object, overwritten in place on the next change (or other aspect); copy it to keep a value.
25. camera.viewport y counts from the bottom, but resolveCameraViewport's pixel y counts from the top and clamps the rectangle to the target; getEffectiveAspectRatio multiplies width/height by viewport.width/viewport.height.
26. attachControl ignores middle-button drags, and a touch pointer always rotates whatever pointerMappings.primaryButton says; a mouse primary drag follows the mapping.
27. A two-finger pinch sets radius at once to startRadius * startDistance / currentDistance, with no inertia and no scene frame needed.
28. Each frame held arrows add 1/angularSensitivity (100) to the offsets, split over two held keys (0.01/sqrt2 each): ArrowRight raises alpha, ArrowUp lowers beta; Ctrl+Arrow pans; Alt+ArrowUp cuts radius by 1/zoomingSensitivity (25).
29. interpolateArcRotateCamera moves alpha the short way round but ends with alpha exactly equal to the goal value, unwrapped; a goal radius outside the limits ends at the limit.
30. When the setCameraLimits clamp hits a bound it zeroes that channel's inertial offset. Only the function returned by the latest setCameraLimits call stops the clamping; it leaves the limit fields set.
31. setCameraLimits writes only the fields present in its argument, so calls add up; a field passed as undefined removes that bound.
32. attachGeospatialControls zooms by the sign of wheel deltaY only, and the zoom coasts over later frames, while a right-drag rotation stops on the first frame without input.
33. A wheel event with nonzero deltaY heard by attachGeospatialControls during a flyGeospatialCameraToAsync ends the fly on the next frame and resolves its promise; one with deltaY 0 (a sideways scroll) does not.
34. attachFreeControl clamps _pitch to +-(PI/2 - 0.01). A downward drag lowers _pitch by pixels / angularSensitivity on the next frame, then coasts by inertia: about 10 times that in all at the default 0.9, exactly that at 0.
35. Each frame a held move key adds speed * max(deltaMs, 1) / sqrt(100000) to the free camera's move, which then decays by inertia, so the distance per frame scales with deltaMs and a 0 ms frame moves as 1 ms does.
36. In attachConfigurableFreeControl fastKeys do nothing unless fastMultiplier is set (default 1); upKeys replaces the default Space/PageUp rather than adding to them.
37. Writing upVector of a createBankedFreeCamera camera rolls it at once; a createFreeCamera camera has no upVector and always uses world +Y.
38. Calling enableOrthographicCamera again, as after disableOrthographicCamera, installs a fresh bounds object with halfHeight 1 and null planes; earlier bounds values are not kept.
39. projectWorldToScreen throws RangeError for a zero-size viewport or for cssWidth given without cssHeight; projectPointToViewportToRef takes a zero-size viewport.
40. projectWorldToScreen does not clamp x and y: a point off the side keeps its extrapolated pixel position, and a point behind the camera gets behindCamera and offscreen true with finite coordinates.
41. GeospatialCamera wraps yaw to [-PI, PI), so yaw 4 reads back as 4-2PI and yaw PI as -PI.
42. A GeospatialCamera centre on the Z axis (a pole) is moved to latitude about 89.96 degrees at the same distance from the origin.
43. attachGeospatialControls flies the centre to the clicked globe point over 1000 ms on a dblclick with button 0 and buttons 0; a dblclick with buttons 1 (a button still held) is ignored.

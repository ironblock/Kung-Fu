# EDIT

58 notes out of 78. Merged 20, narrowed 5, scoped 19, unchanged 14, dropped 0 (parts of four notes dropped, said below). Texts: 14816 bytes before, 14052 after.

Numbers: `n` is the place in edited/facts.json and the probe edited/probes/<n>.test.ts; `u` is the place in union/facts.json.

## Changed notes

### n01 (scoped; u1)
- was u1: attachControl without a scene moves nothing on drags or wheel: they only add to inertialAlphaOffset, inertialRadiusOffset and the like, applied by the hook it pushes on scene._beforeRender. A two-finger pinch still writes radius at once.
- now: attachControl without a scene moves nothing on drags, wheel or keys: they only add to the inertial offsets (inertialAlphaOffset, inertialRadiusOffset, ...), which only the hook it pushes on scene._beforeRender applies. A two-finger pinch still writes radius at once.
- why: keys also only feed offsets (with the keyboard module on); 'and the like' named.

### n02 (merged; u2, u29, u62)
- was u2: Hand-set lower/upper alpha/beta/radius limit fields clamp no write until setCameraLimits runs (interpolateArcRotateCamera clamps its goals anyway). After it each write is clamped at once; the call clamps the pose and zeroes that offset.
- was u29: setCameraLimits clamps the current pose at once; from then on each write that changes alpha/beta/radius is clamped in the same statement, using the limit fields as they are then, and zeroes that inertial offset only if it hit a bound.
- was u62: When the setCameraLimits clamp hits a bound it zeroes that channel's inertial offset. Only the function returned by the latest setCameraLimits call stops the clamping; it leaves the limit fields set.
- now: Limit fields set by hand clamp nothing until setCameraLimits runs (interpolateArcRotateCamera clamps its goals to them anyway). setCameraLimits clamps the pose at once; after it, any write that changes alpha, beta or radius re-clamps all three against the fields as they are then, zeroing an offset only at a hit bound.
- why: merged union 29 and the clamp part of 62; said that any changing write re-clamps all three channels (a write to alpha clamps an out-of-range radius too) and that a same-value write clamps nothing.

### n03 (scoped; u3)
- was u3: Assigning a new object to ArcRotateCamera.target does not mark the camera dirty, nor do writes to it. It shows up at the next alpha/beta/radius write that changes the value (cam.radius = cam.radius does not). Write target.x/y/z in place.
- now: Assigning a new object to ArcRotateCamera.target does not mark the camera dirty, nor do writes to that object: the view shows them only at the next alpha/beta/radius write that changes the value (cam.radius = cam.radius does not). Keep the original target and write target.x/y/z in place.
- why: said the view shows the new object only at a write that changes alpha/beta/radius; kept the advice.

### n05 (merged; u5, u52)
- was u5: attachFreeControl aims from FreeCamera._yaw/_pitch, set only at creation and by its own drags. A target set by hand is replaced on the next key move or drag, with target placed 1 unit ahead of position.
- was u52: createFreeCamera sets _yaw = atan2(dx, dz) of the look direction (0 looks along +Z); writing _yaw alone does not change the view until a control move rebuilds target from it.
- now: attachFreeControl and attachConfigurableFreeControl aim from FreeCamera._yaw/_pitch, set by createFreeCamera (_yaw = atan2(dx, dz), 0 looks along +Z) and their drags. Each key move or drag puts target 1 unit ahead of position along _yaw/_pitch, replacing a hand-set target; a hand-written _yaw shows only then.
- why: merged 52 (_yaw from atan2, written _yaw shows only at the next rebuild); both control functions; the old 'set only at creation and by its own drags' read as if _yaw could not be written.

### n06 (scoped; u6)
- was u6: interpolateArcRotateCamera rejects its promise if alpha, beta, radius or target change by anything else between its frames, a second call on the camera included; a change before its first frame becomes the start. That frame zeroes inertia.
- now: interpolateArcRotateCamera rejects its promise if, at a later frame, alpha, beta, radius or target.x/y/z differ from what it last wrote, so a changing write between its frames cancels it (a second interpolation included). A change before its first frame becomes the start; that frame zeroes all five inertial offsets.
- why: said what counts as a change (differs from what it last wrote, so a same-value write does not cancel); 'inertia' named as all five offsets.

### n07 (merged; u7, u45)
- was u7: GeospatialCamera clamps pitch against the radius it is applied with: from 4*planetRadius pitch is forced to 0.001, falling linearly from 2R; the start radius is 4R (or 10 if larger). Set radius first, or both in setGeospatialOrientation.
- was u45: With default limits a GeospatialCamera's pitch is forced to pitchMin (0.001) at radius >= 4*planetRadius and is free only at <= 2*planetRadius. The camera starts at radius 4*planetRadius, so a pitch set there stays ~0.
- now: GeospatialCamera clamps pitch against the radius it is applied with: with default limits pitch is free up to pitchMax at radius <= 2*planetRadius, forced to pitchMin (0.001) at >= 4*planetRadius, linear between. The camera starts at 4*planetRadius, so set radius before pitch, or both in one setGeospatialOrientation.
- why: merged 45; the two notes gave the same rule in two shapes.

### n09 (merged; u9, u73, u57)
- was u9: attachControl's keyboard: true is ignored unless enableArcRotateKeyboardControls() ran first. Keys are heard on the canvas (tabIndex made 0 if no tabindex attribute); held arrows add 1/angularSensitivity (default 100) per frame, normalised.
- was u73: Arc keyboard listeners are on the canvas (given tabIndex 0 if it has none), so it needs focus; blur clears held keys. A custom key list replaces that direction's arrow default; codes are KeyboardEvent.code.
- was u57: Arc-rotate key speed comes from the keyboard options (angularSensitivity 100, panningSensitivity 50, zoomingSensitivity 25), not the camera's sensibilities; held keys add input every frame, heard on the canvas.
- now: attachControl's keyboard option is ignored unless enableArcRotateKeyboardControls() ran first. Keys are heard on the canvas (tabIndex set to 0 if it has no tabindex attribute) and matched by KeyboardEvent.code; blur clears held keys; a custom keys list replaces only that direction's arrow.
- why: merged 73 and the 'heard on the canvas' part of 57; the 'normalised' and per-frame part went to 36, where Alt is not normalised.

### n10 (merged; u10, u50)
- was u10: flyGeospatialCameraToAsync resolves, never rejects, when cut short by a newer flight or by input through attachGeospatialControls; the camera stays where the flight stopped.
- was u50: A wheel event with nonzero deltaY heard by attachGeospatialControls during a flyGeospatialCameraToAsync ends the fly on the next frame and resolves its promise; one with deltaY 0 (a sideways scroll) does not.
- now: flyGeospatialCameraToAsync never rejects: it resolves at its end, when a newer flight starts, or on the next frame after attachGeospatialControls input that pans, rotates or zooms (a wheel with deltaY 0 does none). Direct yaw/pitch/radius writes do not stop it. The camera stays where the flight stopped.
- why: merged 50: which input ends a flight (pan, rotate or zoom; a deltaY 0 wheel or an unmapped key does not); added that direct yaw/pitch/radius writes do not stop it.

### n11 (scoped; u11)
- was u11: Writing GeospatialCamera.center.x/y/z in place moves no eye at once, but the next yaw/pitch/radius write orbits the changed center. Assign a whole new object to center (or use setGeospatialOrientation) to re-orbit at once.
- now: Writing GeospatialCamera.center.x/y/z in place moves no eye at once; the next yaw/pitch/radius write that changes the value orbits the changed center. Assigning any object to center (even camera.center itself) or calling setGeospatialOrientation re-orbits at once; the assigned object is copied.
- why: 'next write' limited to writes that change the value; 'a whole new object' widened to any assignment (camera.center itself works), as 35 says; the object is copied.

### n12 (scoped; u12)
- was u12: enableOrthographicCamera defaults halfHeight to 1; null planes are +-halfHeight vertically and +-halfHeight*aspect horizontally, fov is ignored, and writes to the returned bounds take effect on the next getProjectionMatrix.
- now: enableOrthographicCamera defaults halfHeight to 1; null planes are +-halfHeight vertically and +-halfHeight*aspect horizontally, and fov is ignored. A write that changes a field of the returned bounds takes effect at the next getProjectionMatrix, while that object is still camera.ortho.
- why: 'writes to the returned bounds take effect' limited to writes that change a value, while that object is still camera.ortho (23).

### n15 (scoped; u15)
- was u15: disposeScene does not remove the canvas listeners added by attachControl; only the function attachControl returns does.
- now: disposeScene does not remove the canvas listeners added by attachControl. The function attachControl returns does; so does disposeScene if that function was registered with onSceneDispose(scene, fn).
- why: onSceneDispose(scene, fn) also makes disposeScene remove them; the old 'only the function' was false.

### n17 (scoped; u17)
- was u17: Projection is reverse-Z: getProjectionMatrix maps nearPlane to depth 1 and farPlane to depth 0, so the z of projectWorldToScreen is 1 at the near plane and 0 at the far plane.
- now: Projection is reverse-Z, perspective and orthographic alike: getProjectionMatrix maps nearPlane to depth 1 and farPlane to depth 0, so the z of projectWorldToScreen is 1 at the near plane and 0 at the far plane.
- why: orthographic projection is reverse-Z too.

### n18 (narrowed; u18)
- was u18: attachControl's wheel does inertialRadiusOffset -= deltaY*radius/(wheelPrecision*1000) and each frame radius -= that offset, so positive deltaY zooms out, in steps proportional to radius; radius never goes below 0.01.
- now: attachControl's wheel does inertialRadiusOffset -= deltaY*radius/(wheelPrecision*1000) and each frame radius -= that offset, so positive deltaY zooms out, in steps proportional to radius. The frame step and the pinch never take radius below 0.01; a direct write can.
- why: 'radius never goes below 0.01' was false for a direct write; limited to the frame step and the pinch.

### n19 (scoped; u19)
- was u19: A right-drag of dx px adds -dx/panningSensibility to inertialPanningX; each frame the target moves inertialPanningX*radius/1000 along the camera's right vector, then the offset is multiplied by panningInertia.
- now: A right-drag of (dx, dy) px adds -dx/panningSensibility to inertialPanningX and dy/panningSensibility to inertialPanningY; each frame, with 0 < beta < PI, the target moves inertialPanningX*radius/1000 along the camera's right vector (-sin(alpha), 0, cos(alpha)), then the offset is multiplied by panningInertia.
- why: added the dy part, the right vector itself, and the beta range it holds for (outside it the sign flips).

### n20 (merged; u20, u44)
- was u20: createGeospatialCamera's limits default to radiusMin 10 (in world units, whatever the planet size) and radiusMax 4*planetRadius; the camera has nearPlane 1 and farPlane 16*planetRadius.
- was u44: createGeospatialCamera starts at center (R,0,0), yaw 0, pitch 0.001, radius 4R, nearPlane 1, farPlane 16R; limits radiusMin 10, radiusMax 4R, pitchMax PI/2-0.01 clamp radius writes. If 4R < 10 it starts at 10 and writes above 10 give 4R.
- now: createGeospatialCamera starts at center (planetRadius,0,0), yaw 0, pitch 0.001, radius 4*planetRadius, nearPlane 1, farPlane 16*planetRadius; limits radiusMin 10 (whatever the planet size), radiusMax 4*planetRadius. If 4*planetRadius < 10 it starts at 10; writes above 10 give 4*planetRadius, below 10 give 10.
- why: merged 44 (start pose) into the defaults note; fixed 44's tangled limits sentence; added that writes below 10 give 10 when 4R < 10.

### n21 (merged; u21, u38, u67)
- was u21: attachGeospatialControls pans the centre on left drag and turns yaw on right drag; it listens for keys on window, not on the canvas, and leaves the canvas tabIndex alone.
- was u38: attachGeospatialControls: a left drag pans the center; a drag with any other button rotates, yaw += dx*PI/500 with no coasting.
- was u67: attachGeospatialControls clamps rotated pitch to [0, PI/2-0.001] before the limits, and picks by ray against a sphere of limits.planetRadius at the origin, not against meshes.
- now: attachGeospatialControls hears keys on window, not the canvas, and leaves tabIndex alone. A left drag pans the center only if the press hits the planet sphere; a drag with any other button rotates with no coasting, yaw += dx*PI/500 and pitch += dy*PI/500, pitch clamped to [0, PI/2-0.001] before the limits.
- why: merged 38 (rotation with any other button, no coasting) and the pitch-clamp part of 67; left drag pans only when the press hits the planet sphere (a press on sky does nothing); rotation changes pitch too.

### n22 (scoped; u22)
- was u22: attachControl's two-finger pinch writes radius directly, scaling it by start distance / current distance, before any frame runs and with no inertial offset.
- now: attachControl's two-finger touch pinch (touchstart/touchmove events) sets radius to start radius * start distance / current distance, at least 0.01, at once: before any frame runs and with no inertial offset.
- why: named the touch events and the 0.01 floor.

### n24 (merged; u24, u31)
- was u24: projectWorldToScreen: a point behind the camera has behindCamera, offscreen and clipped true; one past farPlane but in frame has only clipped; x/y are never clamped, so an off-side point keeps an x beyond the viewport.
- was u31: projectWorldToScreen returns x/y in backing pixels, cssX/cssY scaled by cssWidth/backingWidth, z as 0..1 depth, and offscreen x/y unclamped. It throws RangeError on a zero-size viewport or a cssWidth without cssHeight.
- now: projectWorldToScreen: a point behind the camera has behindCamera, offscreen and clipped true; one in frame but past farPlane or nearer than nearPlane has only clipped. Finite x/y are never clamped, so an off-side point keeps an x beyond the viewport; a point on the camera plane (clipW 0) gives NaN.
- why: merged the unclamped-x/y part of 31; nearer than nearPlane is also only clipped; finite x/y only: a point on the camera plane gives NaN.

### n25 (merged; u25, u55, u66)
- was u25: In attachFreeControl, KeyW and ArrowUp both move along the look direction including pitch, Space moves straight up world Y, and a middle-button drag turns the camera, as a left drag does.
- was u55: attachFreeControl moves on WASD and arrows, Space/PageUp up, ShiftLeft/ShiftRight/PageDown down, and turns on a drag with button 0, 1 or 2. One 16 ms frame of W moves speed*16/sqrt(100000). Without a scene nothing moves.
- was u66: attachFreeControl listens for keys on the canvas, setting tabIndex 0 if it has no tabindex, so keys work only while the canvas has focus. Buttons 0, 1 and 2 all drag to look; there is no pointer lock.
- now: In attachFreeControl, KeyW/ArrowUp and KeyS/ArrowDown move along the look direction including pitch, KeyA/KeyD and ArrowLeft/ArrowRight sideways, Space/PageUp straight up world Y, ShiftLeft/ShiftRight/PageDown down. Keys are heard on the canvas, given tabIndex 0 if it has no tabindex attribute.
- why: merged 55 (key list) and the canvas/tabIndex part of 66; buttons went to 37.

### n26 (merged; u26, u31)
- was u26: projectWorldToScreen throws RangeError when the viewport width/height or backingWidth/backingHeight is not positive, or when only one of cssWidth/cssHeight is given.
- was u31: projectWorldToScreen returns x/y in backing pixels, cssX/cssY scaled by cssWidth/backingWidth, z as 0..1 depth, and offscreen x/y unclamped. It throws RangeError on a zero-size viewport or a cssWidth without cssHeight.
- now: projectWorldToScreen returns x/y in canvas backing pixels (viewport.x/y added, y down), cssX/cssY = x*cssWidth/backingWidth, y*cssHeight/backingHeight, and z as NDC depth. It throws RangeError if viewport width/height or backingWidth/backingHeight is not positive and finite, or only one of cssWidth/cssHeight is given.
- why: merged 31 (units, throws) with 26 (throws); one account of when it throws (also non-finite sizes).

### n27 (merged; u27, u55)
- was u27: Each frame a held move key adds speed * max(deltaMs, 1) / sqrt(100000) to the free camera's move, which then decays by inertia, so the distance per frame scales with deltaMs and a 0 ms frame moves as 1 ms does.
- was u55: attachFreeControl moves on WASD and arrows, Space/PageUp up, ShiftLeft/ShiftRight/PageDown down, and turns on a drag with button 0, 1 or 2. One 16 ms frame of W moves speed*16/sqrt(100000). Without a scene nothing moves.
- now: In attachFreeControl and attachConfigurableFreeControl each frame a held move key adds speed*max(deltaMs, 1)/sqrt(100000) to the move velocity, which then decays by inertia once per frame whatever deltaMs, and is zeroed below speed*0.001. So one frame's step scales with deltaMs; a 0 ms frame moves as 1 ms does.
- why: merged the 16 ms step of 55; both control functions; the decay is once per frame whatever deltaMs, so the glide is not frame-rate independent; the zeroing threshold.

### n29 (merged; u30, u55)
- was u30: attachFreeControl and attachConfigurableFreeControl given no scene never move the camera: all motion is applied in their _beforeRender step.
- was u55: attachFreeControl moves on WASD and arrows, Space/PageUp up, ShiftLeft/ShiftRight/PageDown down, and turns on a drag with button 0, 1 or 2. One 16 ms frame of W moves speed*16/sqrt(100000). Without a scene nothing moves.
- now: attachFreeControl and attachConfigurableFreeControl given no scene never move the camera: all motion is applied in their _beforeRender step.
- why: merged the 'without a scene nothing moves' part of 55 (text kept).

### n30 (scoped; u32)
- was u32: Each frame interpolateArcRotateCamera moves 1 - 2^(-dt/interpolationFactor) of the remaining way, dt being the frame delta in seconds (a delta <= 0 counts as 1/60 s) and the factor 0.1 by default; a factor <= 0 snaps on the first frame.
- now: Each frame interpolateArcRotateCamera moves 1 - 2^(-dt/interpolationFactor) of the remaining way (for alpha and beta, of the shortest arc), dt being the frame delta in seconds (a delta <= 0 counts as 1/60 s) and the factor 0.1 by default; a factor <= 0 snaps on the first frame.
- why: for alpha/beta the share is of the shortest arc.

### n31 (merged; u33, u62)
- was u33: setCameraLimits writes only the fields present in its argument, so calls add up; a field passed as undefined removes that bound.
- was u62: When the setCameraLimits clamp hits a bound it zeroes that channel's inertial offset. Only the function returned by the latest setCameraLimits call stops the clamping; it leaves the limit fields set.
- now: setCameraLimits writes only the fields present in its argument, so calls add up; a field passed as undefined removes that bound. Only the function returned by the latest call stops the clamping, and it leaves the limit fields set.
- why: merged the disposer part of 62.

### n32 (merged; u34, u70)
- was u34: Each frame attachControl adds the whole alpha/beta offset (subtracts inertialRadiusOffset from radius), then multiplies it by inertia; pan offsets decay by panningInertia instead, so inertia 0 stops a drag or zoom at once but not a pan.
- was u70: Rotate drag: inertialAlphaOffset -= dx/angularSensibility and inertialBetaOffset -= dy/angularSensibility; each frame alpha and beta add their offset.
- now: A rotate drag subtracts dx/angularSensibility from inertialAlphaOffset and dy/angularSensibility from inertialBetaOffset. Each frame attachControl adds both, subtracts inertialRadiusOffset from radius, and multiplies the three by inertia; pans decay by panningInertia, so inertia 0 ends rotation and zoom in one frame.
- why: merged 70 (drag offsets); 'stops at once' said as 'in one frame'.

### n35 (narrowed; u37)
- was u37: A change to GeospatialCamera.limits applies at the next yaw/pitch/radius write that changes the value, or at any center assignment (cam.center = cam.center works). limits.pitchDisabledRadiusScale = null allows full pitch at any radius.
- now: A change to a field of GeospatialCamera.limits applies at the next yaw/pitch/radius write that changes the value, or any center assignment (cam.center = cam.center works); a new object assigned to camera.limits is not used for clamping. pitchDisabledRadiusScale = null allows pitch up to pitchMax at any radius.
- why: assigning a new object to camera.limits is not used for clamping (the camera keeps the object it was made with); 'full pitch' said as up to pitchMax.

### n36 (merged; u39, u57)
- was u39: Arc-rotate keys: ArrowUp lowers beta, ArrowRight raises alpha; Ctrl+arrows pan (inertialPanningX/Y); with Alt, a held ArrowUp adds 1/zoomingSensitivity (default 25) to inertialRadiusOffset each frame, so radius falls faster each frame.
- was u57: Arc-rotate key speed comes from the keyboard options (angularSensitivity 100, panningSensitivity 50, zoomingSensitivity 25), not the camera's sensibilities; held keys add input every frame, heard on the canvas.
- now: Held arc-rotate keys feed the inertial offsets each frame, divided by the keyboard options' angularSensitivity (100), panningSensitivity (50) or zoomingSensitivity (25), not the camera's: ArrowUp lowers beta, ArrowRight raises alpha, diagonals normalised; Ctrl+arrows pan; Alt+ArrowUp zooms in.
- why: merged 39 and the speed part of 57; dropped 'so radius falls faster each frame', true only until the offset levels off (the test sees it settle at about 10 times the step at inertia 0.9); Alt+ArrowUp said as 'zooms in'.

### n37 (merged; u40, u65, u66)
- was u40: attachFreeControl turns on a drag with button 0, 1 or 2 (right drag turns right, down looks down); a drag adds dx/angularSensitivity to a turn velocity applied each frame, then times inertia, so it coasts. Pitch is clamped to +-(PI/2-0.01).
- was u65: attachFreeControl stops look inertia once the decayed turn (drag px / angularSensitivity, times inertia each frame) falls below speed * 0.001, so at speed 1000 a 200 px drag turns once with no glide while a 3000 px drag still glides.
- was u66: attachFreeControl listens for keys on the canvas, setting tabIndex 0 if it has no tabindex, so keys work only while the canvas has focus. Buttons 0, 1 and 2 all drag to look; there is no pointer lock.
- now: attachFreeControl turns on a drag with button 0, 1 or 2, with no pointer lock (right drag turns right, down looks down): dx/angularSensitivity goes to a turn velocity applied each frame, then times inertia, so it coasts until it falls below speed*0.001. Pitch is clamped to +-(PI/2-0.01).
- why: merged 65 (when the glide stops) and the button/no pointer lock part of 66.

### n40 (narrowed; u43)
- was u43: Assigning camera.ortho by hand is ignored (perspective is used) until enableOrthographicCamera has been called at least once.
- now: Assigning camera.ortho by hand does not invalidate the cached projection. A hand-set bounds object is ignored (perspective is used) until enableOrthographicCamera has run once in the process, on any camera, and after that it is used only once fov, nearPlane, farPlane, the aspect or the view changes.
- why: 'until enableOrthographicCamera has been called' made 'once in the process, on any camera'; even then the hand-set object is used only at the next cache rebuild.

### n41 (merged; u46, u56, u58)
- was u46: interpolateArcRotateCamera clamps alpha/beta/radius goals to the camera's limits and resolves at the clamped value. It moves nothing until a scene frame runs.
- was u56: In interpolateArcRotateCamera both alpha and beta take the shortest arc mod 2*PI, goals are clamped to the camera's limits every frame, a NaN goal field counts as omitted, and the end snaps exactly to the clamped goal.
- was u58: interpolateArcRotateCamera ends with alpha, beta and radius set exactly to the goal clamped to the limit fields, alpha unwrapped: a goal of 2*PI from alpha 0 ends on the first frame at 2*PI; a goal past a limit ends on the limit.
- now: interpolateArcRotateCamera moves nothing until a scene frame runs. Each frame it clamps its alpha/beta/radius goals to the limit fields; a NaN goal field counts as omitted. It ends by setting the clamped goal exactly, alpha unwrapped: a goal of 2*PI from alpha 0 ends on the first frame with alpha 2*PI.
- why: merged 56 and 58, which said the same about clamped goals and the exact end.

### n42 (scoped; u47)
- was u47: Assigning camera.ortho = null by hand keeps the cached orthographic matrix, and the rebuild after a fov write still has the ortho p[12], p[13] and p[15]=1; disableOrthographicCamera clears those and switches at once.
- now: Assigning camera.ortho = null by hand keeps the cached orthographic matrix, and the perspective rebuild after a fov write still has the ortho p[12], p[13] and p[15]=1. disableOrthographicCamera clears those and switches at the next getProjectionMatrix.
- why: 'switches at once' made 'at the next getProjectionMatrix'.

### n43 (merged; u48, u49)
- was u48: attachGeospatialControls zooms by the sign of wheel deltaY only, and the zoom coasts over later frames, while a right-drag rotation stops on the first frame without input.
- was u49: In attachGeospatialControls pan and rotation have zero inertia and stop with the input; only zoom coasts (inertia 0.9, frame-rate normalised). Speeds and inertias are fixed constants, not options.
- now: attachGeospatialControls zooms by the sign of wheel deltaY only (positive zooms out). Zoom from wheel or keys coasts over later frames, its total travel nearly the same at 30 and 60 fps; pan and rotation have no inertia and stop on the first frame without input.
- why: merged 49; 'frame-rate normalised' replaced by what the test shows (total travel nearly the same at 30 and 60 fps); dropped 'speeds and inertias are fixed constants, not options' (GeospatialControlOptions already shows it).

### n44 (scoped; u51)
- was u51: A geospatial center written with spherical latitude asin(z/|center|) beyond +-87.13 degrees (0.05 rad from the +-Z pole) is moved to +-87.13, keeping its distance from the origin and its longitude.
- now: A geospatial center whose latitude asin(z/|center|) is beyond +-87.13 degrees (0.05 rad from the +-Z pole) is moved to +-87.13 when applied (center assignment, setGeospatialOrientation, or the next yaw/pitch/radius write), keeping its distance from the origin and its longitude.
- why: 'written' made 'when applied': an in-place write is moved only at the next apply (11).

### n45 (scoped; u53)
- was u53: In attachControl, shouldHandlePointerDown false ignores that press; isExternalDragActive true mid-drag ends the drag and zeroes rotation and pan offsets; isExternalPickPending true swallows moves.
- now: In attachControl, shouldHandlePointerDown false ignores that press; isExternalDragActive true mid-drag ends the drag and zeroes the rotation and pan offsets (not inertialRadiusOffset); isExternalPickPending true swallows moves, and the drag goes on once it is false.
- why: isExternalDragActive leaves inertialRadiusOffset; the drag goes on after a pending pick.

### n46 (merged; u54, u59)
- was u54: In GeospatialCamera north is +Z: at a centre on +X, yaw 0 looks toward +Z and yaw PI/2 (east) toward -Y. yaw is wrapped to [-PI, PI), so yaw = PI reads back -PI; a centre on a pole is moved off it.
- was u59: A geospatial camera's yaw and pitch read back wrapped to [-PI, PI): yaw = 4 reads 4 - 2*PI, yaw = PI reads -PI.
- now: In GeospatialCamera north is +Z: at a center on +X, yaw 0 heads toward +Z and yaw PI/2 (east) toward -Y; pitch 0 looks straight down. yaw and pitch are wrapped to [-PI, PI) before the limits clamp them, so yaw = 4 reads 4 - 2*PI and yaw = PI reads -PI.
- why: merged 59 (wrap); 'a centre on a pole is moved off it' left to 44; pitch 0 looks straight down; the wrap comes before the limits clamp.

### n48 (merged; u61, u67, u72)
- was u61: attachGeospatialControls picks by a ray against a sphere of limits.planetRadius at the origin, not scene meshes. A button-0 double-click flies center to the picked point over doubleTapAnimationDurationMs (1000).
- was u67: attachGeospatialControls clamps rotated pitch to [0, PI/2-0.001] before the limits, and picks by ray against a sphere of limits.planetRadius at the origin, not against meshes.
- was u72: attachGeospatialControls flies the centre to the clicked globe point over 1000 ms on a dblclick with button 0 and buttons 0; a dblclick with buttons 1 (a button still held) is ignored.
- now: attachGeospatialControls picks by a ray against a sphere of limits.planetRadius at the origin, with no mesh needed. A dblclick with button 0 and buttons 0 that hits it flies center to the hit point over doubleTapAnimationDurationMs (1000); another button, buttons not 0, or a miss does nothing.
- why: merged 72 (dblclick) and the pick part of 67; 'not scene meshes' could not be tested (the null engine builds no mesh) and became 'with no mesh needed'.

### n49 (scoped; u63)
- was u63: When camera._useFloatingOrigin is set, getViewMatrix zeroes its translation, so the matrices are camera-relative; projectWorldToScreen then needs worldOrigin set to the camera's world position.
- now: When camera._useFloatingOrigin is set, getViewMatrix zeroes its translation (from the next view rebuild; a cached matrix is kept), so the matrices are camera-relative; projectWorldToScreen then needs worldOrigin set to the camera's world position.
- why: the flag shows only at the next view rebuild; a cached matrix is kept.

### n50 (narrowed; u64)
- was u64: After a pan or zoom ends, the center moves to where the look vector hits the planet, radius set to that distance. checkCollisions (default false) keeps the eye at least planetRadius+radiusMin from the origin.
- now: In attachGeospatialControls, on the first frame after a pan or zoom stops, center moves to where the look vector from the eye hits the planet sphere, and radius becomes that distance.
- why: dropped the checkCollisions sentence (47 says it); said the frame on which it happens and 'from the eye'.

### n51 (scoped; u68)
- was u68: A FreeCamera whose view direction is parallel to world Y (target straight above or below) gets an identity rotation and looks along +Z.
- now: A camera from createFreeCamera whose view direction is parallel to world Y (target straight above or below) gets an identity rotation and looks along +Z.
- why: limited to createFreeCamera (a banked camera with another upVector is not caught).

### n52 (scoped; u69)
- was u69: A FreeCamera's view is built from position and target alone. Moving position keeps it aimed at the same target point, so it turns; to translate, move target by the same amount.
- now: A createFreeCamera view is built from position and target alone (a banked camera's also from upVector). Moving position keeps it aimed at the same target point, so it turns; to translate, move target by the same amount.
- why: 'position and target alone' is false for a banked camera.

### n53 (scoped; u71)
- was u71: Geospatial keys: arrows pan north/east by radius*0.0015 per frame, Ctrl+arrows rotate, Equal/NumpadAdd and Minus/NumpadSubtract zoom along the look vector.
- now: Geospatial keys: arrows pan the center north/east by up to radius*0.0015 per frame; while ControlLeft or ControlRight is held (the ctrlKey flag alone does not count) arrows rotate instead; Equal/NumpadAdd and Minus/NumpadSubtract zoom in/out, keeping the center.
- why: 'by radius*0.0015' made 'by up to' (a speed factor <= 1 applies); Ctrl means a held ControlLeft/ControlRight key, not the ctrlKey flag; zoom keeps the center.

### n54 (scoped; u74)
- was u74: fov, nearPlane and farPlane are plain fields; a write takes effect at the next getProjectionMatrix/getViewProjectionMatrix call, which compares them by value.
- now: fov, nearPlane and farPlane are plain fields; a write takes effect at the next getProjectionMatrix/getViewProjectionMatrix call, which compares them by value. While ortho is on, fov changes nothing.
- why: while ortho is on, fov changes nothing (12).

### n57 (scoped; u77)
- was u77: In a right-handed build the controls flip the sign of alpha/yaw and horizontal pan, so a drag turns the same way on screen.
- now: In a right-handed build attachControl flips the sign of alpha and of horizontal pan, and attachFreeControl that of _yaw, so a drag moves the view the same way on screen.
- why: 'alpha/yaw' named per control: attachControl alpha and pan, attachFreeControl _yaw; 'turns the same way' tested as the same direction on screen.

### n58 (narrowed; u78)
- was u78: projectPointToViewportToRef does no validation, allocates per call, multiplies transform by a world matrix, accepts zero-size viewports, and writes only x, y, z.
- now: projectPointToViewportToRef does no validation, multiplies transform by the world matrix, accepts zero-size viewports, and writes only x, y, z.
- why: dropped 'allocates per call': no test can show it.

## Merged groups

- n02 <- u2 + u29 + u62
- n05 <- u5 + u52
- n07 <- u7 + u45
- n09 <- u9 + u73 + u57
- n10 <- u10 + u50
- n20 <- u20 + u44
- n21 <- u21 + u38 + u67
- n24 <- u24 + u31
- n25 <- u25 + u55 + u66
- n26 <- u26 + u31
- n27 <- u27 + u55
- n29 <- u30 + u55
- n31 <- u33 + u62
- n32 <- u34 + u70
- n36 <- u39 + u57
- n37 <- u40 + u65 + u66
- n41 <- u46 + u56 + u58
- n43 <- u48 + u49
- n46 <- u54 + u59
- n48 <- u61 + u67 + u72

u67 was split: its pitch clamp went to n21, its pick sphere to n48. u55 was split over n25, n27 and n29. u57 over n09 and n36. u62 over n02 and n31. u66 over n25 and n37. u31 over n24 and n26.

## Unchanged notes

n04 (u4), n08 (u8), n13 (u13), n14 (u14), n16 (u16), n23 (u23), n28 (u28), n33 (u35), n34 (u36), n38 (u41), n39 (u42), n47 (u60), n55 (u75), n56 (u76)

## Dropped parts

- u49: 'Speeds and inertias are fixed constants, not options' (GeospatialControlOptions in names/ already shows there are no such options).
- u78: 'allocates per call' (no test can show an allocation).
- u61: 'not scene meshes' (the null engine cannot build a mesh in node, so no test put a mesh in the way); kept as 'with no mesh needed'.
- u64: its checkCollisions sentence (n47 says it).
- u54: 'a centre on a pole is moved off it' (n44 says it, with the angle).

## Probe run

All 58 probes copied into app/checks/, run with `npx vitest run checks/`, then removed (only helpers.ts left):

```
Test Files  58 passed (58)
Tests  126 passed (126)
Start at  16:52:28
Duration  15.10s (import 85%, transform 13%, tests 2%, worker 1%)
```

## After the check

Each finding was tried by a test (the checker's tests in edited/check/ were run first: all 12 passed; their cases and new ones were added to the probes as "(after check)" tests). All 17 findings held; all mended. Now 58 notes, 14459 bytes of text, longest 320.

- n35: mended. Scoped to the camera's own clamps; says attachGeospatialControls reads camera.limits live for zoom, pick and collision (35d wheel clamp, 35e pick sphere and collision floor with a swapped object).
- n53: mended. The center is kept only while the zoom runs, then the re-centre applies (53c: center 1100 kept for 3 frames, 1000 after the stop).
- n50: mended. Adds the miss case (nothing moves, 50c) and the radiusMin/radiusMax clamp of the new radius, which moves the eye (50d: radius 200 not 300, eye 1300 to 1200; the clamp uses the camera's own limits).
- n37 (pitch clamp): mended. Only turning frames clamp _pitch (37c: PI/2 kept through key moves with identity rotation, a written 3 kept, clamped at the next turn).
- n40: mended. A camera never projected uses the hand-set ortho at its first getProjectionMatrix (40d).
- n27: mended. Adds 'times fastMultiplier while a fastKeys key is held', which agrees with n16's default of 1 (27c: 3x with 3, 1x with default).
- n41: mended. NaN counts as omitted only for alpha, beta, radius; a NaN in goal.target is written and rejects (41c). The '2*PI' example cut for length; 'alpha is not wrapped' kept.
- n07: mended. 'starts at 4*planetRadius (or 10 if larger)' (07c).
- n44: mended. 'the next yaw/pitch/radius write that changes the value' (44c).
- n01: mended. The offsets are camera fields applied by any scene._beforeRender hook that an attachControl given a scene pushes for that camera (01c).
- n20: mended. Restored pitchMax PI/2-0.01 (20c; pitchMin 0.001 is in n07).
- n48: mended. 'picks only by a ray against the sphere: scene meshes never block it' (48d: a mesh-like object in scene.meshes changes nothing; the null engine cannot build a real mesh, and the controls touch the scene only through _beforeRender and the fly).
- n36: mended. 'arrows with event.ctrlKey true pan' (36c: the flag pans; a held ControlLeft key with the flag false does not).
- n26: mended. 'z as reverse-Z depth, 1 at nearPlane to 0 at farPlane' (26c).
- n43 (lost u49): mended. 'a fixed inertia of 0.9 per 1/60 s' (43c: step ratio 0.9*r(n+1)/r(n) at 60 fps, the zoom speed scaling with distance).
- n58 (lost u78): mended. 'into a new matrix on every call (it allocates)' (58b: multiplyMat4 mocked, called once per call, distinct results).
- n37 (lost u65): mended. 'until below camera.speed*0.001 (speed 1000: a 200 px drag turns once)' (37d: no glide at speed 1000, glide at speed 2).

Probe run (all 58 copied into app/checks, run with `npx vitest run checks/`, then removed; only helpers.ts left):

```
Test Files  58 passed (58)
Tests  145 passed (145)
```

## After check round 2

The 42 findings are saved in CHECK2.json. The ten breaker tests in check2/ were run first (all 11 tests passed, so each shows its case); every reader finding was checked against the source and by a new test. All 42 were right; all were mended. Thirteen notes could not hold their exception in 320 bytes and were split, so the list is now 71 notes and the probes were renumbered to match (old -> new: 1->1+2, 2->3+4, 3->5, 4..6->6..8, 7->9, 8->10, 9->11+12, 10->13+14, 11->15, 12->16+17, 13..18->18..23, 19->24+25, 20->26+27, 21..34->28..41, 35->42+43, 36->44+45, 37->46+47, 38..40->48..50, 41->51+52, 42..49->53..60, 50->61+62, 51..56->63..68, 57->69+70, 58->71). New tests are named "NN (after check 2)"; 35's two after-check tests on the controls moved with that half to probe 43. Below, "n" is the old number, the new one follows the arrow.

- 1 (n1 breaker, keys): mended. n1 -> n01 no longer says keys; new n02: keys feed the offsets only in the frame step of the attachControl they were given to (probe 02: no offset with a scene-less keyboard attachment even while another one ticks).
- 2 (n20 breaker, alternation): mended. Split n20 -> n26 (defaults) + n27: with 4*planetRadius < 10 every re-orbit turns a radius >= 10 into 4*planetRadius and a smaller one into 10 (probe 27).
- 3 (n7 breaker, requested radius): mended. n09: the pitch cap uses the radius asked for, before radiusMin/radiusMax clamp it (probe 09: planetRadius 1, and a radiusMax 2500 camera asked for 5000).
- 4 (n50 breaker, pitch cap): mended. Split n50 -> n61 + n62: the re-centre re-measures yaw/pitch and caps pitch for the new radius, so the eye moves when the pitch is too steep (probe 62).
- 5 (n3 breaker, lazy build): mended. n05: missed only once the view has been built after the last change (probe 05: fresh camera, pending alpha write).
- 6 (n2 breaker, crossed limits): mended. Split n2 -> n03 + n04; n04 says to keep each lower limit at or below its upper one, crossed limits recurse into a RangeError (probe 04).
- 7 (n24 breaker, ortho NaN): mended. n31: NaN only under perspective; under ortho clipW is 1 and x/y finite (probe 31).
- 8 (n36 breaker, Alt diagonals): mended. Split n36 -> n44 + n45; n45: Alt adds unscaled steps on diagonals, Ctrl pan diagonals are scaled (probe 45).
- 9 (n28 breaker, upVector parallel): mended. n35: unless parallel to the view, when the camera turns to look along +Z (probe 35).
- 10 (n47 breaker, collision lift): mended. n58: lifts by the shortfall along the eye's direction; a tilted eye ends short, exact only looking straight down (probe 58).
- 11 (n40/n54 pair, fov while ortho): mended n66: fov's value is unused, but a fov write rebuilds, so a hand-set ortho then takes effect (probe 66).
- 12 (n12/n40 pair, field writes): mended. Split n12 -> n16 + n17: writes to a hand-made bounds object wait for a fov/near/far/aspect/view change; only bounds returned for that camera invalidate it (probe 17).
- 13 (n5/n52 pair, hand aim): mended n64: hand writes leave _yaw/_pitch alone, so attached free controls re-aim at the next key move or drag (probe 64).
- 14 (n5/n37/n25 pair, configurable): mended n32 and n46 to name attachConfigurableFreeControl (probes 32 and 46: same key map by default, same drag turn for buttons 0/1/2).
- 15 (n36/n57 pair, RH keys): mended n44 (ArrowRight lowers alpha in a right-handed build) and n69 (keys flip like drags) (probe 69).
- 16 (n5/n57 pair, RH _yaw): mended n69: _yaw is still atan2(dx, dz); only the drag's _yaw step flips (probe 69: start yaw PI/4 and a +Z forward move in both builds).
- 17 (n30/n41 pair, 2*PI): mended. Split n41 -> n51 + n52; n52 restores u58: from alpha 0 a goal of 2*PI is a zero arc and ends on the first frame with alpha 2*PI (probe 52).
- 18 (n35 pair, setGeospatialOrientation): mended. Split n35 -> n42 + n43; n42 lists setGeospatialOrientation (probe 42).
- 19 (n35/n50 pair, which limits): mended n62 (the camera's own limits object, not one assigned later) and n43 (the re-centre included) (probes 62, 43).
- 20 (n2/n31 pair, stop function): mended n03: re-clamps only until the function its latest call returned runs (probe 03).
- 21 (n23/n42 pair, hand null): mended n30: disable clears the cached ortho terms, a hand-written null keeps them (probe 30).
- 22 (n14/n22 pair, two fingers): mended n19: while two touches are down pointer moves do nothing and the pinch only zooms (probe 19).
- 23 (n10 word, other writes): mended. Split n10 -> n13 + n14; n14: yaw/pitch/radius/center writes and setGeospatialOrientation do not stop a flight, its next frame overwrites them (probe 14).
- 24 (n20 word, scope): mended with finding 2: the alternation now stands in its own note n27, scoped to 4*planetRadius < 10 (probe 27 also shows a normal planet keeping radius 50).
- 25 (n54 word, "ortho is on"): mended with finding 11: "camera.ortho is set and enableOrthographicCamera has run once" (probe 66).
- 26 (n36 word, diagonals): mended with finding 8: n44 says a held arrow adds 1/angularSensitivity per frame and a plain diagonal 1/sqrt(2) of it to each (probe 44).
- 27 (n3 word, in-place writes): mended n05: writes to the original target's x/y/z show at once (old 03b shows it).
- 28 (n2 word, which offset): mended n04: only the hit channel's offset, setCameraLimits' own clamp included, never the pan offsets (probe 04).
- 29 (n57 word, "right-handed build"): mended n69: a build that resolves the babylon-lite-rh import condition, and both free controls flip; new n70: attachGeospatialControls flips nothing, but east points the other way (probe 70).
- 30 (n21 word, miss): mended n28: a left drag whose press misses does nothing (probe 28: no rotate either; a hit drag pans).
- 31 (n19 word, beta range and Y pan): mended. Split n19 -> n24 + n25; n25 gives the inertialPanningY move along the up vector and the cases sin(beta) < 0, beta 0 and beta PI (probe 25).
- 32 (n50 word, "stops"): mended n61: the first frame with no pan or zoom step after one; a zoom's steps end when its coasting does (probe 61: wheel zoom re-centres only after the coast).
- 33 (n15 word, other controls): mended n20: disposeScene removes none of the four controls' listeners; their functions, or onSceneDispose, do (probe 20).
- 34 (n26 word, ToRef): mended n31 and n33 to name its ToRef form (probes 31, 33).
- 35 (n37 word, speed 1000): mended. Split n37 -> n46 + n47; n47: speed defaults to 2, the glide depends on speed and drag size (probe 47).
- 36 (n9 word, custom keys): mended. Split n9 -> n11 + n12; n12: other directions keep their arrows, Ctrl and Alt act on listed keys (probe 12).
- 37 (n49 word, view rebuild): mended n60: a cached view is kept until the camera's pose changes; a camera never viewed uses the flag at once (probe 60).
- 38 (n41 lost u58): mended with finding 17 (n52).
- 39 (n36 lost u9/u39): mended with finding 26 (n44 per-frame 1/angularSensitivity, n45 1/panningSensitivity and 1/zoomingSensitivity).
- 40 (n37 lost u65): mended with finding 35 (n47: a 3000 px drag still glides).
- 41 (n2 lost u62): mended with finding 28 (n04).
- 42 (n53 lost u71): mended n65: Equal/Minus zoom along the look vector (probe 65: the eye moves along _lookAt, center kept).

Old test names that the mends made too wide were renamed: 58 ("looking straight down"), 31 ("under perspective"), 66 ("with ortho from enableOrthographicCamera").

Probe run (all 71 copied into app/checks, run with `npx vitest run checks/`, then removed; only helpers.ts left):

```
Test Files  71 passed (71)
Tests  182 passed (182)
```

## After check round 3

The 35 findings are saved in CHECK3.json. The three breaker files in check3/ were run first (all 12 tests passed, so each case holds); each reader finding was checked against the source and by a new test. All 35 were right; all were mended. Five notes could not hold their exception in 320 bytes and were split (old 3 -> 3+4+5, 4 -> 6+7, 5 -> 8+9, 9 -> 13+14, 65 -> 70+71), so the list is now 77 notes and the probes were renumbered to match (old 1..2 -> 1..2, 6..64 -> +5, 66..71 -> +6). New tests are named "NN (after check 3)". Below, "n" is the old number, the new one follows the arrow.

- 1 (n54 breaker, held zoom key): mended -> n59: one wheel step travels about as far at 30 fps as at 60; a held zoom key adds a step per frame, so it zooms faster at higher frame rates (probe 59).
- 2 (n5 breaker, worldMatrix read): mended -> n08: "once worldMatrix was read after the last change (getViewMatrix, getCameraPosition)" (probe 08: getCameraPosition alone freezes the target).
- 3 (n17 breaker, earlier bounds): mended -> n22: or a write to a field of any bounds it returned for that camera (probe 22).
- 4 (n50 breaker, earlier bounds): mended -> n55: same case added (probe 55).
- 5 (n25 breaker, beta 2*PI): mended -> n30: where |sin(beta)| < 1e-10 (PI, -PI, 2*PI) both go along world +X/+Y; beta exactly 0 counts sin as 0.0001 (probe 30: 2*PI and -PI, and beta 0 not that case).
- 6 (n13 breaker, disposed scene): mended -> n18: it resolves at a newer flight, or only while the scene runs frames; disposed mid-flight it stays pending (probe 18, a newer flight then resolves it).
- 7 (n8 breaker, undone change): mended -> n12: compared at its later frames; a change undone before that frame does not count (probe 12).
- 8 (n61 breaker, eye inside): mended -> n66: the look vector must enter the sphere; a miss or an eye inside moves nothing (probe 66).
- 9 (n35 breaker, zero up): mended -> n40: "unless it is zero or parallel" (probe 40).
- 10 (n23 breaker, upper limit < 0.01): mended -> n28: a smaller upperRadiusLimit wins over the floor (probe 28).
- 11 (n29 breaker, pinch): mended -> n34: an upperRadiusLimit below 0.01 still wins (probe 34: radius 0.005).
- 12 (n3 breaker, NaN): mended -> new n04: NaN is never clamped (probe 04).
- 13 (n7/n36 pair, scene-less): mended -> n11: target is set on "each frame of their scene", so none without one (probe 11: a scene-less drag and key leave _yaw and target alone).
- 14 (n4 word, which clamps): mended -> n06: only setCameraLimits' clamps zero an offset; attachControl's beta clamp and 0.01 floor zero none (probe 06).
- 15 (n3/n10 pair, which bound): mended -> new n04: the re-clamp runs after the frame-step clamps, so the narrower range holds and an upper beta or radius limit below 0.01 wins (probe 04).
- 16 (n19 word, button roles): mended -> n24: buttons 0 and 2 rotate and pan by default, as pointerMappings set them (probe 24: primaryButton 'pan', secondaryButton 'rotate').
- 17 (n24 word, right-drag): mended -> n29: "A pan drag (button 2 by default)" (probe 29: a remapped right drag does not pan, a left drag mapped to pan does).
- 18 (n24/n39 pair, RH sign): mended n29 (the X move is negated in a right-handed build) and n44 (alpha's step negated) (probes 29, 44 load both builds).
- 19 (n57/n70 pair, RH east): mended -> n62: "(+Y in a right-handed build)" (probe 62).
- 20 (n5 word, original target): mended -> new n09: writes to the object createArcRotateCamera made mark the camera dirty even after another object was assigned, and the current camera.target is used; writes to the new object are missed (probe 09).
- 21 (n5 pair, pan and interpolation): mended -> n08: attachControl pans and interpolateArcRotateCamera write camera.target in place, so on an assigned object they wait like any write (probe 08: both unseen).
- 22 (n23 word, which frames): mended -> n28: only frames with inertialRadiusOffset != 0 (and the pinch) floor radius; a direct write below 0.01 stays until then (probe 28).
- 23 (n40 word, when overwritten): mended -> n45: a camera write leaves the object alone; the next call of that getter (getViewProjectionMatrix calls both others) after a change overwrites it (probe 45).
- 24 (n43/n61 pair, which sphere): mended -> n66: the sphere of the current camera.limits.planetRadius (probe 66: an assigned limits object with planetRadius 9e5 sets |center| to 9e5).
- 25 (n3/n37/n51/n8 pair, arc past limits): mended -> new n05: the re-clamp clamps the interpolation's writes without rejecting; alpha 0.1 to 6 within [0, 6.2] stalls at 0 and never settles (probe 05).
- 26 (n55 word, which applies): mended -> n60: at every re-orbit, each control and flight step included; camera.center reads the moved value (probe 60: a held key pan stops at 87.13 degrees).
- 27 (n26/n27 pair, start radius): mended -> n31: "radius 4*planetRadius (10 if that is smaller)" (probe 31).
- 28 (n65 word, step size): mended -> n70: the step is radius*0.0015*min(1, sqrt(cos(latitude))*max(1, |center|/h)), h = |eye| - |center|; the zoom keys moved to new n71 (probe 70: 1 at the equator, sqrt(0.5) at 60 degrees far up, 1 near the ground).
- 29 (n11 word, "first"): mended -> n16: enable must run before that attachControl call; keyboard omitted or false means no keys (probe 16, on a fresh module).
- 30 (n9 word, radius asked for): mended -> new n14: every re-orbit clamps the asked-for or current pitch against the radius of that call; a radius raised after pitch lowers it for good (probe 14).
- 31 (n33 word, no css size): mended -> n38: cssX, cssY are x, y when no css size is given (probe 38).
- 32 (n17/n50 pair, enable never ran): mended -> n22: "Once enableOrthographicCamera has run on some camera" (probe 22: on a fresh module a hand-made object stays unused after a fov change).
- 33 (n16 word, "fov is ignored"): mended -> n21: fov's value is unused, a fov write still rebuilds (probe 21).
- 34 (n4 word, when it throws): mended -> new n07: thrown by the setCameraLimits call that crosses them, or for fields crossed by hand by the next changing alpha/beta/radius write, wherever it runs (probe 07).
- 35 (n7 word, glide frames): mended -> n11: every frame with move or turn velocity, glides too (probe 11).

To fit 320 bytes some mended notes lost words another note already holds: n39 -> n44 no longer says pans decay by panningInertia (n29 says it); n40 -> n45 dropped "copy it to keep a value"; n13 -> n18 "it does not jump to the goal" became "it moves no further".

Of the 35, 30 change what a reader would do (a value, a case, a sign or a moment they would get wrong); 5 change wording only, since another note already gave the answer: 13 (n36 said scene-less free controls move nothing), 16 and 17 (n19 and n39 already named pointerMappings and a rotate drag), 32 (n50 said enable must have run) and 33 (n66 said a fov write rebuilds).

Probe run (all 77 copied into app/checks, run with `npx vitest run checks/`, then removed; only helpers.ts left):

```
Test Files  77 passed (77)
Tests  218 passed (218)
```

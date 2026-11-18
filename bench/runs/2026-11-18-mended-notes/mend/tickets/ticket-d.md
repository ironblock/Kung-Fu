# Ticket d

## The note at fault
Note 37: "A change to GeospatialCamera.limits applies at the next yaw/pitch/radius write that changes the value, or at any center assignment (cam.center = cam.center works). limits.pitchDisabledRadiusScale = null allows full pitch at any radius."
The note says "a change to limits" and does not say which kind of change. The declaration's comment on limits ("Mutable; clamping applies on the next orientation change") says the same.

## What the library does
File: camera/geospatial-camera.ts, function createGeospatialCamera.
- Line 209: const limits = createGeospatialLimits(planetRadius), a local constant held in the closure.
- Lines 243-245, in applyOrientation (lines 234-279): yaw, pitch and radius are clamped against the closure's limits (yawMin/yawMax; pitchMin and getEffectivePitchMax(limits, radius); radiusMin/radiusMax). The same closure constant is read each time, so changing its fields takes effect at the next apply.
- Line 286: the camera object is created with a plain data property limits, set to that same object. It has no getter or setter. Writing camera.limits = anotherObject only replaces the property. applyOrientation never reads the property, so clamping goes on with the original object. Writing any field of camera.limits changes the object the closure holds, so it does take effect. The property camera.limits and the closure's constant are the same object only until the property is reassigned.
- Nested field: pitchDisabledRadiusScale is read fresh from the object at each apply (geospatial-limits.ts getEffectivePitchMax), so setting it to null or to a new {x,y} on the held object works.
- Other readers: the attached geospatial controls (geospatial-camera-controls.ts) read camera.limits through the property each time: planetRadius for the picking sphere (line 140) and for a minimum distance (line 393), and radiusMin/radiusMax when they work out a zoom (lines 322-338, 348-358). They then write radius through the camera, whose clamp still uses the closure object. After a reassignment the controls and the camera's own clamp read different objects.

## What a reader is left to guess
Whether replacing camera.limits with a new object changes clamping (it does not, for the camera's own clamping), and whether editing fields of the existing object does (it does). The note's "A change to ... limits" does not separate the two.

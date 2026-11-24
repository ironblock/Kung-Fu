# Ticket f

## The note at fault
No note covers this. Note 37 says a limits change applies at a write "that changes the value" or at a center assignment, and notes 7 and 11 mention setGeospatialOrientation only in passing. None says when setGeospatialOrientation itself applies the limits.

## What the library does
File: camera/geospatial-camera.ts.
- setGeospatialOrientation, lines 202-205: calls camera._setOrientation(orientation.yaw ?? camera.yaw, orientation.pitch ?? camera.pitch, orientation.radius ?? camera.radius, orientation.center ?? camera.center). Each omitted (undefined or null) field takes the current value. It always calls it, with no check that any value differs, also when every field is omitted.
- _setOrientation is applyOrientation (defined at line 234, put on the camera at line 291). Every run: wraps yaw and pitch into [-PI, PI) (normalizeRadians, line 82); stores the values; copies the center; clamps yaw to yawMin/yawMax; clamps pitch to pitchMin and getEffectivePitchMax(limits, radius) using the radius value as passed in, before the radius clamp (line 244 comes before 245); clamps radius to radiusMin/radiusMax; moves the center off the poles; recomputes position, look direction and up vector. So the limits, as held by the camera, are applied on every run.
- Setters, lines 313-339 (center 313-315): yaw, pitch and radius setters call applyOrientation only if the new value is not strictly equal to the stored value (the already wrapped and clamped one, not the last value written). If it is equal they do nothing, so limits are not applied. The center setter (lines 313-315) has no check and always calls applyOrientation with the stored yaw, pitch and radius.
- The stored value is after clamping. So writing a value that differs from the stored one applies everything, even if the write is clamped back to the stored value.

## What a reader is left to guess
When setGeospatialOrientation applies the limits the camera holds, with any mix of fields given or omitted; that the yaw, pitch and radius setters skip a write equal to the stored value and the center setter has no such check; and that the comparison is against the stored, wrapped and clamped value.

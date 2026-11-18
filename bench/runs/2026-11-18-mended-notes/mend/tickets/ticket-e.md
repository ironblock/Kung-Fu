# Ticket e

## The note at fault
No note covers this. Note 8 only speaks of beta limits and clamping.

## What the library does
File: camera/arc-rotate.ts, function createArcRotateCamera. localEyePosition at lines 83-96; the look-at at line 102 in cameraLocalWorldMatrix.
localEyePosition, with cam.target, cam.alpha, cam.beta, cam.radius:
- cosA = cos(alpha), sinA = sin(alpha), cosB = cos(beta), sinB = sin(beta).
- If sinB is exactly 0, sinB is set to 0.0001 (lines 87-90).
- eye.x = target.x + radius * cosA * sinB
- eye.y = target.y + radius * cosB
- eye.z = target.z + radius * sinA * sinB
So beta is the angle from the +Y axis (not from the horizontal plane), alpha turns in the X-Z plane from +X toward +Z, and Y is the height. The eye is a function of the four values only; localEyePosition clamps nothing.
Setters, lines 160-178: alpha, beta and radius are accessor properties. A write that differs from the stored value stores it as given, marks the world matrix dirty, and calls cam._clampToLimits if one is installed (only setCameraLimits installs one). A write equal to the stored value does nothing. Without setCameraLimits no angle is clamped or wrapped.
Line 102: writeLookAtWorldMat4LHIntoBuffer(_localMat, localEyePosition(), cam.target, Vec3Up). The up vector is always the fixed world up (0,1,0) (math/vec3-up.ts), whatever alpha and beta are. The camera is not given an up that follows beta.
Lines 103-109: for a right-handed setup the local matrix has the axes 0, 1, 2, 8, 9, 10 negated. This does not change the eye position.
The sign of sin(beta), not whether beta lies in 0 to PI, decides which side of the Y axis the eye is on in X and Z: sin(beta) is negative for beta between -PI and 0 or between PI and 2PI, and the pattern repeats every 2PI. The up vector is (0,1,0) whatever the sign.

## What a reader is left to guess
Which axis beta and alpha belong to (the usual guesses mix up sin and cos, or put height on sin(beta)), where alpha is zero, which way the up vector points, and how the eye and the up vector follow the sign of sin(beta) for any beta.

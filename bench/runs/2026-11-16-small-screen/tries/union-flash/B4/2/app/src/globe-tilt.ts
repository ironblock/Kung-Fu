import type { GeospatialCamera } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  const limits = camera.limits;

  // The default radius-dependent pitch clamp forces the camera toward a
  // near-zero pitch when fully zoomed out. Disable it so this tilt survives
  // later radius changes.
  limits.pitchDisabledRadiusScale = null;

  // Make sure the requested pitch is allowed by the limits.
  if (pitch < limits.pitchMin) limits.pitchMin = pitch;
  if (pitch > limits.pitchMax) limits.pitchMax = pitch;

  // Preserve the current zoom and heading by ensuring they are within limits.
  const radius = camera.radius;
  if (radius < limits.radiusMin) limits.radiusMin = radius;
  if (radius > limits.radiusMax) limits.radiusMax = radius;

  const yaw = camera.yaw;
  if (yaw < limits.yawMin) limits.yawMin = yaw;
  if (yaw > limits.yawMax) limits.yawMax = yaw;

  const center = camera.center;

  // Apply yaw/pitch/radius/center together so the camera recomputes its
  // look-at target immediately while preserving zoom, heading, and center.
  camera._setOrientation(yaw, pitch, radius, center);
}

import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Switch the camera to a map mode's limits.
 *
 * A new `limits` object is only picked up by the camera at the next
 * yaw/pitch/radius write that changes a value, or at a center assignment,
 * so in addition to assigning it we write the current radius and yaw back
 * clamped to the mode's ranges (a value-changing write both clamps and
 * adopts the new limits) and re-assign the center to force adoption even
 * when the pose is already inside the new ranges.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
  camera.limits = limits;

  camera.radius = clamp(camera.radius, limits.radiusMin, limits.radiusMax);
  camera.yaw = clamp(camera.yaw, limits.yawMin, limits.yawMax);

  // If the pose was already in range the two writes above changed no value,
  // so the new limits would not have been adopted yet; re-assigning the
  // center (the same object, so the eye does not move) applies them at once.
  camera.center = camera.center;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

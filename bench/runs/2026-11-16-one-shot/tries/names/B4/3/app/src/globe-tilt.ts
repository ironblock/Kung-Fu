import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial camera to `pitch` radians, where 0 is straight down and larger
 * values move toward the horizon. Yaw (heading), radius (zoom) and center are kept.
 * The pitch limits are widened so the tilt is not clamped at the current zoom or
 * after the camera later moves nearer or farther.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  if (!Number.isFinite(pitch)) {
    throw new RangeError(`pitch must be a finite number, got ${pitch}`);
  }

  const limits = camera.limits;
  limits.pitchMin = Math.min(limits.pitchMin, pitch);
  limits.pitchMax = Math.max(limits.pitchMax, pitch);
  // A radius-dependent pitch restriction would cap the tilt at some zoom levels.
  limits.pitchDisabledRadiusScale = null;

  camera._setOrientation(camera.yaw, pitch, camera.radius, camera.center);
}

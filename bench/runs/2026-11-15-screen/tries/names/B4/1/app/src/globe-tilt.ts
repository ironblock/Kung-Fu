import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians, where 0 is looking
 * straight down at the ground and larger values move toward the horizon.
 *
 * Yaw (heading), radius (zoom) and center are kept as they are. The pitch
 * limits are widened to include `pitch`, and the zoom-dependent pitch lock
 * (`pitchDisabledRadiusScale`) is cleared, so the tilt is not clamped at the
 * current zoom and stays in place when the camera is later zoomed in or out.
 *
 * Throws if the library does not end up at the requested pitch.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  if (!Number.isFinite(pitch)) {
    throw new RangeError(`pitch must be a finite number, got ${pitch}`);
  }

  const limits = camera.limits;
  limits.pitchDisabledRadiusScale = null;
  limits.pitchMin = Math.min(limits.pitchMin, pitch);
  limits.pitchMax = Math.max(limits.pitchMax, pitch);

  // Pass copies so the library cannot alias or mutate the camera's own values.
  const yaw = camera.yaw;
  const radius = camera.radius;
  const center = { x: camera.center.x, y: camera.center.y, z: camera.center.z };

  camera._setOrientation(yaw, pitch, radius, center);

  if (Math.abs(camera.pitch - pitch) > 1e-9) {
    throw new Error(
      `tiltGlobeCamera: camera pitch is ${camera.pitch}, expected ${pitch}; ` +
        "the library clamped the value or uses a different pitch convention",
    );
  }
}

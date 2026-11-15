import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial camera to `pitch` radians, measured from looking straight
 * down at the ground (0) toward the horizon.
 *
 * Only the pitch is changed. Zoom (radius), heading (yaw) and centre are left as they are.
 * Throws if the camera does not hold the requested pitch after the assignment.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  if (!Number.isFinite(pitch)) {
    throw new RangeError(`pitch must be a finite number, got ${pitch}`);
  }

  camera.pitch = pitch;

  if (Math.abs(camera.pitch - pitch) > 1e-9) {
    throw new Error(`camera pitch is ${camera.pitch}, expected ${pitch}`);
  }
}

import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera so it looks at its centre point at `pitch`.
 *
 * `pitch` is in radians: 0 looks straight down at the ground, and increasing
 * values move toward the horizon. Only the pitch is changed; zoom (radius),
 * heading (yaw) and centre point are left as they are.
 *
 * NOTE: written without access to the @babylonjs/lite 1.39.0 sources. The
 * property names used here (`pitch`) are assumed, not verified. Check them
 * against the library's GeospatialCamera declaration before relying on this.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  if (!Number.isFinite(pitch)) {
    throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
  }
  camera.pitch = pitch;
}

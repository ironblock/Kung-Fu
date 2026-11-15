import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Sets the geospatial camera's tilt to `pitch` radians, measured from looking
 * straight down at the ground (0) toward the horizon.
 *
 * Heading, zoom (radius) and centre point are left untouched.
 *
 * NOTE: written without access to the Babylon Lite 1.39.0 sources. The member
 * names used below (`pitch`, and the read-back check) are assumptions and must
 * be confirmed against the library's GeospatialCamera declaration.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  if (!Number.isFinite(pitch)) {
    throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
  }

  camera.pitch = pitch;

  // Read back so a silent clamp or rejection by the camera is reported
  // instead of leaving the view at a different tilt than requested.
  const applied = camera.pitch;
  if (Math.abs(applied - pitch) > 1e-6) {
    throw new Error(
      `tiltGlobeCamera: requested pitch ${pitch} but camera reports ${applied}`,
    );
  }
}

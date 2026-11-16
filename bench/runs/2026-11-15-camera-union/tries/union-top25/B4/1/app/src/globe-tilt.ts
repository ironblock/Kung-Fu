import type { GeospatialCamera } from "@babylonjs/lite";

const PITCH_TOLERANCE = 1e-6;

/**
 * Tilts a geospatial globe camera so it looks at its centre point at `pitch`
 * radians, where 0 is straight down at the ground and larger values move toward
 * the horizon.
 *
 * Zoom (radius), heading (yaw) and centre are not changed.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  // The library clamps pitch against the current radius: at the zoomed-out
  // start radius the effective pitch maximum is about 0.001. Dropping that
  // radius-dependent falloff lets the tilt hold at any zoom, including when the
  // app later moves the camera nearer to or farther from the globe.
  camera.limits.pitchDisabledRadiusScale = null;

  camera.pitch = pitch;

  // Read back so a silent clamp (e.g. pitchMin/pitchMax) is reported, not hidden.
  if (Math.abs(camera.pitch - pitch) > PITCH_TOLERANCE) {
    throw new Error(
      `tiltGlobeCamera: requested pitch ${pitch} was clamped to ${camera.pitch} ` +
        `(limits: pitchMin ${camera.limits.pitchMin}, pitchMax ${camera.limits.pitchMax})`,
    );
  }
}

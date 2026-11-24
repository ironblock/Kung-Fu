import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a GeospatialCamera so it looks at its centre at `pitch` radians,
 * measured from straight down (0) toward the horizon.
 *
 * The library clamps yaw, pitch and radius to camera.limits inside its single
 * orientation recompute, and a change to camera.limits only takes effect at the
 * next such change. A newly created camera starts fully zoomed out, which can sit
 * outside the default radius limits, so writing pitch directly could silently move
 * the zoom. The limits are widened to include the current radius and the requested
 * pitch for the one change, then the caller's limits are restored. The restored
 * limits apply from the next change onward, so later zoom moves still clamp normally.
 *
 * UNVERIFIED ASSUMPTIONS (library not available when this was written):
 *  - camera.limits is a plain object with minRadius, maxRadius, minPitch, maxPitch.
 *  - camera.pitch is the tilt measured from straight down, as the caller expects.
 *  - Writing camera.pitch goes through the library's orientation recompute.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  if (!Number.isFinite(pitch)) {
    throw new RangeError("tiltGlobeCamera: pitch must be a finite number");
  }

  const saved = camera.limits;
  const radius = camera.radius;

  camera.limits = {
    ...saved,
    minRadius: Math.min(saved.minRadius, radius),
    maxRadius: Math.max(saved.maxRadius, radius),
    minPitch: Math.min(saved.minPitch, pitch),
    maxPitch: Math.max(saved.maxPitch, pitch),
  };
  try {
    camera.pitch = pitch;
  } finally {
    camera.limits = saved;
  }
}

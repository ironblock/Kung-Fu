import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians (0 = straight down,
 * PI/2 = horizon) without changing its zoom (radius), heading (yaw) or
 * centre point.
 *
 * Why the limits are changed: by default `pitchDisabledRadiusScale` {x:2, y:4}
 * shrinks the maximum pitch linearly from pitchMax (at 2R) down to pitchMin
 * (0.001) at 4R. A new camera starts at radiusMax = 4R, where the allowed pitch
 * is effectively 0, so any tilt would be clamped away. Setting it to null gives
 * the full pitch range at every radius, so the tilt also holds when the camera
 * is later moved nearer to or farther from the globe.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  // Stop a running fly-to from overwriting the new pitch.
  camera._cancelFly?.();

  // Limit changes apply at the next orientation change (they do not re-clamp
  // the current pose), so set them before setGeospatialOrientation.
  camera.limits.pitchDisabledRadiusScale = null;

  // setGeospatialOrientation sets all four values at once, so the pitch is
  // clamped against the unchanged radius rather than a stale one. `center` is a
  // live vector on the camera, so pass a copy.
  const c = camera.center;
  setGeospatialOrientation(camera, {
    yaw: camera.yaw,
    pitch,
    radius: camera.radius,
    center: { x: c.x, y: c.y, z: c.z },
  });
}

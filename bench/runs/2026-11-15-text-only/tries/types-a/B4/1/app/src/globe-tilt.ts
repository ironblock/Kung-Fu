import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

const EPSILON = 1e-9;

/**
 * Tilts a GeospatialCamera to `pitch` radians (0 = looking straight down at the
 * globe, π/2 = the horizon) while keeping its centre, yaw (heading) and radius (zoom).
 *
 * Pitch can be reduced by two library limits:
 *  - `limits.pitchMax`, which caps the requested pitch.
 *  - `limits.pitchDisabledRadiusScale`, which pulls the effective max pitch down
 *    to `pitchMin` as the camera zooms out. A new camera starts fully zoomed out,
 *    so with this feature on, the requested tilt would be flattened.
 *
 * This function sets `pitchDisabledRadiusScale` to `null` (full pitch at every
 * radius) so the tilt holds at any zoom, including after the app zooms the camera
 * in or out later. It widens `pitchMin` / `pitchMax` only if needed to admit `pitch`.
 * It throws if the camera does not end up at the requested pitch with its centre,
 * yaw and radius unchanged.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  if (!Number.isFinite(pitch)) {
    throw new RangeError(`pitch must be a finite number, got ${pitch}`);
  }

  // Snapshot the pose that must not change.
  const yaw = camera.yaw;
  const radius = camera.radius;
  const cx = camera.center.x;
  const cy = camera.center.y;
  const cz = camera.center.z;

  // Remove the zoom-dependent pitch limit and admit the requested pitch.
  const limits = camera.limits;
  limits.pitchDisabledRadiusScale = null;
  limits.pitchMin = Math.min(limits.pitchMin, pitch);
  limits.pitchMax = Math.max(limits.pitchMax, pitch);

  // Only pitch is passed, so yaw, radius and center keep their current values.
  setGeospatialOrientation(camera, { pitch });

  if (Math.abs(camera.pitch - pitch) > EPSILON) {
    throw new Error(
      `tiltGlobeCamera: pitch is ${camera.pitch}, expected ${pitch}`,
    );
  }
  if (Math.abs(camera.radius - radius) > EPSILON * Math.max(1, radius)) {
    throw new Error("tiltGlobeCamera: zoom (radius) changed");
  }
  // Compare headings on the circle, since yaw may be re-wrapped to [-π, π).
  const yawDelta = Math.atan2(
    Math.sin(camera.yaw - yaw),
    Math.cos(camera.yaw - yaw),
  );
  if (Math.abs(yawDelta) > EPSILON) {
    throw new Error("tiltGlobeCamera: heading (yaw) changed");
  }
  const scale = Math.max(1, Math.abs(cx), Math.abs(cy), Math.abs(cz));
  if (
    Math.abs(camera.center.x - cx) > EPSILON * scale ||
    Math.abs(camera.center.y - cy) > EPSILON * scale ||
    Math.abs(camera.center.z - cz) > EPSILON * scale
  ) {
    throw new Error("tiltGlobeCamera: centre point changed");
  }
}

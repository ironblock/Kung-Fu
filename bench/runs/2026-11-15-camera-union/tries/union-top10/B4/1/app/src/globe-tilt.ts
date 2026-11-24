import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

const EPSILON = 1e-9;

/**
 * Tilts a geospatial camera to `pitch` radians, measured from looking straight
 * down at the ground (0) toward the horizon. Yaw, radius (zoom) and centre are
 * left unchanged.
 *
 * The library clamps pitch against the current radius (from about 4R out, pitch
 * is forced to ~0.001). To make the requested tilt stick at any zoom, the
 * radius-dependent clamp is switched off on this camera's limits. Because that
 * is a persistent change, later zoom moves keep the tilt.
 *
 * Throws if the camera does not end up at the requested pitch (for example
 * because the pitch is outside the camera's pitchMin/pitchMax limits).
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  if (!Number.isFinite(pitch)) {
    throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
  }

  const yaw = camera.yaw;
  const radius = camera.radius;
  const x = camera.center.x;
  const y = camera.center.y;
  const z = camera.center.z;

  // Disable the radius-based pitch clamp so the tilt is not forced toward 0
  // when the camera is far from the globe.
  camera.limits.pitchDisabledRadiusScale = null;

  // Apply the pitch together with the existing radius, so the clamp sees the
  // current zoom and the zoom itself is not altered.
  setGeospatialOrientation(camera, { yaw, pitch, radius, center: { x, y, z } });

  const ok =
    Math.abs(camera.pitch - pitch) < EPSILON &&
    Math.abs(camera.yaw - yaw) < EPSILON &&
    Math.abs(camera.radius - radius) < EPSILON &&
    Math.abs(camera.center.x - x) < EPSILON &&
    Math.abs(camera.center.y - y) < EPSILON &&
    Math.abs(camera.center.z - z) < EPSILON;

  if (!ok) {
    throw new Error(
      `tiltGlobeCamera: camera did not take pitch ${pitch} ` +
        `(pitch=${camera.pitch}, pitchMin=${camera.limits.pitchMin}, pitchMax=${camera.limits.pitchMax})`,
    );
  }
}

import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

// Relative tolerance for comparing the camera pose with the requested place.
const RELATIVE_TOLERANCE = 1e-5;
// Absolute tolerance for angles (radians).
const ANGLE_TOLERANCE = 1e-5;
const TWO_PI = Math.PI * 2;

/** Smallest absolute difference between two angles, in radians. */
function angleDelta(a: number, b: number): number {
  const d = (((a - b) % TWO_PI) + TWO_PI) % TWO_PI;
  return Math.min(d, TWO_PI - d);
}

/**
 * True when the camera's pose matches `place`. The library's fly resolves
 * (rather than rejects) when it is interrupted, so the promise alone cannot
 * tell whether the camera arrived; comparing the pose can.
 */
function isAt(camera: GeospatialCamera, place: Place): boolean {
  const scale = Math.max(1, Math.abs(place.radius));
  const tol = RELATIVE_TOLERANCE * scale;
  const c = camera.center;
  const t = place.center;
  return (
    angleDelta(camera.yaw, place.yaw) <= ANGLE_TOLERANCE &&
    angleDelta(camera.pitch, place.pitch) <= ANGLE_TOLERANCE &&
    Math.abs(camera.radius - place.radius) <= tol &&
    Math.abs(c.x - t.x) <= tol &&
    Math.abs(c.y - t.y) <= tol &&
    Math.abs(c.z - t.z) <= tol
  );
}

/**
 * Smoothly flies `camera` to `place` over about `durationMs`, driven by the
 * scene's render loop. Resolves `true` if the camera ended at `place`, and
 * `false` if the flight was stopped before reaching it (for example by another
 * fly-to on the same camera) or if the flight failed. Never rejects.
 */
export async function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number,
): Promise<boolean> {
  try {
    await flyGeospatialCameraToAsync(camera, scene, {
      yaw: place.yaw,
      pitch: place.pitch,
      radius: place.radius,
      center: { x: place.center.x, y: place.center.y, z: place.center.z },
      durationMs,
    });
    return isAt(camera, place);
  } catch {
    return false;
  }
}

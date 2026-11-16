import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

const TWO_PI = Math.PI * 2;
const POSE_TOLERANCE = 1e-6;

/** Smallest absolute difference between two angles, in radians. */
function angleDistance(a: number, b: number): number {
  let d = (a - b) % TWO_PI;
  if (d > Math.PI) d -= TWO_PI;
  if (d < -Math.PI) d += TWO_PI;
  return Math.abs(d);
}

/** Relative-or-absolute closeness check for scalar values. */
function isClose(a: number, b: number): boolean {
  return Math.abs(a - b) <= POSE_TOLERANCE * Math.max(1, Math.abs(b));
}

/**
 * The library's fly function resolves (never rejects) both when a flight
 * completes and when it is cut short by a newer flight or by user input, so
 * the promise alone cannot say which happened. Compare the camera's pose with
 * the requested place instead.
 */
function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
  return (
    angleDistance(camera.yaw, place.yaw) <= POSE_TOLERANCE &&
    isClose(camera.pitch, place.pitch) &&
    isClose(camera.radius, place.radius) &&
    isClose(camera.center.x, place.center.x) &&
    isClose(camera.center.y, place.center.y) &&
    isClose(camera.center.z, place.center.z)
  );
}

/**
 * Smoothly flies the camera to `place` over about `durationMs`.
 *
 * Resolves `true` if the camera ended at `place`, `false` if the flight was
 * stopped before reaching it (by another fly-to, user input, or an error).
 * Never rejects.
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
  } catch {
    return false;
  }
  return isAtPlace(camera, place);
}

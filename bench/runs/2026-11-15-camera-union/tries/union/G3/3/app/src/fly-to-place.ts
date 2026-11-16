import {
  flyGeospatialCameraToAsync,
  getEffectivePitchMax,
  normalizeRadians,
} from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

// Relative tolerance for comparing the final camera pose with the place.
const REL_TOL = 1e-5;

function near(a: number, b: number, scale: number): boolean {
  return Math.abs(a - b) <= REL_TOL * Math.max(1, scale);
}

/**
 * True if the camera's current pose is the place. The library's fly promise
 * resolves both when a flight arrives and when it is cut short, so arrival is
 * decided by comparing the final pose with the target pose.
 */
function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
  const limits = camera.limits;

  // yaw is read back wrapped to [-PI, PI), so compare the shortest difference.
  if (Math.abs(normalizeRadians(camera.yaw - place.yaw)) > REL_TOL) return false;

  // Pitch is clamped against the radius (pitchMin and the radius-dependent max),
  // so the expected pitch is the place pitch after the same clamp.
  const expectedPitch = Math.min(
    Math.max(place.pitch, limits.pitchMin),
    getEffectivePitchMax(limits, place.radius),
  );
  if (!near(camera.pitch, expectedPitch, 1)) return false;

  if (!near(camera.radius, place.radius, place.radius)) return false;

  const c = camera.center;
  const p = place.center;
  const scale = Math.hypot(p.x, p.y, p.z);
  return near(c.x, p.x, scale) && near(c.y, p.y, scale) && near(c.z, p.z, scale);
}

/**
 * Flies the camera to `place` over about `durationMs`, driven by the scene's
 * render loop. Resolves true if the camera arrived at the place, false if the
 * flight was stopped before it got there. Never rejects.
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
      // Copy so the camera never holds a reference to the caller's object.
      center: { x: place.center.x, y: place.center.y, z: place.center.z },
      durationMs,
    });
    return isAtPlace(camera, place);
  } catch {
    return false;
  }
}

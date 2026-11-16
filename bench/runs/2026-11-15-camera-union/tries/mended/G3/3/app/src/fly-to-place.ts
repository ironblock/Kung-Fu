import {
  clampCenterFromPoles,
  flyGeospatialCameraToAsync,
  getEffectivePitchMax,
  normalizeRadians,
} from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// Angles are compared in radians after wrapping; distances are relative to planetRadius.
const ANGLE_TOLERANCE = 1e-6;
const DISTANCE_TOLERANCE_RELATIVE = 1e-6;

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), hi);
}

// flyGeospatialCameraToAsync resolves both when it arrives and when it is cut short,
// so the promise alone cannot say which happened. Compare the camera's final pose with
// the place, applying the same clamps the camera applies to the goal.
function hasArrived(camera: GeospatialCamera, place: Place): boolean {
  const limits = camera.limits;
  const tolerance = DISTANCE_TOLERANCE_RELATIVE * limits.planetRadius;

  const radius = clamp(place.radius, limits.radiusMin, limits.radiusMax);
  const pitch = clamp(place.pitch, limits.pitchMin, getEffectivePitchMax(limits, radius));
  const center = clampCenterFromPoles({ x: place.center.x, y: place.center.y, z: place.center.z });

  if (Math.abs(normalizeRadians(camera.yaw - place.yaw)) > ANGLE_TOLERANCE) return false;
  if (Math.abs(normalizeRadians(camera.pitch - pitch)) > ANGLE_TOLERANCE) return false;
  if (Math.abs(camera.radius - radius) > tolerance) return false;

  const dx = camera.center.x - center.x;
  const dy = camera.center.y - center.y;
  const dz = camera.center.z - center.z;
  return Math.hypot(dx, dy, dz) <= tolerance;
}

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
    // The library says this promise never rejects. If it does, judge by the pose below.
  }
  return hasArrived(camera, place);
}

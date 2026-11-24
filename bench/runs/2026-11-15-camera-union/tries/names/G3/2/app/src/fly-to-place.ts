import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// Tolerances for deciding whether the camera is at the place after a flight settles.
const ANGLE_TOLERANCE = 1e-6; // radians
const LENGTH_RELATIVE_TOLERANCE = 1e-6;

// Incremented on every call to flyToPlace, so a call superseded by a later
// flyToPlace call reports false even if the later call targets the same place.
let latestFlightId = 0;

function angleClose(a: number, b: number): boolean {
  // Compare angles on the circle so that e.g. π and -π count as equal.
  const d = a - b;
  return Math.abs(Math.atan2(Math.sin(d), Math.cos(d))) <= ANGLE_TOLERANCE;
}

function lengthClose(a: number, b: number): boolean {
  return Math.abs(a - b) <= LENGTH_RELATIVE_TOLERANCE * Math.max(1, Math.abs(b));
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
  return (
    angleClose(camera.yaw, place.yaw) &&
    angleClose(camera.pitch, place.pitch) &&
    lengthClose(camera.radius, place.radius) &&
    lengthClose(camera.center.x, place.center.x) &&
    lengthClose(camera.center.y, place.center.y) &&
    lengthClose(camera.center.z, place.center.z)
  );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`.
 *
 * Resolves true if the camera ended up at `place`, false if the flight was
 * stopped before getting there (superseded by another fly-to, interrupted, or
 * failed). Never rejects.
 */
export async function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number,
): Promise<boolean> {
  const flightId = ++latestFlightId;

  try {
    await flyGeospatialCameraToAsync(camera, scene, {
      yaw: place.yaw,
      pitch: place.pitch,
      radius: place.radius,
      center: { x: place.center.x, y: place.center.y, z: place.center.z },
      durationMs,
    });
  } catch {
    // A failed or cancelled flight is handled below by checking where the camera is.
  }

  // Another flyToPlace call started while this one was running.
  if (flightId !== latestFlightId) {
    return false;
  }

  // The library's fly promise does not report whether it completed, and a
  // fly-to started elsewhere in the app also ends this one. So judge arrival
  // by the camera's actual state.
  return isAtPlace(camera, place);
}

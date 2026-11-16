import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

// Latest flyToPlace call per camera. A call whose ticket is no longer the latest was superseded by a newer call.
const latestTicket = new WeakMap<GeospatialCamera, object>();

// Relative tolerance for "the camera is at the place" after the flight resolves.
const ARRIVAL_EPSILON = 1e-6;

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
  const scale = Math.max(1, camera.limits.planetRadius, place.radius);
  const linearTol = ARRIVAL_EPSILON * scale;

  // Yaw is wrapped to [-PI, PI), so compare as an angle.
  const yawDelta = camera.yaw - place.yaw;
  const yawOk = Math.abs(Math.atan2(Math.sin(yawDelta), Math.cos(yawDelta))) <= ARRIVAL_EPSILON;

  const pitchOk = Math.abs(camera.pitch - place.pitch) <= ARRIVAL_EPSILON;
  const radiusOk = Math.abs(camera.radius - place.radius) <= linearTol;
  const centerOk =
    Math.abs(camera.center.x - place.center.x) <= linearTol &&
    Math.abs(camera.center.y - place.center.y) <= linearTol &&
    Math.abs(camera.center.z - place.center.z) <= linearTol;

  return yawOk && pitchOk && radiusOk && centerOk;
}

/**
 * Flies the camera to `place` over about `durationMs`, driven by the scene's render loop.
 *
 * Resolves true if the camera is at the place when the flight ends, false otherwise
 * (stopped by another flight, by user input, or superseded by a later flyToPlace on the same camera).
 * Never rejects.
 */
export async function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number,
): Promise<boolean> {
  const ticket = {};
  latestTicket.set(camera, ticket);

  try {
    // The library's flight resolves (does not reject) when cut short by a newer flight or by input.
    await flyGeospatialCameraToAsync(camera, scene, {
      yaw: place.yaw,
      pitch: place.pitch,
      radius: place.radius,
      center: { x: place.center.x, y: place.center.y, z: place.center.z },
      durationMs,
    });
  } catch {
    // Not expected to happen; any failure counts as not arrived.
  }

  if (latestTicket.get(camera) !== ticket) {
    return false; // superseded by a later flyToPlace on this camera
  }
  latestTicket.delete(camera);

  return isAtPlace(camera, place);
}

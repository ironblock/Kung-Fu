import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// Tolerances for deciding that the camera sits at the place after a flight.
// Angles are compared in radians; lengths are compared relative to the planet radius.
const ANGLE_TOLERANCE = 1e-6;
const LENGTH_TOLERANCE_RELATIVE = 1e-6;

const TWO_PI = 2 * Math.PI;

// Wrap an angle difference into [-PI, PI) so that e.g. PI and -PI compare as equal.
function wrapAngle(angle: number): number {
  let wrapped = (angle + Math.PI) % TWO_PI;
  if (wrapped < 0) wrapped += TWO_PI;
  return wrapped - Math.PI;
}

function angleClose(a: number, b: number): boolean {
  return Math.abs(wrapAngle(a - b)) <= ANGLE_TOLERANCE;
}

// The flight promise resolves both on arrival and when the flight is cut short,
// and the camera stays where the flight stopped. So check the camera's actual pose.
function cameraIsAt(camera: GeospatialCamera, place: Place): boolean {
  const lengthTolerance = LENGTH_TOLERANCE_RELATIVE * Math.max(1, camera.limits.planetRadius);
  const c = camera.center;
  return (
    angleClose(camera.yaw, place.yaw) &&
    angleClose(camera.pitch, place.pitch) &&
    Math.abs(camera.radius - place.radius) <= lengthTolerance &&
    Math.abs(c.x - place.center.x) <= lengthTolerance &&
    Math.abs(c.y - place.center.y) <= lengthTolerance &&
    Math.abs(c.z - place.center.z) <= lengthTolerance
  );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`.
 * Resolves true if the camera ended at the place, false if the flight was
 * stopped early (by a newer flight, user input, or an error). Never rejects.
 */
export async function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number
): Promise<boolean> {
  try {
    await flyGeospatialCameraToAsync(camera, scene, {
      yaw: place.yaw,
      pitch: place.pitch,
      radius: place.radius,
      // Copy so the library never holds a reference to the caller's object.
      center: { x: place.center.x, y: place.center.y, z: place.center.z },
      durationMs,
    });
    return cameraIsAt(camera, place);
  } catch {
    return false;
  }
}

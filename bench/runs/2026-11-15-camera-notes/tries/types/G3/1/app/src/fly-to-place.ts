import {
  flyGeospatialCameraToAsync,
  normalizeRadians,
  type GeospatialCamera,
  type SceneContext,
} from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

/** Angular tolerance (radians) for deciding the camera reached yaw/pitch. */
const ANGLE_TOLERANCE = 1e-5;
/** Distance tolerance as a fraction of the planet radius, for radius and centre. */
const DISTANCE_TOLERANCE_RATIO = 1e-6;

/**
 * Fly the camera to `place` over about `durationMs`.
 *
 * Resolves `true` if the camera ends at `place`, and `false` if the flight was
 * stopped before arriving (another fly-to, user input, or any other interruption).
 * Never rejects.
 *
 * The library's flight promise resolves on interruption without saying whether
 * the target was reached, so arrival is decided by comparing the camera's pose
 * with `place` once the promise settles.
 */
export function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number,
): Promise<boolean> {
  let flight: Promise<void>;
  try {
    flight = flyGeospatialCameraToAsync(camera, scene, {
      yaw: place.yaw,
      pitch: place.pitch,
      radius: place.radius,
      center: { x: place.center.x, y: place.center.y, z: place.center.z },
      durationMs,
    });
  } catch {
    return Promise.resolve(false);
  }

  return flight.then(
    () => {
      try {
        return isAtPlace(camera, place);
      } catch {
        return false;
      }
    },
    () => false,
  );
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
  const distanceTolerance = DISTANCE_TOLERANCE_RATIO * camera.limits.planetRadius;

  const centerDistance = Math.hypot(
    camera.center.x - place.center.x,
    camera.center.y - place.center.y,
    camera.center.z - place.center.z,
  );

  return (
    Math.abs(normalizeRadians(camera.yaw - place.yaw)) <= ANGLE_TOLERANCE &&
    Math.abs(normalizeRadians(camera.pitch - place.pitch)) <= ANGLE_TOLERANCE &&
    Math.abs(camera.radius - place.radius) <= distanceTolerance &&
    centerDistance <= distanceTolerance
  );
}

import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

// Angles in radians. Lengths are relative to the planet radius.
const ANGLE_TOLERANCE = 1e-4;
const LENGTH_TOLERANCE = 1e-6;
// If the library's flight promise has not settled this long after the
// nominal duration, settle from the camera's actual state instead.
const WATCHDOG_GRACE_MS = 5000;

function angleDelta(a: number, b: number): number {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

function hasArrived(camera: GeospatialCamera, place: Place): boolean {
  const scale = camera.limits.planetRadius;
  const dx = camera.center.x - place.center.x;
  const dy = camera.center.y - place.center.y;
  const dz = camera.center.z - place.center.z;
  return (
    angleDelta(camera.yaw, place.yaw) <= ANGLE_TOLERANCE &&
    Math.abs(camera.pitch - place.pitch) <= ANGLE_TOLERANCE &&
    Math.abs(camera.radius - place.radius) <= LENGTH_TOLERANCE * scale &&
    Math.hypot(dx, dy, dz) <= LENGTH_TOLERANCE * scale
  );
}

/**
 * Flies the camera to `place` using the library's geospatial fly-to.
 * Resolves true if the camera is at `place` when the flight ends, false if
 * the flight was stopped short (including by another fly-to). Never rejects.
 */
export function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number,
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let settled = false;
    let watchdog: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      if (settled) return;
      settled = true;
      if (watchdog !== undefined) clearTimeout(watchdog);
      try {
        resolve(hasArrived(camera, place));
      } catch {
        resolve(false);
      }
    };

    watchdog = setTimeout(finish, durationMs + WATCHDOG_GRACE_MS);

    let flight: Promise<void>;
    try {
      flight = flyGeospatialCameraToAsync(camera, scene, {
        yaw: place.yaw,
        pitch: place.pitch,
        radius: place.radius,
        center: place.center,
        durationMs,
      });
    } catch {
      finish();
      return;
    }

    // Resolved, rejected, or cancelled: the outcome is decided by where the camera ended up.
    flight.then(finish, finish);
  });
}

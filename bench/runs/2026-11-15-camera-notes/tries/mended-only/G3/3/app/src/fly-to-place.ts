import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// Relative tolerance for "the camera is at the place". The flight may end
// exactly on the goal, but angles read back wrapped and centers may be
// recomputed, so allow a little float slack.
const REL_TOL = 1e-5;

/** Smallest absolute difference between two angles, honouring the [-PI, PI) wrap. */
function angleDelta(a: number, b: number): number {
  const TWO_PI = 2 * Math.PI;
  let d = (a - b) % TWO_PI;
  if (d > Math.PI) d -= TWO_PI;
  if (d < -Math.PI) d += TWO_PI;
  return Math.abs(d);
}

/**
 * Reads the camera back and checks it sits at `place`.
 * The fly-to promise resolves both when the flight completes and when it is
 * cut short, so arrival has to be judged from the camera's actual pose.
 */
function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
  const radiusScale = Math.max(1, Math.abs(place.radius));
  const centerScale = Math.max(
    1,
    Math.hypot(place.center.x, place.center.y, place.center.z),
  );

  const c = camera.center;
  const centerErr = Math.hypot(
    c.x - place.center.x,
    c.y - place.center.y,
    c.z - place.center.z,
  );

  return (
    angleDelta(camera.yaw, place.yaw) <= REL_TOL &&
    angleDelta(camera.pitch, place.pitch) <= REL_TOL &&
    Math.abs(camera.radius - place.radius) <= REL_TOL * radiusScale &&
    centerErr <= REL_TOL * centerScale
  );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`, driven by the
 * scene's render loop. Resolves once the flight is over and never rejects:
 * `true` if the camera is at the place, `false` if the flight was stopped
 * short (another fly-to, input, or an error).
 */
export async function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number,
): Promise<boolean> {
  try {
    await flyGeospatialCameraToAsync(
      camera,
      scene,
      {
        yaw: place.yaw,
        pitch: place.pitch,
        radius: place.radius,
        center: { x: place.center.x, y: place.center.y, z: place.center.z },
      },
      durationMs,
    );
  } catch {
    return false;
  }
  return isAtPlace(camera, place);
}

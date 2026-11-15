import {
  clampCenterFromPoles,
  flyGeospatialCameraToAsync,
  type GeospatialCamera,
  type SceneContext,
} from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

// Tolerances for deciding that the camera sits at the place.
const ANGLE_TOL = 1e-5; // radians, for yaw and pitch
const REL_TOL = 1e-5; // relative, for radius and centre components

function closeRel(actual: number, expected: number): boolean {
  return Math.abs(actual - expected) <= REL_TOL * Math.max(1, Math.abs(expected));
}

// Signed difference a - b wrapped into [-PI, PI). Yaw is wrapped by the camera,
// so the place's yaw may be outside that range.
function angleDiff(a: number, b: number): number {
  const TAU = 2 * Math.PI;
  let d = (a - b) % TAU;
  if (d >= Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
  // The camera clamps a centre on the pole axis, so compare against the clamped centre.
  const center = clampCenterFromPoles({
    x: place.center.x,
    y: place.center.y,
    z: place.center.z,
  });
  return (
    Math.abs(angleDiff(camera.yaw, place.yaw)) <= ANGLE_TOL &&
    Math.abs(camera.pitch - place.pitch) <= ANGLE_TOL &&
    closeRel(camera.radius, place.radius) &&
    closeRel(camera.center.x, center.x) &&
    closeRel(camera.center.y, center.y) &&
    closeRel(camera.center.z, center.z)
  );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`, driven by the
 * scene's render loop. Resolves true if the camera is at the place when the
 * flight ends, false if the flight was stopped first (by another fly-to, user
 * input, or an error). Never rejects.
 */
export async function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number,
): Promise<boolean> {
  try {
    // The library resolves (not rejects) when a flight is interrupted, so the
    // outcome is decided by checking where the camera ended up.
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

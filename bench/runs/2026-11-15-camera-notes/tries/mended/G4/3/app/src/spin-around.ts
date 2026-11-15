import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TAU = Math.PI * 2;

// Each flight turns the short way round, so a single flight can never span a full
// turn. Four quarter-turn flights, each heading eastward, make one full turn.
const SEGMENTS = 4;

// Constant angular speed: easing each segment would stop the camera at every quarter turn.
const linear = (g: number): number => g;

// Wraps an angle into [-PI, PI), matching how geospatial yaw reads back.
function wrapAngle(a: number): number {
  return a - TAU * Math.floor((a + Math.PI) / TAU);
}

/**
 * Turns the geospatial camera's heading one full turn eastward (increasing yaw)
 * over roughly `durationMs` of the scene's render loop. The centre, pitch and
 * radius are left as they are. Resolves when the turn completes, or early if
 * the camera is moved by something else (user input, another flight, a limit).
 */
export async function spinAround(
  camera: GeospatialCamera,
  scene: SceneContext,
  durationMs: number,
): Promise<void> {
  if (!(durationMs > 0)) return;

  const startYaw = camera.yaw;
  const startRadius = camera.radius;
  const startCenter = { x: camera.center.x, y: camera.center.y, z: camera.center.z };
  const centerTol = 1e-9 * Math.max(1, Math.hypot(startCenter.x, startCenter.y, startCenter.z));
  const radiusTol = 1e-9 * Math.max(1, Math.abs(startRadius));
  const segmentMs = durationMs / SEGMENTS;

  for (let k = 1; k <= SEGMENTS; k++) {
    // The last target is the exact starting heading, so the turn ends where it began.
    const target = k === SEGMENTS ? startYaw : wrapAngle(startYaw + (TAU * k) / SEGMENTS);

    await flyGeospatialCameraToAsync(camera, scene, {
      yaw: target,
      durationMs: segmentMs,
      ease: linear,
    });

    // A flight that was cut short, or input that moved the camera, leaves it off-course.
    // Stop rather than fight the user.
    const yawOff = Math.abs(wrapAngle(camera.yaw - target)) > 1e-4;
    const centerMoved =
      Math.abs(camera.center.x - startCenter.x) > centerTol ||
      Math.abs(camera.center.y - startCenter.y) > centerTol ||
      Math.abs(camera.center.z - startCenter.z) > centerTol;
    const radiusMoved = Math.abs(camera.radius - startRadius) > radiusTol;
    if (yawOff || centerMoved || radiusMoved) return;
  }
}

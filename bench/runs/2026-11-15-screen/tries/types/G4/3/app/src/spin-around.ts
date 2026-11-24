import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const SEGMENTS = 4;
const QUARTER_TURN = Math.PI / 2;
const YAW_TOLERANCE = 1e-3;

/** Wrap an angle to [-π, π). */
function wrapAngle(angle: number): number {
  const twoPi = 2 * Math.PI;
  let a = (angle + Math.PI) % twoPi;
  if (a < 0) a += twoPi;
  return a - Math.PI;
}

/** Constant angular speed within each segment, so there is no stop at a join. */
const linear = (g: number): number => g;

/**
 * Turn the camera one full turn eastward (increasing yaw) about its centre,
 * over roughly `durationMs` of the render loop. Centre, pitch and radius are
 * untouched, and the camera ends at the yaw it started with.
 *
 * `flyGeospatialCameraToAsync` takes the shortest angular path, so a single
 * 2π flight would not move at all. The turn is therefore split into quarter
 * turns of +π/2 each, which the shortest path always resolves eastward.
 *
 * Resolves early if the turn is interrupted (e.g. by user input or another flight).
 */
export async function spinAround(
  camera: GeospatialCamera,
  scene: SceneContext,
  durationMs: number,
): Promise<void> {
  const startYaw = wrapAngle(camera.yaw);
  const segmentMs = durationMs / SEGMENTS;

  for (let k = 1; k <= SEGMENTS; k++) {
    const targetYaw = wrapAngle(startYaw + k * QUARTER_TURN);

    await flyGeospatialCameraToAsync(camera, scene, {
      yaw: targetYaw,
      durationMs: segmentMs,
      centerHopScale: 0,
      ease: linear,
    });

    // The flight resolves both on completion and on interruption; only
    // continue if the camera actually reached this segment's target yaw.
    if (Math.abs(wrapAngle(camera.yaw - targetYaw)) > YAW_TOLERANCE) {
      return;
    }
  }
}

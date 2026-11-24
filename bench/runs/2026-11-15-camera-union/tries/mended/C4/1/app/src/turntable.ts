import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

const TWO_PI = 2 * Math.PI;

// interpolateArcRotateCamera moves alpha the short way round, so a single goal
// more than half a turn away would turn back. Each leg is kept well under a
// half turn, and the legs are chained so the total sweep is always positive.
const MAX_LEG = 0.75 * Math.PI;

/**
 * Glides the orbit camera `turns` full turns in the direction in which alpha
 * grows. Distance, beta and the look-at target are left unchanged. Resolves
 * with alpha equal to its starting value plus 2π · turns.
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError(`spinAround: turns must be a finite number >= 0, got ${turns}`);
  }
  // Limits would clamp the goal alpha, so the camera could not end at start + 2π · turns.
  if (camera.lowerAlphaLimit !== undefined || camera.upperAlphaLimit !== undefined) {
    throw new Error("spinAround: alpha limits are set, so a full spin cannot reach its end alpha");
  }
  if (turns === 0) return;

  const start = camera.alpha;
  const beta = camera.beta;
  const radius = camera.radius;
  const total = TWO_PI * turns;
  const end = start + total;
  const legs = Math.ceil(total / MAX_LEG);

  for (let i = 1; i <= legs; i++) {
    const goalAlpha = i === legs ? end : start + (total * i) / legs;
    // Legs run one after another, never overlapping, so no other call touches the camera mid-leg.
    await interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha, beta, radius });
  }
}

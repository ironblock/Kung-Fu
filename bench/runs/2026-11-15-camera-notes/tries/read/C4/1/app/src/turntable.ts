import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// interpolateArcRotateCamera takes the shortest arc for alpha, so a single goal
// of start + 2π·turns would go the wrong way (or not move at all for whole turns).
// Each leg is therefore kept safely under π, and legs are chained in the forward direction.
const MAX_LEG = 0.9 * Math.PI;

/**
 * Glides an arc-rotate camera around its target by `turns` full turns in the
 * direction in which alpha grows. Distance, beta and the look-at point are kept.
 * Resolves with alpha equal to its starting value plus 2π·turns.
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError(`spinAround: turns must be a finite number >= 0, got ${turns}`);
  }

  const start = camera.alpha;
  const total = 2 * Math.PI * turns;
  if (total === 0) return;

  const end = start + total;
  const lower = camera.lowerAlphaLimit ?? -Infinity;
  const upper = camera.upperAlphaLimit ?? Infinity;
  if (start < lower || end > upper) {
    // Limits are applied to every alpha goal, so the end angle could not be reached.
    throw new RangeError("spinAround: the requested alpha range is outside the camera's alpha limits");
  }

  const legs = Math.ceil(total / MAX_LEG);
  for (let k = 1; k <= legs; k++) {
    const goalAlpha = k === legs ? end : start + (total * k) / legs;
    await interpolateArcRotateCamera(camera, scene, {
      alpha: goalAlpha,
      // Hold distance, height angle and look-at point at their current values.
      beta: camera.beta,
      radius: camera.radius,
      target: { x: camera.target.x, y: camera.target.y, z: camera.target.z },
    });
  }
}

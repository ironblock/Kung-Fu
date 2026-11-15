import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

const TWO_PI = 2 * Math.PI;

/**
 * Glides an arc-rotate camera around its target by `turns` full turns, in the
 * direction in which `alpha` grows. Distance, beta and target are left alone.
 *
 * interpolateArcRotateCamera takes the short way round to its goal alpha, so a
 * single call cannot turn more than half a revolution in the growing direction.
 * The turn is therefore split into legs that each turn by less than PI, run one
 * after another. The last leg ends on exactly `start + 2π · turns`.
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError("spinAround: turns must be a finite, non-negative number");
  }

  const total = TWO_PI * turns;
  if (total === 0) {
    return;
  }

  const start = camera.alpha;
  // Each leg must be strictly under PI so that the short way is the growing way.
  const legs = Math.floor(total / Math.PI) + 1;

  for (let i = 1; i <= legs; i++) {
    const goalAlpha = i === legs ? start + total : start + (total * i) / legs;
    await interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
  }
}

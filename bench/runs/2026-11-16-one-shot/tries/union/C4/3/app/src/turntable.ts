import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

// interpolateArcRotateCamera moves alpha along the shortest arc modulo 2*PI.
// A single goal more than PI away from the start would therefore turn the
// wrong way. Split the sweep into steps shorter than PI, so every step runs
// in the direction in which alpha grows.
const MAX_STEP = 0.9 * Math.PI;

export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError("turns must be a finite, non-negative number");
  }

  const start = camera.alpha;
  const total = 2 * Math.PI * turns;
  if (total === 0) {
    return;
  }

  const steps = Math.ceil(total / MAX_STEP);
  for (let k = 1; k <= steps; k++) {
    // Only alpha is given, so beta, radius and target keep their current values.
    // The final goal is computed directly so the end alpha is exactly start + 2*PI*turns.
    const goal = k === steps ? start + total : start + (total * k) / steps;
    await interpolateArcRotateCamera(camera, scene, { alpha: goal });
  }
}

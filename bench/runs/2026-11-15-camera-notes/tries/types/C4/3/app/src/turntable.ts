import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// interpolateArcRotateCamera moves alpha along the *shortest* arc to each goal,
// so a single goal of `start + 2π·turns` would go the wrong way (or not move at
// all for whole turns). Split the spin into forward-only legs, each strictly
// under π, so every leg's shortest arc is the positive direction.
const MAX_LEG_RADIANS = (2 * Math.PI) / 3;

// Tolerance for the final alpha correction after the last leg has arrived.
const ARRIVAL_EPSILON = 1e-9;

/**
 * Glide the orbit camera forward (increasing alpha) by `turns` full turns.
 * Distance, beta and target are left untouched. Resolves once alpha has
 * reached `start + 2π · turns`.
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!(turns >= 0) || !Number.isFinite(turns)) {
    throw new RangeError(`spinAround: turns must be a finite number >= 0, got ${turns}`);
  }

  const start = camera.alpha;
  const total = 2 * Math.PI * turns;
  if (total === 0) return;

  const end = start + total;
  const legs = Math.ceil(total / MAX_LEG_RADIANS);

  for (let i = 1; i <= legs; i++) {
    const goal = i === legs ? end : start + (total * i) / legs;
    // Only alpha is supplied, so beta, radius and target keep their current values.
    await interpolateArcRotateCamera(camera, scene, { alpha: goal });
  }

  if (Math.abs(camera.alpha - end) > ARRIVAL_EPSILON) {
    camera.alpha = end;
  }
}

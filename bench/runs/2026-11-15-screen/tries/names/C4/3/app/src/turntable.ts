import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

// Largest alpha change requested in a single interpolation. Keeping each leg
// at or below a quarter turn means the library never has to choose between
// two angular directions, so alpha always grows, even for whole turns.
const MAX_STEP = Math.PI / 2;

/**
 * Glides an arc-rotate camera around its target by `turns` full turns,
 * always increasing `alpha`. Distance (`radius`), height (`beta`) and the
 * look-at point (`target`) are left untouched. Resolves once the camera has
 * reached `alpha + 2π · turns`.
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError(`spinAround: turns must be a non-negative finite number, got ${turns}`);
  }

  const totalDelta = 2 * Math.PI * turns;
  if (totalDelta === 0) {
    return;
  }

  const startAlpha = camera.alpha;
  const steps = Math.ceil(totalDelta / MAX_STEP);
  const stepDelta = totalDelta / steps;

  for (let i = 1; i <= steps; i++) {
    // Only alpha is given, so beta, radius and target keep their current values.
    const goalAlpha = i === steps ? startAlpha + totalDelta : startAlpha + stepDelta * i;
    await interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
  }
}

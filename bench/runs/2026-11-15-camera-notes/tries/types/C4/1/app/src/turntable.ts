import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Largest alpha step per transition. `interpolateArcRotateCamera` moves along
 * the shortest arc to its goal, so a goal more than π away (or exactly 2π
 * away) would be taken the short way round or not at all. Keeping every step
 * at or below π/2 guarantees each leg runs in the intended direction.
 */
const MAX_STEP = Math.PI / 2;

/**
 * Glide the camera around the model by `turns` full turns, in the direction
 * in which `alpha` grows. Distance, beta and target are left untouched.
 *
 * The turn is split into legs of at most π/2 and each leg uses the library's
 * own smooth transition. The promise resolves when the final leg has arrived,
 * with `alpha` equal to its starting value plus `2π · turns`.
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError(`spinAround: turns must be a finite non-negative number, got ${turns}`);
  }

  const startAlpha = camera.alpha;
  const totalAngle = 2 * Math.PI * turns;
  const targetAlpha = startAlpha + totalAngle;

  if (totalAngle === 0) {
    return;
  }

  const legs = Math.ceil(totalAngle / MAX_STEP);
  const step = totalAngle / legs;

  for (let i = 1; i <= legs; i++) {
    // Absolute goals (not relative to the current alpha) so per-leg
    // arrival error does not accumulate. Only alpha is passed, so the
    // radius, beta and target keep their current values.
    const goalAlpha = i === legs ? targetAlpha : startAlpha + step * i;
    await interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
  }

  // Each leg may stop within a small tolerance of its goal. Land exactly on
  // the requested alpha at the end.
  if (camera.alpha !== targetAlpha) {
    camera.alpha = targetAlpha;
  }
}

import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

// interpolateArcRotateCamera moves alpha along the shortest arc to each goal, so a
// single goal of start + 2π·turns would travel the wrong way (or not at all).
// Each leg is kept safely under π so the shortest arc is always the forward one.
const MAX_LEG_RADIANS = 0.9 * Math.PI;

/**
 * Glide an ArcRotateCamera around its target by `turns` full turns in the
 * direction of increasing alpha. Radius, beta and target are left unchanged.
 * Resolves once alpha has reached `startAlpha + 2π · turns`.
 * Rejects if the transition is interrupted (e.g. by user input).
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError(`spinAround: turns must be a finite number >= 0, got ${turns}`);
  }

  const startAlpha = camera.alpha;
  const totalSweep = TWO_PI * turns;
  if (totalSweep === 0) {
    return;
  }

  const endAlpha = startAlpha + totalSweep;
  const legs = Math.ceil(totalSweep / MAX_LEG_RADIANS);

  for (let i = 1; i <= legs; i++) {
    // Absolute goals: each leg starts from wherever the previous one landed,
    // so per-leg error does not accumulate.
    const goalAlpha = i === legs ? endAlpha : startAlpha + (totalSweep * i) / legs;
    await interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
  }

  // Pin the exact final angle so the resolved state matches the contract.
  camera.alpha = endAlpha;
}

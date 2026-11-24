import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Glides an arc-rotate camera around its target by `turns` full turns, in the
 * direction in which alpha grows. Distance, beta and target are left alone.
 *
 * Babylon Lite's interpolateArcRotateCamera always takes the short way round
 * to its goal, so a single call can only cover less than half a turn. The
 * spin is therefore split into legs, each shorter than π, run one after
 * another (a second interpolation on the same camera would reject the first).
 * Each leg's goal is computed from the starting alpha, so the final goal is
 * exactly `start + 2π · turns`.
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!(turns > 0)) {
    return;
  }

  const start = camera.alpha;
  const total = 2 * Math.PI * turns;
  // Smallest leg count that keeps every leg strictly under π.
  const legs = Math.floor(2 * turns) + 1;

  for (let i = 1; i <= legs; i++) {
    const goalAlpha = i === legs ? start + total : start + (total * i) / legs;
    await interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
  }
}

import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * `interpolateArcRotateCamera` always takes the shortest arc to `alpha`, so a
 * goal more than half a turn away would be reached the wrong way round, and a
 * goal exactly one turn away would not move at all. The spin is therefore split
 * into segments of at most a quarter turn, each with an absolute goal that is
 * ahead of the previous one; every segment's shortest arc is then the forward one.
 */
const SEGMENTS_PER_TURN = 4;

/**
 * Glide the orbit camera forward (increasing `alpha`) by `turns` full turns,
 * keeping its radius, beta and target unchanged. Resolves once `alpha` has
 * reached `startAlpha + 2π · turns`.
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError(`spinAround: turns must be a non-negative finite number, got ${turns}`);
  }
  if (turns === 0) return;

  const startAlpha = camera.alpha;
  const sweep = 2 * Math.PI * turns;
  const endAlpha = startAlpha + sweep;

  if (camera.upperAlphaLimit !== undefined && endAlpha > camera.upperAlphaLimit) {
    throw new RangeError("spinAround: the requested sweep would exceed upperAlphaLimit");
  }

  const segments = Math.max(1, Math.ceil(turns * SEGMENTS_PER_TURN - 1e-9));

  for (let k = 1; k <= segments; k++) {
    const goalAlpha = k === segments ? endAlpha : startAlpha + (sweep * k) / segments;
    await interpolateArcRotateCamera(camera, scene, {
      alpha: goalAlpha,
      beta: camera.beta,
      radius: camera.radius,
      target: camera.target,
    });
  }
}

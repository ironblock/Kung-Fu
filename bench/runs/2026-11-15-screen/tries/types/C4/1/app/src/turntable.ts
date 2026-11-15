import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

// interpolateArcRotateCamera moves alpha along the shortest arc to each goal,
// so one goal more than π away would be walked the short way (and a whole-turn
// goal would not move at all). Each segment is kept well under π, and the
// segments are chained, each starting from where the previous one arrived.
const MAX_SEGMENT = Math.PI * 0.75;

/**
 * Glide an orbit camera `turns` full turns in the direction alpha grows.
 * Radius, beta and target are left as they are. Resolves with
 * alpha === startAlpha + 2π · turns once the camera has arrived.
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError(`spinAround: turns must be a finite non-negative number, got ${turns}`);
  }

  const total = 2 * Math.PI * turns;
  if (total === 0) return;

  const startAlpha = camera.alpha;
  const segments = Math.ceil(total / MAX_SEGMENT);

  for (let i = 1; i <= segments; i++) {
    // Goals are absolute and computed from the start pose, so rounding
    // cannot accumulate; the last goal is exactly startAlpha + 2π · turns.
    const goalAlpha = i === segments ? startAlpha + total : startAlpha + (total * i) / segments;
    // Omitted radius, beta and target keep their current values.
    await interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
  }
}

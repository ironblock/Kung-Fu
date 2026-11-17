import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

/**
 * Glides the arc-rotate camera around its target by `turns` full turns,
 * always in the direction in which `alpha` grows, leaving radius, beta and
 * the target point untouched. Resolves once `alpha` has reached
 * start + 2π · turns.
 *
 * A single interpolateArcRotateCamera goal travels the shortest arc modulo
 * 2π, so a goal more than a half-turn away would move the wrong way and a
 * goal a whole turn away would arrive on the first frame. The spin is
 * therefore chained from segments whose deltas are strictly below π: each
 * segment advances in the growing-alpha direction and ends exactly on its
 * goal, so no frame jumps and the final alpha is the unwrapped
 * start + 2π · turns.
 */
export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError("spinAround expects a finite, non-negative number of turns");
  }

  const startAlpha = camera.alpha;
  const total = 2 * Math.PI * turns;
  if (total === 0) {
    return Promise.resolve();
  }

  // Number of chained segments. Keeping every delta below π (the interpolator
  // takes the shortest arc mod 2π) guarantees forward motion each segment.
  const segments = Math.floor(total / Math.PI) + 1;

  let next: Promise<void> = Promise.resolve();
  for (let i = 1; i <= segments; i++) {
    // For i === segments, i / segments is exactly 1, so the final goal is
    // exactly startAlpha + total (unwrapped), not a rounded sum of deltas.
    const goal = startAlpha + total * (i / segments);
    next = next.then(() => interpolateArcRotateCamera(camera, scene, { alpha: goal }));
  }
  return next;
}

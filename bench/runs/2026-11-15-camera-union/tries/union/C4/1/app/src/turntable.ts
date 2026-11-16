import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// interpolateArcRotateCamera takes the shortest arc for alpha (mod 2π), so a single
// goal more than π away from the current alpha would go the wrong way, or not move
// at all. Each segment is kept at π/2 or less and the segments are run one after
// another, each goal being absolute (unwrapped) so alpha keeps growing.
const MAX_SEGMENT = Math.PI / 2;

/**
 * Glides an arc-rotate camera around its target by `turns` full turns, in the
 * direction in which alpha grows. Radius, beta and target are left untouched.
 * Resolves with alpha equal to its starting value plus 2π · turns.
 */
export async function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError(`turns must be a finite, non-negative number, got ${turns}`);
  }

  const start = camera.alpha;
  const total = 2 * Math.PI * turns;
  const end = start + total;

  // Goals are clamped to the alpha limits by the library, so the spin could end
  // short of `end` without any error. Refuse up front instead.
  const lo = camera.lowerAlphaLimit ?? -Infinity;
  const hi = camera.upperAlphaLimit ?? Infinity;
  if (start < lo || end > hi) {
    throw new RangeError("spinAround: the requested alpha range is outside the camera's alpha limits");
  }

  if (total === 0) {
    return;
  }

  const segments = Math.ceil(total / MAX_SEGMENT);
  for (let k = 1; k <= segments; k++) {
    // The last goal is exactly `end`, so the final alpha is start + 2π · turns.
    const goal = k === segments ? end : start + (total * k) / segments;
    await interpolateArcRotateCamera(camera, scene, { alpha: goal });
  }
}

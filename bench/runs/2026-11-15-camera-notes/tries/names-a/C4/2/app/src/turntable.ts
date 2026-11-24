import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

// Each library call covers at most a quarter turn. The interpolation may take the
// shortest angular path between two alpha values, so a single call spanning a full
// turn (or more) could move the camera the wrong way or not at all. Quarter-turn
// steps are unambiguous under either interpretation.
const MAX_STEP_TURNS = 0.25;

/**
 * Glides an arc-rotate camera around its target by `turns` full turns, in the
 * direction in which alpha grows. Distance, beta and target are left untouched.
 * Resolves once the camera has arrived at `startAlpha + 2π · turns`.
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError(`turns must be a finite, non-negative number, got ${turns}`);
  }
  if (turns === 0) {
    return;
  }

  const startAlpha = camera.alpha;
  const totalAngle = TWO_PI * turns;
  const steps = Math.max(1, Math.ceil(turns / MAX_STEP_TURNS));

  for (let k = 1; k <= steps; k++) {
    // Absolute targets computed from the start value avoid accumulating drift;
    // the final step lands exactly on the requested end alpha.
    const alpha = k === steps ? startAlpha + totalAngle : startAlpha + (totalAngle * k) / steps;
    // Only alpha is supplied, so beta, radius and target are not changed.
    await interpolateArcRotateCamera(camera, scene, { alpha });
  }
}

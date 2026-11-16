import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

const TWO_PI = 2 * Math.PI;

// interpolateArcRotateCamera takes the shortest arc of alpha mod 2*PI, so a
// single call cannot cover more than half a turn. Each call is kept well
// under PI so its direction is unambiguous.
const MAX_STEP = 0.9 * Math.PI;

/**
 * Glides the camera's alpha by `turns` full turns in the direction in which
 * alpha grows, using the library's own interpolation easing. Distance, beta
 * and target are not touched. Resolves with alpha === start + 2*PI*turns.
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError("spinAround: turns must be a finite number >= 0");
  }

  const total = TWO_PI * turns;
  if (total === 0) {
    return;
  }

  const startAlpha = camera.alpha;
  const steps = Math.ceil(total / MAX_STEP);

  // Alpha limits would clamp the goals and stop the spin short of
  // start + 2*PI*turns, so they are cleared for the duration and restored after.
  const savedLower = camera.lowerAlphaLimit;
  const savedUpper = camera.upperAlphaLimit;
  camera.lowerAlphaLimit = undefined;
  camera.upperAlphaLimit = undefined;

  try {
    for (let i = 1; i <= steps; i++) {
      // Goals are unwrapped absolute values; the last one is exact.
      const goal = i === steps ? startAlpha + total : startAlpha + (total * i) / steps;
      // Only alpha is in the goal, so beta, radius and target are left alone.
      await interpolateArcRotateCamera(camera, scene, { alpha: goal });
    }
  } finally {
    camera.lowerAlphaLimit = savedLower;
    camera.upperAlphaLimit = savedUpper;
  }
}

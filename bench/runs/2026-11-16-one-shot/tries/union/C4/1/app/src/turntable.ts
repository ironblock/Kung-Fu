import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

// interpolateArcRotateCamera takes the shortest arc for alpha (mod 2*PI), so a
// single goal more than PI away would turn the wrong way. Each segment stays
// well under PI so every step goes in the direction alpha grows.
const MAX_SEGMENT = Math.PI * 0.75;

/**
 * Glides the arc-rotate camera by `turns` full turns in the direction in which
 * alpha grows. Distance, beta and target are not touched. Resolves with
 * alpha === startAlpha + 2*PI*turns.
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError("turns must be a finite number >= 0");
  }

  const total = TWO_PI * turns;
  if (total === 0) {
    return;
  }

  const start = camera.alpha;
  const end = start + total;
  const segments = Math.ceil(total / MAX_SEGMENT);

  // The library clamps alpha goals to the alpha limits, which would stop the
  // tour early. Lift them for the duration and restore them afterwards by
  // direct assignment (setCameraLimits would clamp the pose immediately).
  const savedLower = camera.lowerAlphaLimit;
  const savedUpper = camera.upperAlphaLimit;
  camera.lowerAlphaLimit = undefined;
  camera.upperAlphaLimit = undefined;

  try {
    for (let k = 1; k <= segments; k++) {
      const goal = k === segments ? end : start + (total * k) / segments;
      // Only alpha is given, so beta, radius and target are left alone.
      await interpolateArcRotateCamera(camera, scene, { alpha: goal });
    }
  } finally {
    camera.lowerAlphaLimit = savedLower;
    camera.upperAlphaLimit = savedUpper;
  }
}

import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;
const LIMIT_EPSILON = 1e-6;

export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns)) {
    throw new RangeError("turns must be a finite number");
  }

  const startAlpha = camera.alpha;

  // The request says the tour always moves in the direction alpha grows, so
  // negative values are treated as magnitudes.
  const delta = TWO_PI * Math.abs(turns);
  const goalAlpha = startAlpha + delta;

  const startBeta = camera.beta;
  const startRadius = camera.radius;

  // Temporarily widen alpha limits if they would block the tour.
  const savedLowerAlphaLimit = camera.lowerAlphaLimit;
  const savedUpperAlphaLimit = camera.upperAlphaLimit;
  const minAlpha = Math.min(startAlpha, goalAlpha);
  const maxAlpha = Math.max(startAlpha, goalAlpha);

  if (savedLowerAlphaLimit !== undefined && savedLowerAlphaLimit > minAlpha) {
    camera.lowerAlphaLimit = minAlpha - LIMIT_EPSILON;
  }

  if (savedUpperAlphaLimit !== undefined && savedUpperAlphaLimit < maxAlpha) {
    camera.upperAlphaLimit = maxAlpha + LIMIT_EPSILON;
  }

  // Clear leftover inertia so only the smooth transition drives the camera.
  camera.inertialAlphaOffset = 0;
  camera.inertialBetaOffset = 0;
  camera.inertialRadiusOffset = 0;
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;

  try {
    // Omitting `target` from the goal lets the target stay untouched.
    await interpolateArcRotateCamera(camera, scene, {
      alpha: goalAlpha,
      beta: startBeta,
      radius: startRadius,
    });

    // Guarantee the exact final value required by the caller.
    camera.alpha = goalAlpha;
    camera.beta = startBeta;
    camera.radius = startRadius;

    camera.inertialAlphaOffset = 0;
    camera.inertialBetaOffset = 0;
    camera.inertialRadiusOffset = 0;
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;
  } finally {
    // Restore original alpha limits only when they remain compatible with the
    // finished alpha; otherwise restoring them could clamp and create a jump.
    if (savedLowerAlphaLimit !== undefined && savedLowerAlphaLimit <= goalAlpha) {
      camera.lowerAlphaLimit = savedLowerAlphaLimit;
    }

    if (savedUpperAlphaLimit !== undefined && savedUpperAlphaLimit >= goalAlpha) {
      camera.upperAlphaLimit = savedUpperAlphaLimit;
    }
  }
}

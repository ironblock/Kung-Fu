import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

// interpolateArcRotateCamera takes the shortest arc mod 2π, so a single goal
// more than π away can reverse direction. Use positive sub-goals shorter than π
// so alpha always grows, even for 0.75 / 1 / 2 turns.
const MAX_ALPHA_STEP = Math.PI * 0.9;

export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number
): Promise<void> {
  if (!Number.isFinite(turns) || !Number.isFinite(camera.alpha)) {
    return;
  }

  // Tour values are positive in the examples. Using abs() keeps negative values
  // moving in the direction alpha grows instead of reversing.
  const requestedDelta = TWO_PI * Math.abs(turns);
  if (requestedDelta <= 0) {
    return;
  }

  const startAlpha = camera.alpha;
  const targetAlpha = startAlpha + requestedDelta;

  if (!Number.isFinite(targetAlpha) || targetAlpha <= startAlpha) {
    return;
  }

  const savedLowerAlphaLimit = camera.lowerAlphaLimit;
  const savedUpperAlphaLimit = camera.upperAlphaLimit;
  const hadAlphaLimits =
    savedLowerAlphaLimit !== undefined || savedUpperAlphaLimit !== undefined;

  // Clear residual motion so nothing else can change alpha/beta/radius/target
  // between interpolation frames.
  camera.inertialAlphaOffset = 0;
  camera.inertialBetaOffset = 0;
  camera.inertialRadiusOffset = 0;
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;

  // interpolateArcRotateCamera clamps its goal to the limit fields, so relax
  // alpha limits temporarily to guarantee the unwrapped final alpha.
  if (hadAlphaLimits) {
    camera.lowerAlphaLimit = undefined;
    camera.upperAlphaLimit = undefined;
  }

  let currentAlpha = startAlpha;

  try {
    while (currentAlpha < targetAlpha) {
      const nextAlpha = Math.min(currentAlpha + MAX_ALPHA_STEP, targetAlpha);

      await interpolateArcRotateCamera(camera, scene, { alpha: nextAlpha });

      currentAlpha = nextAlpha;
    }
  } finally {
    if (hadAlphaLimits) {
      camera.lowerAlphaLimit = savedLowerAlphaLimit;
      camera.upperAlphaLimit = savedUpperAlphaLimit;
    }
  }
}

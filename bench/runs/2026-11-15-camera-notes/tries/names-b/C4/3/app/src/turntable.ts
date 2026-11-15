import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

/**
 * Glides an arc-rotate camera around its target by `turns` full turns, always
 * in the direction in which `alpha` grows. Distance (radius), height angle
 * (beta) and the look-at point (target) are left as they are.
 *
 * Resolves once the camera has arrived at `startAlpha + 2π · turns`.
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  const goalAlpha = camera.alpha + 2 * Math.PI * turns;

  // Alpha limits would stop the camera short of the goal, so lift them for the
  // duration of the spin and restore them afterwards.
  const lowerAlphaLimit = camera.lowerAlphaLimit;
  const upperAlphaLimit = camera.upperAlphaLimit;
  camera.lowerAlphaLimit = undefined;
  camera.upperAlphaLimit = undefined;

  try {
    await interpolateArcRotateCamera(camera, scene, {
      alpha: goalAlpha,
      beta: camera.beta,
      radius: camera.radius,
    });
  } finally {
    camera.lowerAlphaLimit = lowerAlphaLimit;
    camera.upperAlphaLimit = upperAlphaLimit;
  }
}

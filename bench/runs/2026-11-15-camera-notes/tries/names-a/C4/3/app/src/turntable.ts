import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

/**
 * Glides an arc-rotate camera around its target by `turns` full turns in the
 * direction in which `alpha` grows. Distance (radius), height angle (beta) and
 * the look-at point (target) are held at their current values. Resolves once
 * the camera has arrived at `startAlpha + 2π · turns`.
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  const goalAlpha = camera.alpha + TWO_PI * turns;

  // Clear any leftover user-input inertia so nothing else moves the camera
  // while the tour runs.
  camera.inertialAlphaOffset = 0;
  camera.inertialBetaOffset = 0;
  camera.inertialRadiusOffset = 0;
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;

  // The goal alpha lies outside any normal alpha range by design, so suspend
  // alpha limits for the duration of the spin and restore them afterwards.
  const { lowerAlphaLimit, upperAlphaLimit } = camera;
  camera.lowerAlphaLimit = undefined;
  camera.upperAlphaLimit = undefined;

  try {
    await interpolateArcRotateCamera(camera, scene, {
      alpha: goalAlpha,
      beta: camera.beta,
      radius: camera.radius,
      target: camera.target,
    });
  } finally {
    camera.lowerAlphaLimit = lowerAlphaLimit;
    camera.upperAlphaLimit = upperAlphaLimit;
  }
}

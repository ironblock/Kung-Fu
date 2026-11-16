import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

/**
 * Glides the orbit camera around its target by `turns` full turns, increasing
 * alpha. Distance (radius), height angle (beta) and target are left untouched.
 * Resolves once the camera has arrived at `startAlpha + 2π · turns`.
 */
export function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  const goalAlpha = camera.alpha + TWO_PI * turns;
  return interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
}

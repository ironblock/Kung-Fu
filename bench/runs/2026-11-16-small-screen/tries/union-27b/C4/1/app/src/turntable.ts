import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

/**
 * Glides the orbit camera around its target by `turns` full turns, always in
 * the direction in which `alpha` grows, using the library's own smooth
 * camera-transition easing. `beta`, `radius` and `target` are left untouched.
 * The returned promise resolves once the camera has arrived, with `alpha`
 * equal to its starting value plus 2π · turns.
 */
export function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  const startAlpha = camera.alpha;
  const goalAlpha = startAlpha + 2 * Math.PI * turns;
  return interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
}

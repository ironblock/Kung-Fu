import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = 2 * Math.PI;

/**
 * Glides an orbit camera around its target by `turns` full turns, in the
 * direction in which `alpha` grows. Distance (radius), height angle (beta)
 * and the look-at point (target) are kept as they are.
 *
 * Resolves once the camera has arrived at `startAlpha + 2π · turns`.
 */
export function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  const goalAlpha = camera.alpha + TWO_PI * turns;

  // The library clamps alpha goals to any alpha limits set on the camera, so a
  // goal outside them would resolve at a different alpha than promised.
  const lower = camera.lowerAlphaLimit;
  const upper = camera.upperAlphaLimit;
  if (
    (lower !== undefined && goalAlpha < lower) ||
    (upper !== undefined && goalAlpha > upper)
  ) {
    return Promise.reject(
      new Error(
        `spinAround: target alpha ${goalAlpha} is outside the camera's alpha limits`,
      ),
    );
  }

  return interpolateArcRotateCamera(camera, scene, {
    alpha: goalAlpha,
    beta: camera.beta,
    radius: camera.radius,
    target: { x: camera.target.x, y: camera.target.y, z: camera.target.z },
  });
}

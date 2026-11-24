import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

/**
 * Glides an arc-rotate camera around its target by `turns` full turns,
 * always increasing `alpha`, using the library's own camera interpolation.
 * Radius, beta (height angle) and target are kept as they are.
 * Resolves once the camera has arrived at `alpha + 2π · turns`.
 */
export function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    return Promise.reject(new RangeError(`turns must be a non-negative finite number, got ${turns}`));
  }

  return interpolateArcRotateCamera(camera, scene, {
    alpha: camera.alpha + 2 * Math.PI * turns,
    beta: camera.beta,
    radius: camera.radius,
    target: camera.target,
  });
}

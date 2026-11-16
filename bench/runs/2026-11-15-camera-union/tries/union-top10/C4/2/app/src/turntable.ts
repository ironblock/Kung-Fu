import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

/**
 * Glides the orbit camera around its target by `turns` full turns, in the
 * direction in which `alpha` grows. Distance, height angle (beta) and the
 * look-at point are kept as they are. Resolves when the camera has arrived at
 * `alpha + 2 * PI * turns`.
 */
export function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  const goal = {
    alpha: camera.alpha + 2 * Math.PI * turns,
    beta: camera.beta,
    radius: camera.radius,
    target: {
      x: camera.target.x,
      y: camera.target.y,
      z: camera.target.z,
    },
  };
  return interpolateArcRotateCamera(camera, scene, goal);
}

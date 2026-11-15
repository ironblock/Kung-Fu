import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

/**
 * Glides an arc-rotate camera around its target by `turns` full turns,
 * always increasing alpha. Distance (radius), height angle (beta) and the
 * look-at point (target) are kept as they are.
 *
 * Resolves once the camera has arrived at alpha0 + 2π · turns.
 */
export function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  // alpha must grow, so use the magnitude of the turn count.
  const sweep = 2 * Math.PI * Math.abs(turns);

  // Pass beta, radius and target at their current values so that only alpha
  // changes. Target is copied, not shared, so the camera's own object is not
  // aliased into the interpolation.
  return interpolateArcRotateCamera(camera, scene, {
    alpha: camera.alpha + sweep,
    beta: camera.beta,
    radius: camera.radius,
    target: {
      x: camera.target.x,
      y: camera.target.y,
      z: camera.target.z,
    },
  });
}

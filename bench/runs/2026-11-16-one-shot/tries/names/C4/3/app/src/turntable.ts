import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
  // Capture the starting state once, so the goal does not drift if the camera changes mid-glide.
  const startAlpha = camera.alpha;
  const beta = camera.beta;
  const radius = camera.radius;
  // Copy the target so the goal does not alias the camera's own vector.
  const target = { x: camera.target.x, y: camera.target.y, z: camera.target.z };

  return interpolateArcRotateCamera(camera, scene, {
    alpha: startAlpha + TWO_PI * turns,
    beta,
    radius,
    target,
  });
}

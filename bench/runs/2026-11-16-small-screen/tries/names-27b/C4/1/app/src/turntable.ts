import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

export function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  const startAlpha = camera.alpha;
  const goalAlpha = startAlpha + Math.PI * 2 * turns;

  return interpolateArcRotateCamera(
    camera,
    scene,
    {
      alpha: goalAlpha,
      beta: camera.beta,
      radius: camera.radius,
      target: camera.target,
    },
  );
}
